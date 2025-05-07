import { styled } from '../../styling';

export const SelectedAsset = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginBottom: '-1px',
}));
