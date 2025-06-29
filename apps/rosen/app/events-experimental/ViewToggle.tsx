import React, { useState } from 'react';

import '@rosen-bridge/icons';
import { styled, SvgIcon } from '@rosen-bridge/ui-kit';

interface ViewToggleProps {
  onChangeView?: (value: 'grid' | 'row') => void;
}

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
  'borderRadius': theme.shape.borderRadius,
  'transition': 'background 0.2s',

  '& svg': {
    fill: active ? theme.palette.primary.light : theme.palette.text.secondary,
  },

}));

const ViewToggle = ({ onChangeView }: ViewToggleProps) => {
  const [activeView, setActiveView] = useState<'grid' | 'row'>('grid');

  const handleClick = (value: 'grid' | 'row') => {
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 1L0 19C0 19.2652 0.105357 19.5196 0.292893 19.7071C0.48043 19.8946 0.734784 20 1 20H19C19.2652 20 19.5196 19.8946 19.7071 19.7071C19.8946 19.5196 20 19.2652 20 19V1C20 0.734783 19.8946 0.480429 19.7071 0.292892C19.5196 0.105356 19.2652 0 19 0H1C0.734784 0 0.48043 0.105356 0.292893 0.292892C0.105357 0.480429 0 0.734783 0 1ZM18 14V18H2L2 14H18ZM18 8V12H2L2 8L18 8ZM18 2V6L2 6V2H18Z"
            />
          </svg>
        </SvgIcon>
      </TabWrapper>

      <TabWrapper
        active={activeView === 'grid'}
        onClick={() => handleClick('grid')}
      >
        <SvgIcon>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 0H1C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1V19C0 19.2652 0.105357 19.5196 0.292893 19.7071C0.48043 19.8946 0.734784 20 1 20H19C19.2652 20 19.5196 19.8946 19.7071 19.7071C19.8946 19.5196 20 19.2652 20 19V1C20 0.734784 19.8946 0.48043 19.7071 0.292893C19.5196 0.105357 19.2652 0 19 0ZM6 18H2V14H6V18ZM6 12H2V8H6V12ZM6 6H2V2H6V6ZM12 18H8V14H12V18ZM12 12H8V8H12V12ZM12 6H8V2H12V6ZM18 18H14V14H18V18ZM18 12H14V8H18V12ZM18 6H14V2H18V6Z"
            />
          </svg>
        </SvgIcon>
      </TabWrapper>
    </ViewToggleRoot>
  );
};

export default ViewToggle;
