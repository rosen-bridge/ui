import { useReducer, createContext, useContext } from 'react';

type Severity = 'error' | 'warning' | 'info' | 'success';

type Action =
  | {
      type: 'open';
      message: string;
      severity: Severity;
    }
  | { type: 'close' };
type Dispatch = (action: Action) => void;

type State = { isOpen: boolean; message: string; severity: Severity | null };
type SnackbarProviderProps = { children: React.ReactNode };

const SnackbarStateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function snackbarReducer(state: State, action: Action) {
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

function SnackbarProvider({ children }: SnackbarProviderProps) {
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
}

function useSnackbar() {
  const context = useContext(SnackbarStateContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  const openSnackbar = (message: string, severity: Severity) => {
    context.dispatch({ type: 'open', message, severity });
  };

  const closeSnackbar = () => {
    context.dispatch({ type: 'close' });
  };

  return {
    state: context.state,
    openSnackbar,
    closeSnackbar,
  };
}

export { SnackbarProvider, useSnackbar };
