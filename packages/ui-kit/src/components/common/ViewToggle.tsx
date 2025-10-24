import React, { useState } from 'react';

import { Grid, Row } from '@rosen-bridge/icons';

import { styled } from '../../styling';
import { SvgIcon } from './SvgIcon';

export type ViewType = 'grid' | 'row';

export type ViewToggleProps = {
  onChangeView?: (value: ViewType) => void;
};

const ViewToggleRoot = styled('div')(({ theme }) => ({
  display: 'inline-flex',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

const TabWrapper = styled('button')<{
  active?: boolean;
}>(({ theme, active }) => ({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': '2.5rem',
  'height': '2.5rem',
  'background': active ? theme.palette.primary.main : 'transparent',
  'border': 'none',
  'cursor': 'pointer',
  'padding': 0,
  'borderRadius': '50%',
  'transition': 'background 0.2s',

  '& svg': {
    fill: active ? theme.palette.primary.light : theme.palette.text.secondary,
  },
}));

/**
 * A simple toggle component for switching between 'grid' and 'row' view modes.
 *
 * @component
 *
 * @example
 * ```tsx
 * <ViewToggle onChangeView={(value) => console.log(value)} />
 * ```
 *
 * @param {ViewToggleProps} props - The props for the component.
 * @param {Function} [props.onChangeView] - Optional callback that returns the selected view type when the toggle changes.
 *
 * @returns {JSX.Element} A toggle UI with two buttons for switching view types.
 */
export const ViewToggle = ({ onChangeView }: ViewToggleProps) => {
  const [activeView, setActiveView] = useState<ViewType>('grid');

  const handleClick = (value: ViewType) => {
    setActiveView(value);
    onChangeView?.(value);
  };

  return (
    <ViewToggleRoot>
      <TabWrapper
        active={activeView === 'row'}
        onClick={() => handleClick('row')}
      >
        <SvgIcon>
          <Row />
        </SvgIcon>
      </TabWrapper>

      <TabWrapper
        active={activeView === 'grid'}
        onClick={() => handleClick('grid')}
      >
        <SvgIcon>
          <Grid />
        </SvgIcon>
      </TabWrapper>
    </ViewToggleRoot>
  );
};
