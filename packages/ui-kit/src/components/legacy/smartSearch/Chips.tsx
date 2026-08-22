import { styled } from '@mui/material';

import { Typography } from '@/components';

import { CloseButton } from '../../closeButton';
import type { Filter, Selected } from './types';
import { parseFilter } from './utils';

const Root = styled('div')(({ theme }) => ({
  'display': 'flex',
  'gap': theme.spacing(1),
  'whiteSpace': 'nowrap',
  'userSelect': 'none',
  '.items': {
    'display': 'flex',
    'alignItems': 'center',
    'gap': '2px',

    '.item-middle': {
      borderRadius: 0,
    },
    '.item-start': {
      borderTopLeftRadius: theme.shape.borderRadius / 4,
      borderBottomLeftRadius: theme.shape.borderRadius / 4,
    },

    '.item-end': {
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
  '.MuiIconButton-root': {
    'padding': theme.spacing(0.25),
    'marginLeft': theme.spacing(0.5),
    '.MuiSvgIcon-root': {
      fontSize: '20px',
    },
  },
}));

export type ChipsProps = {
  disabled?: boolean;
  filters: Filter[];
  value: Partial<Selected>[];
  onRemove?: (item: Partial<Selected>) => void;
};

export const Chips = ({ disabled, filters, value, onRemove }: ChipsProps) => {
  return (
    <Root>
      {value.map((item) => {
        const parsed = parseFilter(filters, item);

        if (!parsed) return null;

        const hasFlow = typeof parsed.flow !== 'undefined';

        const hasOperator = typeof parsed.operator !== 'undefined';

        const hasValue = typeof parsed.value !== 'undefined';

        return (
          <div key={JSON.stringify(item)} className="items">
            {hasFlow && (
              <Typography as="div" variant="body1" className="item item-start">
                {parsed.flow.label}
              </Typography>
            )}
            {hasFlow && hasOperator && (
              <Typography as="div" variant="body1" className="item item-middle">
                {parsed.operator.preview || parsed.operator.label}
              </Typography>
            )}
            {hasFlow && hasOperator && hasValue && (
              <div key={JSON.stringify(value)} className="item item-end">
                {[parsed.value].flat().map((value, index, values) => {
                  const length = values.length;

                  let content: string;

                  switch (typeof value) {
                    case 'object':
                      content = `${value.label}`;
                      break;
                    default:
                      content = `${value}`;
                      break;
                  }

                  return (
                    <Typography variant="body1" as="div" key={content} className="value">
                      {content}
                      {length > 2 && length >= index + 3 && ', '}
                      {length > 1 && length === index + 2 && ' and '}
                    </Typography>
                  );
                })}
                <CloseButton
                  disabled={disabled}
                  size="small"
                  slots={{ icon: { size: 'small' } }}
                  onClick={() => onRemove?.(item)}
                />
              </div>
            )}
          </div>
        );
      })}
    </Root>
  );
};
