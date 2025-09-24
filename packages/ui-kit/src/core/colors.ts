type Name = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
type Shade = 'light' | 'main' | 'dark' | 'contrast-text';
export type Colors = `${Name}-${Shade}` | Name | 'background' | 'background-default' | 'background-paper';
