import { Typography } from '@mui/material';

import { styled } from '../../../styling';

const Root = styled('div')(({ theme }) => ({
  'display': 'flex',
  'gap': theme.spacing(1),
  'whiteSpace': 'nowrap',
  'userSelect': 'none',
  '.item': {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  },
  '.items': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius / 2,
    background: theme.palette.divider,
  },
  '.multiple': {},
}));

export type ChipsProps = {
  value: (string | string[])[][];
};

export const Chips = ({ value }: ChipsProps) => {
  return (
    <Root>
      {value.map((items) => (
        <div key={JSON.stringify(items)} className="items">
          {items.map((value) => {
            if (typeof value === 'string') {
              return (
                <Typography key={value} className="item">
                  {value}
                </Typography>
              );
            }
            return (
              <div key={JSON.stringify(value)} className="item">
                {value.map((value, index, values) => (
                  <div key={value} className="value">
                    {value}
                    {values.length > 1 && values.length > index + 1 ? ', ' : ''}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </Root>
  );
};
