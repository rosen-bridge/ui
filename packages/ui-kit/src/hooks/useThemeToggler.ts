import { useContext } from 'react';

import { ThemeTogglerContext } from '@/providers';

export const useThemeToggler = () => useContext(ThemeTogglerContext);
