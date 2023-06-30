import { ReactNode } from 'react';

import { FullCard } from '@rosen-bridge/ui-kit';

interface ActionText {
  children: ReactNode;
}
/**
 * render a card showing some text to be used in actions page
 * @param children
 */
const ActionText = ({ children }: ActionText) => (
  <FullCard
    title="Withdrawal"
    backgroundColor="#00000011"
    contentProps={{ sx: { color: (theme) => theme.palette.text.secondary } }}
  >
    {children}
  </FullCard>
);

export default ActionText;
