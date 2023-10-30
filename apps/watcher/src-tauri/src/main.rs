// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, path::PathBuf};

use tauri::{
    api::{self, path, process::CommandEvent},
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

fn main() {
    let show_watcher_menu_item = CustomMenuItem::new("show_watcher", "Show Watcher");
    let quit_menu_item = CustomMenuItem::new("quit", "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show_watcher_menu_item)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit_menu_item);

    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .setup(|app| {
            let main_window = app
                .get_window("main")
                .expect("An error occurred during getting main window");

            let default_config_path_string = app
                .path_resolver()
                .resolve_resource("config")
                .expect("An error occurred resolving default config directory")
                .into_os_string()
                .into_string()
                .expect("An error occurred converting default config to path string");
            let user_config_path = path::app_config_dir(app.config().as_ref()).unwrap();
            let user_config_path_string = user_config_path.to_str().unwrap();

            let mut env = HashMap::new();
            env.insert(
                String::from("NODE_CONFIG_DIR"),
                format!("{}:{}", default_config_path_string, user_config_path_string),
            );

            let (mut rx, _) = api::process::Command::new_sidecar("watcher-service")
                .expect("An error occurred creating new sidecar")
                .envs(env)
                .current_dir(
                    app.path_resolver()
                        .resource_dir()
                        .expect("An error occurred getting app resources directory"),
                )
                .spawn()
                .expect("An error occurred spawning watcher service");

            tauri::async_runtime::spawn(async move {
                main_window
                    .show()
                    .expect("An error occurred showing main window");

                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Terminated(terminated_payload) = event {
                        let exit_code = terminated_payload
                            .code
                            .expect("An error occurred getting exit code of watcher service");

                        api::dialog::blocking::MessageDialogBuilder::new(
                            "Watcher service terminated unexpectedly",
                            exit_code.to_string(),
                        )
                        .kind(api::dialog::MessageDialogKind::Error)
                        .parent(&main_window)
                        .show();

                        std::process::exit(exit_code)
                    }
                    /*
                     * TODO: Add a mechanism to forward all stdout and stderr
                     * logs to frontend
                     * local:ergo/rosen-bridge/ui#35
                     */
                    if let CommandEvent::Stderr(line) = event {
                        println!("{}", line);
                    }
                }
            });
            Ok(())
        })
        .system_tray(tray)
        .on_system_tray_event(|app, event| {
            if let SystemTrayEvent::MenuItemClick { id, .. } = event {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show_watcher" => {
                        let window = app
                            .get_window("main")
                            .expect("An error occurred getting main window");
                        window
                            .set_focus()
                            .expect("An error occurred setting main window focus");
                    }
                    _ => {}
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("An error occurred while running desktop application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        })
}
