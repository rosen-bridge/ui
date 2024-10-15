import { useContext } from 'react';

import { ThemeTogglerContext } from '../Providers';

export const useThemeToggler = () => useContext(ThemeTogglerContext);
