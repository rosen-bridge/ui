import { ReactNode } from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Typography,
} from '@rosen-bridge/ui-kit';

interface ActionText {
  title: string;
  children: ReactNode;
}

/**
 * render a card showing some text to be used in actions page
 * @param children
 */
export const ActionText = ({ title, children }: ActionText) => (
  <Card style={{ minWidth: 0 }} backgroundColor="divider">
    <CardHeader>
      <CardTitle>
        <Typography fontWeight="700">{title}</Typography>
      </CardTitle>
    </CardHeader>
    <CardBody>
      <Typography color="textSecondary">{children}</Typography>
    </CardBody>
  </Card>
);
