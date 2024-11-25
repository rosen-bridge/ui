export { useTheme } from '@mui/material';
/**
 * TODO: remove the inline ESLint comment
 * local:ergo/rosen-bridge/ui#441
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isLegacyTheme = (theme: any) => !theme.palette.neutral;
