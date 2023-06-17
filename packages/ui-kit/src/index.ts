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

export * from './components';
export * from './hooks';
export * from './Providers';
export * from './styling';
export * from './utils';
