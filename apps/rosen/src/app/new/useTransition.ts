import { type RefObject, useRef, useState } from 'react';

type State = 'enter' | 'entering' | 'entered' | 'exit' | 'exiting' | 'exited';

export function useTransition({
  ref,
  onEntered,
  onExited,
}: {
  ref: RefObject<HTMLElement | null>;
  onEntered?: () => void;
  onExited?: () => void;
}) {
  const [state, setState] = useState<State>('exited');

  const cleanupRef = useRef<() => void>(() => {});
  const lastAction = useRef<'enter' | 'exit' | null>(null);

  const clear = () => {
    cleanupRef.current?.();
  };

  const onEnd = (node: HTMLElement, cb: () => void) => {
    let done = false;

    const handler = () => {
      if (done) return;
      done = true;

      node.removeEventListener('transitionend', handler);
      cb();
    };

    node.addEventListener('transitionend', handler);

    return () => node.removeEventListener('transitionend', handler);
  };

  const enter = () => {
    const node = ref.current;
    if (!node) return;

    lastAction.current = 'enter';

    clear();

    setState('enter');

    requestAnimationFrame(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      node.offsetHeight;
    });

    requestAnimationFrame(() => {
      setState('entering');

      cleanupRef.current = onEnd(node, () => {
        if (lastAction.current !== 'enter') return;
        setState('entered');
        onEntered?.();
      });
    });
  };

  const exit = () => {
    const node = ref.current;
    if (!node) return;

    lastAction.current = 'exit';
    clear();

    setState('exit');

    requestAnimationFrame(() => {
      setState('exiting');

      cleanupRef.current = onEnd(node, () => {
        if (lastAction.current !== 'exit') return;
        setState('exited');
        onExited?.();
      });
    });
  };

  const stop = () => {
    clear();
    lastAction.current = null;
  };

  return {
    state,
    enter,
    exit,
    stop,
  };
}
