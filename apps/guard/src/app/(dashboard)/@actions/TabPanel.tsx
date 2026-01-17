import { ReactNode } from 'react';

import { Slide, Box } from '@rosen-bridge/ui-kit';

interface TabPanelProps {
  in: boolean;
  children?: ReactNode;
}
/**
 * render the content of a tab in actions page
 *
 * @param in
 * @param children
 */
export const TabPanel = ({ in: isIn, children }: TabPanelProps) => {
  return (
    <Slide
      direction="up"
      in={isIn}
      unmountOnExit
      timeout={{
        appear: 0,
        enter: 300,
        exit: 0,
      }}
    >
      <Box>{children}</Box>
    </Slide>
  );
};
