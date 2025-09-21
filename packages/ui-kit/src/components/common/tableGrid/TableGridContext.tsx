import { createContext, Dispatch, SetStateAction } from 'react';

export const TableGridContext = createContext<{
  columns: boolean[];
  setColumns: Dispatch<SetStateAction<boolean[]>>;
}>({ columns: [], setColumns: () => {} });
