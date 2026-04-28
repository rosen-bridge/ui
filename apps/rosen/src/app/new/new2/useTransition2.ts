import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type TransitionState = 'start' | 'running' | 'end' | 'idle';
export type TransitionDirection = 'enter' | 'exit';

export interface TransitionConfig {
  name: string;
  duration: number;
  delay?: number;
  animation: Array<string>;
}

export interface UseTransitionReturn {
  ref: RefObject<HTMLElement | null>;
  state: TransitionState;
  direction: TransitionDirection;
  play: (name: string) => Promise<void>;
  reverse: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useTransition(config: TransitionConfig): UseTransitionReturn {
  const elementRef = useRef<HTMLElement | null>(null);

  const [state, setState] = useState<TransitionState>('idle');

  const [direction, setDirection] = useState<TransitionDirection>('enter');

  // eslint-disable-next-line no-undef
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const wait = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  }, []);

  const updateState = useCallback(
    (
      animation: string,
      newState: TransitionState,
      newDirection?: TransitionDirection,
    ) => {
      console.log('🤠 ', animation, newState, "Dir: "+newDirection);
      setState(newState);

      if (newDirection) {
        setDirection(newDirection);
      }

      if (elementRef.current) {
        elementRef.current.setAttribute('data-state', newState);
        elementRef.current.setAttribute('data-animation', animation);
        if (newDirection) {
          elementRef.current.setAttribute('data-direction', newDirection);
        }
      }
    },
    [],
  );

  const executeLifecycle = useCallback(
    async (name: string, dir: TransitionDirection) => {
      if (isRunningRef.current) return;

      isRunningRef.current = true;

      setDirection(dir);

      try {
        updateState(name, 'start', dir);

        if (config.delay) {
          console.log('try {delay scope}', 5);
          await wait(config.delay);
        }

        updateState(name, 'running', dir);

        await wait(config.duration);

        updateState(name, 'end', dir);

        setState('idle');
      } catch (error) {
        console.error('Transition error:', error);
        setState('idle');
      } finally {
        isRunningRef.current = false;
      }
    },
    [config.delay, config.duration, updateState, wait],
  );

  const play = useCallback(
    async (name: string) => {
      await executeLifecycle(name, 'enter');
    },
    [executeLifecycle],
  );

  const reverse = useCallback(async () => {
    await executeLifecycle('name', 'exit');
  }, [executeLifecycle]);

  const pause = useCallback(() => {
    if (elementRef.current && state === 'running') {
      elementRef.current.style.animationPlayState = 'paused';
    }
  }, [state]);

  const resume = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.style.animationPlayState = 'running';
    }
  }, []);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isRunningRef.current = false;
    setState('idle');
    if (elementRef.current) {
      elementRef.current.style.animationPlayState = 'running';
    }
  }, []);

  return {
    ref: elementRef,
    state,
    direction,
    play,
    reverse,
    pause,
    resume,
    stop,
  };
}
