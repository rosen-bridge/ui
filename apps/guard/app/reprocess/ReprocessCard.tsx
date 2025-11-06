import { Download, Upload } from '@rosen-bridge/icons';
import {
  Avatar,
  Box,
  Card,
  CardBody,
  Chip,
  Identifier,
  Label,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import { ReprocessRequest, REQUEST_TYPE } from './page';
import { ReprocessStatus } from './ReprocessStatus';

interface ReprocessCardProps {
  value: ReprocessRequest;
  active?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}

export const ReprocessCard = ({
  value,
  active,
  isLoading,
  onClick,
}: ReprocessCardProps) => {
  const color = value.type == 'INCOMING' ? 'tertiary' : 'secondary';

  return (
    <Card
      backgroundColor="background.paper"
      clickable
      active={active}
      onClick={onClick}
    >
      <CardBody>
        <Stack direction="row" spacing={1} style={{ marginBottom: 16 }}>
          {isLoading ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <Avatar color={`${color}.dark`} background={`${color}.light`}>
              <SvgIcon>
                {value.type == 'INCOMING' ? <Download /> : <Upload />}
              </SvgIcon>
            </Avatar>
          )}
          <Box flexGrow={1}>
            <Identifier value={value.id} loading={isLoading} />
            <Typography variant="body2">
              {isLoading ? (
                <Skeleton width="60%" />
              ) : (
                <>
                  {REQUEST_TYPE[value.type]} <small>●</small> 2 hours ago
                </>
              )}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Box flexGrow={1} overflow="hidden">
            {isLoading ? (
              <Skeleton height={'32px'} />
            ) : (
              <Label label="Event Id" orientation="vertical" dense>
                <Identifier value={value.eventId} loading={isLoading} />
              </Label>
            )}
          </Box>
          <Box flexShrink={0} display="flex">
            {value.type == 'INCOMING' ? (
              <ReprocessStatus
                status={value.status}
                hideIcon
                loading={isLoading}
              />
            ) : (
              <Chip
                label={`${value.acceptances} of ${value.submissions}`}
                color="info"
                loading={isLoading}
              />
            )}
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
};
