import { styled } from '../../../styling';

const Root = styled('div')(() => ({
  'display': 'flex',
  'gap': '4px',
  '.flow': {
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
  },
  '.item': {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    fontSize: '12px',
    borderRadius: '2px',
    background: 'lightgray',
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
                <div key={value} className="item">
                  {value}
                </div>
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
