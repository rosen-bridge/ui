import { ReactNode } from 'react';

import { FullCard } from '@rosen-bridge/ui-kit';

interface ActionText {
  title: string;
  children: ReactNode;
}
/**
 * render a card showing some text to be used in actions page
 * @param children
 */
const ActionText = ({ title, children }: ActionText) => (
  <FullCard
    title={title}
    backgroundColor="divider"
    contentProps={{ sx: { color: (theme) => theme.palette.text.secondary } }}
  >
    {children}
  </FullCard>
);

export default ActionText;
