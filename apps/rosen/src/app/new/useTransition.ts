import { RefObject, useEffect, useRef, useState } from 'react';

import {
  createTransition,
  getTransitionTotal,
} from '@/app/new/createTransition';

type Phase = 'idle' | 'start' | 'running' | 'end';

type Props = {
  trigger: boolean;
  ref: RefObject<HTMLElement | null>;
};

export function useTransition({ trigger, ref }: Props) {
  const [state, setState] = useState<Phase>('idle');

  //Transition instance
  const tRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const t = tRef.current;

    if (!tRef.current) {
      tRef.current = createTransition(el, (phase: Phase) => {
        setState(phase);
      });
    }

    const cycle = () => {
      t.cancel();
      t.run();
    };

    cycle();
  }, [trigger, ref]);

  useEffect(() => {
    console.log(state);
  }, [state]);
  return {
    state,
  };
}


// const destroyFrame = () => {
//   if (!ref.current) return;
//   t.cancel();
//
//   const total = getTransitionTotal(ref.current);
//
//   const timer = setTimeout(() => {
//     setState('idle');
//   }, total);
//
//   return () => clearTimeout(timer);
// };