/** Collects the disposable companion code without browser-native prompt support. */
export const requestDevnetSession = (): Promise<string | null> =>
  new Promise((resolve, reject) => {
    const dialog = document.createElement('dialog');
    if (typeof dialog.showModal !== 'function') {
      reject(new Error('This browser does not support the local wallet session form'));
      return;
    }
    const form = document.createElement('form');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const submit = document.createElement('button');
    const cancel = document.createElement('button');
    const title = document.createElement('h2');

    title.textContent = 'Connect local Ergo devnet';
    label.textContent = 'Session code from the local Ergo devnet companion';
    input.type = 'password';
    input.name = 'session';
    input.autocomplete = 'off';
    input.required = true;
    input.pattern = '[0-9a-f]{48}';
    input.maxLength = 48;
    input.style.cssText =
      'display:block;width:100%;box-sizing:border-box;margin:12px 0;padding:8px';
    label.append(input);
    submit.type = 'submit';
    submit.textContent = 'Connect local wallet';
    cancel.type = 'button';
    cancel.textContent = 'Cancel';
    cancel.style.marginLeft = '12px';
    form.append(title, label, submit, cancel);
    dialog.append(form);
    dialog.style.cssText = 'padding:24px;border-radius:12px;max-width:480px;border:1px solid #777';

    let session: string | null = null;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!/^[0-9a-f]{48}$/.test(input.value)) return;
      session = input.value;
      dialog.close();
    });
    cancel.addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      dialog.close();
    });
    dialog.addEventListener(
      'close',
      () => {
        input.value = '';
        dialog.remove();
        resolve(session);
      },
      { once: true },
    );
    try {
      document.body.append(dialog);
      dialog.showModal();
      input.focus();
    } catch (error) {
      dialog.remove();
      reject(error);
    }
  });
