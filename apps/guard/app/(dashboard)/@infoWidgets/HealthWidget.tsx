import React from 'react';

import { ExclamationTriangle, ShieldCheck } from '@rosen-bridge/icons';
import {
  Card,
  CircularProgress,
  SvgIcon,
  Tooltip,
  styled,
} from '@rosen-bridge/ui-kit';
import { healthStatusColorMap } from '@rosen-ui/constants';
import { AugmentedPalette } from '@rosen-ui/types';

import { useInfo } from '@/_hooks/useInfo';

interface HealthWidgetBaseProps {
  widgetColor: keyof AugmentedPalette;
}
/**
 * base component for `HealthWidget`
 *
 * @param widgetColor
 */
const HealthWidgetBase = styled(Card)<HealthWidgetBaseProps>(
  ({ theme, ...props }) => ({
    'padding': theme.spacing(2),
    'backgroundColor': theme.palette[props.widgetColor].main,
    'color': theme.palette[props.widgetColor].contrastText,
    'backgroundImage':
      theme.palette.mode === 'light'
        ? `linear-gradient(180deg, ${
            theme.palette[props.widgetColor].main
          } 0%, ${theme.palette[props.widgetColor].dark} 100%)`
        : 'none',
    'display': 'flex',
    'alignItems': 'center',
    '& span': {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(1),
    },
    '& strong': {
      flexGrow: 1,
    },
  }),
);

/**
 * render a widget showing health status or a pending indicator
 */
export const HealthWidget = () => {
  const { data: info, isLoading } = useInfo();

  return (
    <HealthWidgetBase
      widgetColor={
        info?.health
          ? (healthStatusColorMap[info.health.status] as keyof AugmentedPalette)
          : 'secondary'
      }
    >
      {isLoading ? (
        <CircularProgress size={16} color="inherit" />
      ) : (
        info && (
          <>
            <SvgIcon>
              <ShieldCheck />
            </SvgIcon>
            <span>Health is</span>
            <strong>{info.health.status}</strong>
            {!!info.health.trialErrors.length && (
              <Tooltip
                title={
                  <div style={{ whiteSpace: 'pre' }}>
                    {info.health.trialErrors.join('\n')}
                  </div>
                }
              >
                <SvgIcon>
                  <ExclamationTriangle />
                </SvgIcon>
              </Tooltip>
            )}
          </>
        )
      )}
    </HealthWidgetBase>
  );
};
