declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    laptop: true;
    tablet: true;
    mobile: true;
    desktop: true;

    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
  }

  interface TypeBackground {
    shadow: string;
  }

  interface Palette {
    background: TypeBackground;
  }

  interface PaletteOptions {
    background?: Partial<TypeBackground>;
  }

  interface Shape {
    borderRadius: number;
  }
}

export * from 'react-sticky-box';

export * from './components';
export * from './hooks';
export * from './Providers';
export * from './styling';
export * from './utils';

export * from './contexts';
export type { Theme } from '@mui/material';
