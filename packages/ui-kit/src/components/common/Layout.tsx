import React, { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';

interface LayoutProps {
  toolbar: ReactNode;
  toolbarActions?: ReactNode;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  toolbar,
  toolbarActions,
  children,
}) => {
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;

  return (
    <>
      <div
        style={{
          top: '0',
          position: 'fixed',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '88%',
          backgroundColor,
          zIndex: 1000,
          background: `linear-gradient(to bottom, ${backgroundColor} 80%, rgba(0, 0, 0, 0) 100%)`,
        }}
      >
        {toolbar}
        {toolbarActions}
      </div>

      <div>{children}</div>
    </>
  );
};

export default Layout;
