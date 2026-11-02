'use client';

import {
  Button,
  Center,
  Icon,
  NotFoundResult,
  Stack,
  type StackProps,
  Typography,
  useResponsive,
} from '@rosen-bridge/ui-kit';

export const EventNotFound = ({ onRetry }: { onRetry: () => void }) => {
  const responsive: StackProps['direction'] = useResponsive({
    laptop: 'row',
    tablet: 'column',
  });

  return (
    <Center style={{ minHeight: 'calc(100vh - 200px)' }}>
      <Stack align="center" spacing={3} style={{ maxWidth: '30rem' }}>
        <Stack spacing={1} align="center">
          <NotFoundResult />
          <Typography align="center">Event Not Found</Typography>
          <Typography align="center" variant="body2" color="text-secondary">
            This event does not exist, or it has not been observed yet. New events may take a few
            minutes to appear after the source transaction is confirmed.
          </Typography>
        </Stack>
        <Stack spacing={2} direction={responsive}>
          <Button
            variant="contained"
            href="/events"
            startIcon={<Icon style={{ rotate: '180deg' }} name="ArrowRight" />}
          >
            Back To Events
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Icon name="Refresh" />}
            onClick={onRetry}
          >
            Check Again
          </Button>
        </Stack>
      </Stack>
    </Center>
  );
};
