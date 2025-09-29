type Name = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
type Shade = 'light' | 'main' | 'dark' | 'contrastText';
export type Colors = 'inherit' | `${Name}.${Shade}` | Name | 'background' | 'background.default' | 'background.paper'  ;


// 'inherit'
// | 'action'
// | 'disabled'
