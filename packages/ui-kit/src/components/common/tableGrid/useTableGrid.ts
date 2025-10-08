import { createContext, useContext } from 'react';

export const useTableGrid = () => {
  const context = useContext(TableGridContext);

  if (!context) {
    throw new Error('useTableGrid must be used within TableGridProvider');
  }

  return context;
};

export type TableGridContextType = {
  available: (index: number) => boolean;
  register: (index: number, props: {width?: string}) => void;
  unregister: (index: number) => void;
};

export const TableGridContext = createContext<TableGridContextType | null>(null);

