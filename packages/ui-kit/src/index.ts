declare module '@mui/system' {
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
}
declare module '@mui/material/styles' {
  interface TypeBackground {
    shadow: string;
  }
  interface Palette {
    background: TypeBackground;
  }
  interface PaletteOptions {
    background?: Partial<TypeBackground>;
  }
}

export * from './components';
export * from './hooks';
export * from './Providers';
export * from './styling';
export * from './utils';

export * from './contexts';
