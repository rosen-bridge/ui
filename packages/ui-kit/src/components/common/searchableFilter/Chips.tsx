import { Typography } from '@mui/material';

import { styled } from '../../../styling';

const Root = styled('div')(({ theme }) => ({
  'display': 'flex',
  'gap': theme.spacing(1),
  'whiteSpace': 'nowrap',
  'userSelect': 'none',
  '.flow': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.25),
  },
  '.item': {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius / 4,
    background: theme.palette.neutral.light,
  },
  '.multiple': {},
}));

export type ChipsProps = {
  value: (string | string[])[][];
};

export const Chips = ({ value }: ChipsProps) => {
  return (
    <Root>
      {value.map((flow) => (
        <div key={JSON.stringify(flow)} className="flow">
          {flow.map((value) => {
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
