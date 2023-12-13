'use client';

import {
  Button,
  FullCard,
  Grid,
  Collapse,
  Stack,
  SvgIcon,
} from '@rosen-bridge/ui-kit';
import { usePathname, useRouter } from 'next/navigation';
import { AngleUp, AngleDown } from '@rosen-bridge/icons';
import { Fragment, MouseEvent, ReactNode, useState } from 'react';

const pageTitleMap: Record<string, { title: string; short?: string }> = {
  '/settings/ergo': { title: 'Ergo Settings', short: 'Ergo' },
  '/settings/ergo/explorer': {
    title: 'Ergo Explorer Settings',
    short: 'Explorer',
  },
  '/settings/ergo/node': { title: 'Ergo Node Settings', short: 'Node' },
  '/settings/ergo/confirmation': {
    title: 'Ergo Confirmation Settings',
    short: 'Confirmation',
  },
  '/settings/a': { title: 'Setting A' },
  '/settings/a/1': { title: 'Setting A1' },
  '/settings/a/2': { title: 'Setting A2' },
  '/settings/a/2/x': { title: 'Setting A2X' },
  '/settings/b': { title: 'Setting B' },
};

const MenuButton = ({
  path,
  children,
}: {
  path?: string;
  children?: ReactNode;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (path) router.push(path as Parameters<typeof router.push>[0]);
  };
  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen((prevState) => !prevState);
  };

  return (
    <Fragment>
      <Button
        onClick={handleClick}
        sx={{
          justifyContent: 'start',
          p: 0,
          textTransform: 'none',
          color: 'inherit',
        }}
      >
        <Button
          onClick={handleToggle}
          sx={{
            visibility: !!children ? 'visible' : 'hidden',
            minWidth: 32,
            p: 0.5,
            color: 'inherit',
          }}
        >
          <SvgIcon>{open ? <AngleUp /> : <AngleDown />}</SvgIcon>
        </Button>
        {path
          ? (pageTitleMap[path].short || pageTitleMap[path].title) ?? ''
          : ''}
      </Button>
      <Collapse in={open}>
        <Stack ml={2}>{children}</Stack>
      </Collapse>
    </Fragment>
  );
};

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const path = usePathname();
  const isSettingsHome = path === '/settings';

  return (
    <Grid container spacing={3}>
      <Grid
        item
        mobile={12}
        tablet={4}
        desktop={3}
        sx={{
          display: {
            mobile: isSettingsHome ? 'block' : 'none',
            tablet: 'block',
          },
        }}
      >
        <FullCard backgroundColor="info.dark">
          <Stack sx={{ color: 'info.contrastText' }}>
            <MenuButton path="/settings/ergo">
              <MenuButton path="/settings/ergo/explorer" />
              <MenuButton path="/settings/ergo/node" />
              <MenuButton path="/settings/ergo/confirmation" />
            </MenuButton>
            <MenuButton path="/settings/a">
              <MenuButton path="/settings/a/1" />
              <MenuButton path="/settings/a/2">
                <MenuButton path="/settings/a/2/x" />
              </MenuButton>
            </MenuButton>
            <MenuButton path="/settings/b" />
          </Stack>
        </FullCard>
      </Grid>
      <Grid item mobile={12} tablet={8} desktop={9}>
        <FullCard
          title={pageTitleMap[path]?.title ?? ''}
          headerActions={
            !isSettingsHome && (
              <Button
                onClick={() => router.push('/settings')}
                sx={{ display: { tablet: 'none' } }}
              >
                Back
              </Button>
            )
          }
        >
          {children}
        </FullCard>
      </Grid>
    </Grid>
  );
};

export default SettingsLayout;
