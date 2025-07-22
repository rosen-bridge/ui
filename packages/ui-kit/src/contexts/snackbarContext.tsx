import React, { useReducer, createContext } from 'react';

import { SnackbarOrigin } from '@mui/material';

/**
 * Severity levels for the Snackbar notification.
 * Determines the color and icon shown.
 */
export type Severity = 'error' | 'warning' | 'info' | 'success';

/**
 * Position on screen where the Snackbar appears.
 * Uses MUI's SnackbarOrigin type for vertical and horizontal alignment.
 */
export type SnackbarPosition = SnackbarOrigin;

/**
 * Actions dispatched to the Snackbar reducer.
 * - 'open': Opens the snackbar with a message, severity, optional position, and optional callback.
 * - 'close': Closes the snackbar and resets its state.
 */
export type SnackbarAction =
  | {
      /** Action type to open the snackbar */
      type: 'open';

      /** The message to display; can be a string or ReactNode */
      message: React.ReactNode;

      /** Severity level of the snackbar */
      severity: Severity;

      /** Optional position of the snackbar on screen */
      position?: SnackbarPosition;

      /** Optional callback function for additional info or actions */
      more?: () => string;
    }
  | {
      /** Action type to close the snackbar */
      type: 'close';
    };

/**
 * Type of dispatch function used in Snackbar context.
 */
type Dispatch = (action: SnackbarAction) => void;

/**
 * Snackbar state managed by the reducer.
 */
export type State = {
  /** Indicates whether the snackbar is open or closed */
  isOpen: boolean;

  /** The message to display; can be a string or ReactNode */
  message: React.ReactNode;

  /** Severity level of the message or null when closed */
  severity: Severity | null;

  /** Position of the snackbar on the screen */
  position: SnackbarPosition;

  /** Optional callback function for additional info or actions */
  more?: () => string;
};

/**
 * Props accepted by SnackbarProvider component.
 */
type SnackbarProviderProps = { children: React.ReactNode };

/**
 * React context that holds Snackbar state and dispatch function.
 * Used internally by SnackbarProvider and hooks.
 */
export const SnackbarStateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

/**
 * Default position of the snackbar on screen (top center).
 */
const defaultSnackbarPosition = {
  vertical: 'top',
  horizontal: 'center',
} as const;

/**
 * Reducer function to manage the Snackbar state based on dispatched actions.
 *
 * @param state - The current state of the Snackbar.
 * @param action - The action object describing the type of state update and payload.
 *
 * @returns The updated Snackbar state after applying the action.
 *
 * @throws {Error} Throws an error if the action type is unhandled.
 *
 * @remarks
 * Supports two action types:
 * - 'open': Opens the Snackbar with provided message, severity, position, and optional extra info callback.
 * - 'close': Closes the Snackbar and resets the state to defaults.
 */
function snackbarReducer(state: State, action: SnackbarAction) {
  switch (action.type) {
    case 'open': {
      return {
        isOpen: true,
        message: action.message,
        severity: action.severity,
        ...(action.position
          ? { position: action.position }
          : { position: defaultSnackbarPosition }),
        more: action.more,
      };
    }
    case 'close': {
      return {
        isOpen: false,
        message: '',
        severity: null,
        position: defaultSnackbarPosition,
      };
    }
    default: {
      throw new Error(`Unhandled action type`);
    }
  }
}

/**
 * `SnackbarProvider` sets up a React Context to manage a global Snackbar state.
 * It provides a reducer and dispatcher that allow components to open or close
 * the Snackbar anywhere in the application.
 *
 * ## Features:
 * - Manages open/close state of a Snackbar.
 * - Supports passing simple text or custom `ReactNode` as the message.
 * - Allows setting severity level (`error`, `warning`, `info`, `success`).
 * - Supports custom position on screen using MUI's `SnackbarOrigin`.
 * - Supports an optional `more` callback for extra actions like copying.
 *
 * Wrap your app with `SnackbarProvider` to enable `useSnackbar` hook access.
 *
 * @param children React children nodes that will have access to the Snackbar context.
 *
 * @example
 * <SnackbarProvider>
 *   <App />
 * </SnackbarProvider>
 */
export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [state, dispatch] = useReducer<typeof snackbarReducer>(
    snackbarReducer,
    {
      isOpen: false,
      message: '',
      severity: null,
      position: defaultSnackbarPosition,
    },
  );

  const value = { state, dispatch };

  return (
    <SnackbarStateContext.Provider value={value}>
      {children}
    </SnackbarStateContext.Provider>
  );
};
