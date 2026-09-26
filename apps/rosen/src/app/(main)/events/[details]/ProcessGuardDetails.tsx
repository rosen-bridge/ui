'use client';

import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import {
  Button,
  DateTime,
  Dialog,
  DialogAction,
  DialogBody,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  Icon,
  Label,
  LabelGroup,
  Menu,
  MenuBody,
  MenuItem,
  MenuTrigger,
  Typography,
  useToast,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import type { EventGuardTimestampsType } from '@/backend/events/repository';

export type ProcessGuardDetailsProps = {
  id: string;
  flowId: string | undefined;
  guards: { key: string; label: string }[];
  guardKey: string | undefined;
  open: boolean;
  onClose: () => void;
  onGuardChange: (key: string) => void;
};

export const ProcessGuardDetails = ({
  id,
  flowId,
  guards,
  guardKey,
  open,
  onClose,
  onGuardChange,
}: ProcessGuardDetailsProps) => {
  const toast = useToast();

  const { data, isLoading } = useSWR<EventGuardTimestampsType>(
    open && flowId && guardKey ? `/v1/events/${id}/guards/${guardKey}?triggerTxId=${flowId}` : null,
    fetcher,
    {
      onError: (error) => {
        onClose();
        toast.add({
          type: 'error',
          description: error.message,
          more: () => JSON.stringify(serializeError(error), null, 2),
        });
      },
    },
  );

  const loading = isLoading || !data;

  const time = (value?: number) =>
    loading ? (
      <DateTime loading />
    ) : value ? (
      <DateTime timestamp={(value ?? 0) * 1000} />
    ) : (
      <Typography color="text-disabled">—</Typography>
    );

  return (
    <Dialog open={open} unstick="tablet" width="small" onClose={onClose}>
      <DialogHeader>
        <DialogIcon name="ShieldCheck" />
        <DialogTitle>Guard Status</DialogTitle>
        <DialogAction>
          <Menu>
            <MenuTrigger
              as={Button}
              variant="text"
              size="small"
              endIcon={<Icon name="AngleDown" size="small" />}
              style={{ marginRight: '-1rem' }}
            >
              {guards.find((guard) => guard.key === guardKey)?.label}
            </MenuTrigger>
            <MenuBody offset={[0, 4]} placement="bottom-start">
              {guards.map((guard) => (
                <MenuItem
                  key={guard.key}
                  selected={guard.key === guardKey}
                  onClick={() => onGuardChange(guard.key)}
                >
                  {guard.label}
                </MenuItem>
              ))}
            </MenuBody>
          </Menu>
        </DialogAction>
      </DialogHeader>

      <DialogBody>
        {data?.REJECTED && (
          <Label label="Rejected" inset dense color="error">
            {time(data?.REJECTED)}
          </Label>
        )}
        <Label label="Payment" />
        <LabelGroup>
          {data?.PAYMENT_STALLED && (
            <Label label="Stalled" inset dense color="warning">
              {time(data?.PAYMENT_STALLED)}
            </Label>
          )}
          {data?.REACHED_LIMIT && (
            <Label label="Reached Limit" inset dense color="error">
              {time(data?.REACHED_LIMIT)}
            </Label>
          )}
          {data?.TIMEOUT && (
            <Label label="Timeout" inset dense color="error">
              {time(data?.TIMEOUT)}
            </Label>
          )}
          <Label label="Pending" inset dense>
            {time(data?.PAYMENT_PENDING)}
          </Label>
          <Label label="Approved" inset dense>
            {time(data?.PAYMENT_APPROVED)}
          </Label>
          <Label label="Signing" inset dense>
            {time(data?.PAYMENT_SIGNING)}
          </Label>
          <Label label="Signed" inset dense>
            {time(data?.PAYMENT_SIGNED)}
          </Label>
          <Label label="Sent" inset dense>
            {time(data?.PAYMENT_SENT)}
          </Label>
          <Label label="Confirmed" inset dense>
            {time(data?.PAID)}
          </Label>
        </LabelGroup>

        <Label label="Reward" />
        <LabelGroup>
          {data?.REWARD_STALLED && (
            <Label label="Stalled" inset dense color="warning">
              {time(data?.REWARD_STALLED)}
            </Label>
          )}
          <Label label="Pending" inset dense>
            {time(data?.REWARD_PENDING)}
          </Label>
          <Label label="Approved" inset dense>
            {time(data?.REWARD_APPROVED)}
          </Label>
          <Label label="Signing" inset dense>
            {time(data?.REWARD_SIGNING)}
          </Label>
          <Label label="Signed" inset dense>
            {time(data?.REWARD_SIGNED)}
          </Label>
          <Label label="Sent" inset dense>
            {time(data?.REWARD_SENT)}
          </Label>
          <Label label="Confirmed" inset dense>
            {time(data?.REWARDED)}
          </Label>
        </LabelGroup>

        <Label label="Result" />
        <LabelGroup>
          {data?.SPENT ? (
            <Label label="Spent" inset dense>
              {time(data?.SPENT)}
            </Label>
          ) : (
            <Label label="Finished" inset dense>
              {time(data?.COMPLETED)}
            </Label>
          )}
        </LabelGroup>
      </DialogBody>
    </Dialog>
  );
};
