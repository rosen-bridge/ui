// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

fn main() {
    let show_guard_menu_item = CustomMenuItem::new("show_guard", "Show Guard");
    let quit_menu_item = CustomMenuItem::new("quit", "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show_guard_menu_item)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit_menu_item);

    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| {
            if let SystemTrayEvent::MenuItemClick { id, .. } = event {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show_guard" => {
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
