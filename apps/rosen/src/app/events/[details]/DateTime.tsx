import React from 'react';

import { Typography } from '@rosen-bridge/ui-kit';

export type DateTimeProps = {
  timestamp: number;
};
// TODO: move to ui-kit
export const DateTime = ({ timestamp }: DateTimeProps) => {
  const date = new Date(timestamp);

  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return (
    <Typography variant="body1" color="textPrimary">
      {/*TODO : fix this */}
      <span>{parts[2].value}</span> <span>{parts[0].value}</span>{' '}
      <span>{parts[4].value}</span> <span>{parts[6].value}</span>
      {':'}
      <span>{parts[8].value}</span>
      {':'}
      <span>{parts[10].value}</span>
    </Typography>
  );
};
