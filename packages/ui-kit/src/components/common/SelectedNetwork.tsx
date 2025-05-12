import { styled } from '../../styling';
import { SvgIcon, Typography } from '../base';

export const SelectedNetworkContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginBottom: '-1px',
}));

type SelectedNetworkProps = {
  label: string;
  Logo: string;
};

export const SelectedNetwork = ({ label, Logo }: SelectedNetworkProps) => (
  <SelectedNetworkContainer>
    <SvgIcon>
      <Logo />
    </SvgIcon>
    <Typography color="text.secondary">{label}</Typography>
  </SelectedNetworkContainer>
);
