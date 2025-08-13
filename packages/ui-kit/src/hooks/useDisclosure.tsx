'use client';

import { useCallback, useState } from 'react';

/**
 * Represents the possible states of a disclosure component
 *
 * - `close`: Content is fully hidden
 * - `loading`: Transition state during async operations
 * - `open`: Content is fully visible
 * - `error`: Error state when operations fail
 */
export type DisclosureState = 'close' | 'loading' | 'open' | 'error';

/**
 * Configuration options for controlling disclosure behavior
 */
export interface UseDisclosureOptions {
  /**
   * The initial state of the disclosure component
   * @defaultValue 'close'
   */
  initialState?: DisclosureState;

  /**
   * Async callback function that executes when opening the disclosure
   * @remarks Use this for loading data or performing actions when content becomes visible
   */
  onOpen?: () => Promise<void>;

  /**
   * Async callback function that executes when closing the disclosure
   * @remarks Use this for cleanup operations when content is hidden
   */
  onClose?: () => Promise<void>;
}

/**
 * Custom hook for managing expand/collapse state with async support
 * @param options - Configuration options including initial state and callbacks
 * @returns Object containing state, error handlers, and toggle functions
 *
 * @example
 * // Basic usage
 * const { state, toggle } = useDisclosure();
 *
 * @example
 * // With async callbacks
 * const disclosure = useDisclosure({
 *   onOpen: fetchData,
 *   onClose: cleanup
 * });
 */
export const useDisclosure = ({
  initialState = 'close',
  onOpen,
  onClose,
}: UseDisclosureOptions = {}) => {
  const [error, setError] = useState<unknown>();

  const [state, setState] = useState<DisclosureState>(initialState);

  const close = useCallback(async () => {
    setState('loading');
    setError(undefined);
    try {
      if (onClose) await onClose();
      setState('close');
    } catch (error) {
      setError(error);
      setState('error');
    }
  }, [onClose]);

  const open = useCallback(async () => {
    setState('loading');
    setError(undefined);
    try {
      if (onOpen) await onOpen();
      setState('open');
    } catch (error) {
      setError(error);
      setState('error');
    }
  }, [onOpen]);

  const toggle = useCallback(async () => {
    switch (state) {
      case 'close':
        await open();
        break;
      case 'error':
        await open();
        break;
      case 'loading':
        await Promise.resolve();
        break;
      case 'open':
        await close();
        break;
    }
  }, [state, open, close]);

  return {
    state,
    error,
    open,
    close,
    toggle,
  };
};
