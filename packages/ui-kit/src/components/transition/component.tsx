import {
  Fragment,
  isValidElement,
  type ReactElement,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Slot } from '@radix-ui/react-slot';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface TransitionOverrides {}

export type TransitionOwnProps = {
  /**
   * Animates the initial child in on mount, not only the children that come after it.
   * @default false
   */
  appear?: boolean;

  /**
   * The element to animate. Changing its `key` animates the old element out and then the new one
   * in, and replacing it with `null` or `false` animates it out.
   * It must be a single element that passes `ref` and `data-*` props to its DOM element, so text,
   * arrays and fragments are not supported.
   */
  children?: ReactElement | false | null;

  /**
   * Called after the enter animation finishes.
   */
  onEntered?: () => void;

  /**
   * Called after the exit animation finishes, right before the element is removed or replaced.
   */
  onExited?: () => void;
};

export type TransitionBaseProps = ElementBaseProps<typeof Slot, TransitionOwnProps>;

export type TransitionProps = OverridableType<TransitionBaseProps, TransitionOverrides, never>;

/**
 * - `starting`: the entering element is mounted with `[data-starting-style]`
 * - `entering`: the attribute is removed and the enter animation is running
 * - `idle`: no animation is running
 * - `ending`: the leaving element has `[data-ending-style]` and the exit animation is running
 * - `exited`: the exit animation has finished and the next child is mounted on the next render
 */
type Phase = 'idle' | 'starting' | 'entering' | 'ending' | 'exited';

/**
 * Resolves when the animations of the element finish. Infinite ones, like a spinner's, are skipped
 * since they never finish, and it resolves at once without the Web Animations API, like in jsdom.
 */
const waitForAnimations = (element: Element | null) => {
  if (typeof element?.getAnimations !== 'function') return Promise.resolve();

  const animations = element
    .getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);

  return Promise.allSettled(animations.map((animation) => animation.finished));
};

/**
 * `Transition` keeps its child in the DOM until the exit animation finishes, so the child can
 * animate both in and out. When the child's `key` changes, the old element animates out first and
 * then the new one animates in.
 *
 * It adds no styles and renders no element of its own. It sets `[data-starting-style]` and
 * `[data-ending-style]` on the child, the same attributes Base UI sets, and the component that uses
 * it animates them in its own CSS. Its other props are merged onto the child.
 *
 * @example
 * ```tsx
 * <Transition>
 *   {copied ? <Icon key="check" name="Check" /> : <Icon key="copy" name="Copy" />}
 * </Transition>
 * ```
 *
 * ```css
 * .RosenCopyButton > .RosenIcon {
 *   transition-property: opacity;
 *   transition-duration: var(--rosen-motion-duration-short);
 *
 *   &[data-starting-style],
 *   &[data-ending-style] {
 *     opacity: 0;
 *   }
 * }
 * ```
 */
export const Transition = (props: TransitionProps) => {
  const { appear, children, onEntered, onExited, ...rest } = useConfig('Transition', props);

  const supported = isValidElement(children) && children.type !== Fragment;

  const next = supported ? children : null;

  const [current, setCurrent] = useState(next);

  const [phase, setPhase] = useState<Phase>(() => (appear && next ? 'starting' : 'idle'));

  const ref = useRef<HTMLElement>(null);

  const changed = next?.key !== current?.key || !next !== !current;

  if (phase === 'exited') {
    setCurrent(next);
    setPhase(next ? 'starting' : 'idle');
  } else if (changed) {
    if (!current) {
      setCurrent(next);
      setPhase('starting');
    } else if (phase !== 'ending') {
      setPhase('ending');
    }
  } else {
    if (next !== current) setCurrent(next);
    if (phase === 'ending') setPhase('idle');
  }

  const finish = useEffectEvent((finished: Phase) => {
    if (finished === 'entering') {
      setPhase('idle');
      onEntered?.();
    } else {
      setPhase('exited');
      onExited?.();
    }
  });

  useLayoutEffect(() => {
    if (phase !== 'starting') return;

    /**
     * Forces a style calculation so the starting style is applied before it is removed,
     * otherwise the transition has nothing to start from
     */
    ref.current?.getBoundingClientRect();

    setPhase('entering');
  }, [phase]);

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'ending') return;

    let cancelled = false;

    waitForAnimations(ref.current).then(() => {
      if (!cancelled) finish(phase);
    });

    return () => {
      cancelled = true;
    };
  }, [phase]);

  const unsupported =
    !supported && children !== undefined && children !== null && children !== false;

  useEffect(() => {
    if (!unsupported) return;

    console.error(
      'Transition expects a single element (not text, an array or a fragment) as its child',
    );
  }, [unsupported]);

  if (!current) return null;

  const ending = phase === 'ending';

  /**
   * Hides the leaving element from assistive technologies and makes it unfocusable and unclickable
   */
  return (
    <Slot
      ref={ref}
      aria-hidden={ending || undefined}
      data-ending-style={ending || undefined}
      data-starting-style={phase === 'starting' || undefined}
      inert={ending || undefined}
      {...rest}
    >
      {current}
    </Slot>
  );
};

Transition.displayName = 'Transition';
