import { useReducer, createContext } from 'react';

export type Severity = 'error' | 'warning' | 'info' | 'success';

export type SnackbarAction =
  | {
      type: 'open';
      message: string;
      severity: Severity;
    }
  | { type: 'close' };
type Dispatch = (action: SnackbarAction) => void;

export type State = {
  isOpen: boolean;
  message: string;
  severity: Severity | null;
};
type SnackbarProviderProps = { children: React.ReactNode };

export const SnackbarStateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

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
      };
    }
    case 'close': {
      return {
        isOpen: false,
        message: '',
        severity: null,
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
  const [state, dispatch] = useReducer(snackbarReducer, {
    isOpen: false,
    message: '',
    severity: null,
  });
  const value = { state, dispatch };

  return (
    <SnackbarStateContext.Provider value={value}>
      {children}
    </SnackbarStateContext.Provider>
  );
};
