import { createContext, ReactNode, useContext, useMemo } from 'react';

export const useFramework = () => {
  const context = useContext(FrameworkContext);

  if (!context) {
    throw new Error('useFramework must be used within FrameworkProvider');
  }

  return context;
};

export type FrameworkContextType = {
  router: {
    pathname: string;
    search: string;
    push: (href: string) => void;
  };
};

export const FrameworkContext = createContext<FrameworkContextType | undefined>(
  undefined,
);

export type FrameworkProviderProps = {
  children?: ReactNode;
  router: {
    pathname: string;
    search: string;
    push: (href: string) => void;
  };
};

export const FrameworkProvider = ({
  children,
  router,
}: FrameworkProviderProps) => {
  const value = useMemo<FrameworkContextType>(
    () => ({
      router: {
        pathname: router.pathname,
        search: router.search,
        push: router.push,
      },
    }),
    [router.pathname, router.search, router.push],
  );

  return (
    <FrameworkContext.Provider value={value}>
      {children}
    </FrameworkContext.Provider>
  );
};
