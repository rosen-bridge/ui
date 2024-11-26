import { useReducer, createContext } from 'react';

import { SnackbarOrigin } from '@mui/material';

export type Severity = 'error' | 'warning' | 'info' | 'success';
export type SnackbarPosition = SnackbarOrigin;

export type SnackbarAction =
  | {
      type: 'open';
      message: string;
      severity: Severity;
      position?: SnackbarPosition;
    }
  | { type: 'close' };

type Dispatch = (action: SnackbarAction) => void;

export type State = {
  isOpen: boolean;
  message: string;
  severity: Severity | null;
  position: SnackbarPosition;
};
type SnackbarProviderProps = { children: React.ReactNode };

export const SnackbarStateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const defaultSnackbarPosition = {
  vertical: 'top',
  horizontal: 'center',
} as const;

/**
 * reducer function for react useReducer hook
 *
 * @param state: reducer state
 * @param action: current reducer action to change the state
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
 * context provider for opening and closing snackbar everywhere in the app
 *
 * @param children
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
