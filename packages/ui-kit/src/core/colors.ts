type Name = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

type Shade = 'light' | 'main' | 'dark' | 'contrastText';

export type Colors = 'inherit' | `${Name}.${Shade}` | Name | 'background' | 'background.default' | 'background.paper';

export const ensureColor = (color: Colors) => {
  switch (color) {
    case 'background':
      return `${color}.default`;
    case'primary'  :
    case 'secondary' :
    case 'error' :
    case 'warning' :
    case 'info' :
    case 'success':
      return `${color}.main`;
    default:
      return color;
  }
}
