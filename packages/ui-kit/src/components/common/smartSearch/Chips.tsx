import { styled } from '../../../styling';
import { Typography } from '../../base';

const Root = styled('div')(({ theme }) => ({
  'display': 'flex',
  'gap': theme.spacing(1),
  'whiteSpace': 'nowrap',
  'userSelect': 'none',
  '.items': {
    'display': 'flex',
    'alignItems': 'center',
    'gap': '2px',
    '& > :nth-child(1)': {
      borderTopLeftRadius: theme.shape.borderRadius / 4,
      borderBottomLeftRadius: theme.shape.borderRadius / 4,
    },
    '& > :nth-child(3)': {
      borderTopRightRadius: theme.shape.borderRadius / 4,
      borderBottomRightRadius: theme.shape.borderRadius / 4,
    },
  },
  '.item': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0.75),
    background: theme.palette.divider,
    whiteSpace: 'pre',
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
                    {values.length > 2 && values.length != index + 1 && ','}
                    {values.length > 2 && values.length != index + 2 && ' '}
                    {values.length > 1 && values.length == index + 2 && ' and '}
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
