import {
  AnchorHTMLAttributes,
  ComponentType,
  createContext,
  ImgHTMLAttributes,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

export const useFramework = () => {
  const context = useContext(FrameworkContext);

  if (!context) {
    throw new Error('useFramework must be used within FrameworkProvider');
  }

  return context;
};

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ImageComponent = ComponentType<ImageProps>;

export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export type AnchorComponent = ComponentType<AnchorProps>;

export type FrameworkContextType = {
  components: {
    Anchor: AnchorComponent;
    Image: ImageComponent;
  };
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
  components: {
    Anchor: AnchorComponent;
    Image: ImageComponent;
  };
  router: {
    pathname: string;
    search: string;
    push: (href: string) => void;
  };
};

export const FrameworkProvider = ({
  children,
  components,
  router,
}: FrameworkProviderProps) => {
  const value = useMemo<FrameworkContextType>(
    () => ({
      components: {
        Anchor: components.Anchor,
        Image: components.Image,
      },
      router: {
        pathname: router.pathname,
        search: router.search,
        push: router.push,
      },
    }),
    [
      components.Anchor,
      components.Image,
      router.pathname,
      router.search,
      router.push,
    ],
  );

  return (
    <FrameworkContext.Provider value={value}>
      {children}
    </FrameworkContext.Provider>
  );
};
