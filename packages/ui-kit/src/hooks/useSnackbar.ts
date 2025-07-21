import React, { useContext } from 'react';

import { Severity, SnackbarPosition, SnackbarStateContext } from '../contexts';

/**
 * Custom hook to control the snackbar state and actions.
 * Provides methods to open and close the snackbar and access its current state.
 *
 * @throws Error if used outside of a SnackbarProvider.
 *
 * @returns An object containing:
 *  - state: Current snackbar state.
 *  - openSnackbar: Function to open the snackbar with message, severity, position, and optional callback.
 *  - closeSnackbar: Function to close the snackbar.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { useSnackbar } from './hooks/useSnackbar';
 *
 * export function ExampleComponent() {
 *   const { openSnackbar, closeSnackbar } = useSnackbar();
 *
 *   const handleClick = () => {
 *     openSnackbar(
 *       <>This is a custom message with a <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>.</>,
 *       'info',
 *       undefined,
 *       () => 'Extra info or copy text'
 *     );
 *   };
 *
 *   return (
 *     <button onClick={handleClick}>
 *       Show Snackbar
 *     </button>
 *   );
 * }
 * ```
 */
export const useSnackbar = () => {
  const context = useContext(SnackbarStateContext);

  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }

  /**
   * Opens the snackbar with specified options.
   *
   * @param message - The message to display (string or ReactNode).
   * @param severity - The severity level of the snackbar.
   * @param position - Optional position of the snackbar on screen.
   * @param more - Optional callback for additional info or actions.
   */
  const openSnackbar = (
    message: React.ReactNode,
    severity: Severity,
    position?: SnackbarPosition,
    more?: () => string,
  ) => {
    context.dispatch({
      type: 'open',
      message,
      severity,
      position,
      more,
    });
  };

  /**
   * Closes the snackbar.
   */
  const closeSnackbar = () => {
    context.dispatch({ type: 'close' });
  };

  return {
    state: context.state,
    openSnackbar,
    closeSnackbar,
  };
};
