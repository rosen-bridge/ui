import { ReactNode } from 'react';

const App = async ({ children }: { children?: ReactNode }) => {
  return <main>{children}</main>;
};

export default App;
