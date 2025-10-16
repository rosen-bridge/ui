import { ReactElement } from 'react';

import { styled } from '../../styling';

export interface AvatarGroupProps {
  children: ReactElement[];
  max?: number;
}

const ExtraAvatar = styled('div')(({ theme }) => ({
  width: '2em',
  height: '2em',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  color: theme.palette.neutral.light,
  backgroundColor: theme.palette.neutral.main,
  fontSize: '1em',
}));

const AvatarGroupWrapper = styled('div')(({ theme }) => ({
  'display': 'flex',
  'flexDirection': 'row',
  '& > div': {
    outline: `1px solid ${theme.palette.neutral.light}`,
    backgroundColor: theme.palette.neutral.light,
    borderRadius: '50%',
  },
  '& > div:not(:first-of-type)': {
    marginLeft: '-6px',
  },
}));

export const AvatarGroup = ({ children, max = 2 }: AvatarGroupProps) => {
  const rem = children.length - max;
  return (
    <AvatarGroupWrapper>
      {children.slice(0, max).map((child, index) => (
        <div key={index} style={{ zIndex: max - index }}>
          {child}
        </div>
      ))}
      {rem > 0 && (
        <div>
          <ExtraAvatar>+{rem}</ExtraAvatar>
        </div>
      )}
    </AvatarGroupWrapper>
  );
};
