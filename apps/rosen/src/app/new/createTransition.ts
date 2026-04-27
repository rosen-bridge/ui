type Phase = 'start' | 'running' | 'end';

/**
 * convert all duration to "ms"
 * for example: { 0.3s => 300 }
 * @param v
 */
function parseTime(v: string): number {
  if (v.endsWith('ms')) return parseFloat(v);
  if (v.endsWith('s')) return parseFloat(v) * 1000;
  return 0;
}

//get all transition
export function getTransitionTotal(el: HTMLElement) {
  const s = getComputedStyle(el);

  const durations = s.transitionDuration.split(',').map(parseTime);
  const delays = s.transitionDelay.split(',').map(parseTime);

  // return max value
  return Math.max(
    ...durations.map((d, i) => d + (delays[i] || delays[0] || 0)),
  );
}

export function createTransition(
  el: HTMLElement,
  callback: (p: Phase) => void,
) {
  let timer: any;
  let cancelled = false;

  const run = () => {
    cancelled = false;

    callback('start');

    // first frame for = update DOM
    requestAnimationFrame(() => {
      // second frame for = apply styles
      requestAnimationFrame(() => {
        if (cancelled) return;

        //create and running
        callback('running');

        const total = getTransitionTotal(el);

        //  this fallback  if event not called
        timer = setTimeout(() => {
          if (cancelled) return;
          callback('end');
        }, total);

        // event
        const handleEnd = () => {
          clearTimeout(timer);
          el.removeEventListener('transitionend', handleEnd);
          if (cancelled) return;
          callback('end');
        };

        el.addEventListener('transitionend', handleEnd, { once: true });
      });
    });
  };

  /**
   * kill frames
   */
  const cancel = () => {
    cancelled = true;
    clearTimeout(timer);
  };

  return { run, cancel };
}
