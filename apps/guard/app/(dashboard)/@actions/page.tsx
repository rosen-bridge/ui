'use client';

import React, { SyntheticEvent, useState } from 'react';

import {
  KeySkeleton,
  Pause,
  PauseCircle,
  Redo,
  Share,
  StopCircle,
} from '@rosen-bridge/icons';
import {
  Box,
  Grid,
  SvgIcon,
  Tab,
  Tabs,
  styled,
  useResponsiveValue,
} from '@rosen-bridge/ui-kit';

import { SendForSigningForm } from './SendForSigningForm';
import { TabPanel } from './TabPanel';

/**
 * render root of page
 */
const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.background.paper,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  marginLeft: -theme.shape.borderRadius * 2,
  marginRight: -theme.shape.borderRadius * 2,
  paddingLeft: theme.shape.borderRadius * 2,
  paddingRight: theme.shape.borderRadius * 2,
  [theme.breakpoints.down('tablet')]: {
    display: 'block',
    backgroundColor: theme.palette.background.default,
    marginLeft: `-${theme.spacing(2)}`,
    marginRight: theme.spacing(-2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

/**
 * render a container for tabs
 */
const TabsContainer = styled(Box)(({ theme }) => ({
  'position': 'relative',
  'height': 'calc(100% + 32px)',
  'margin': theme.spacing(-2, 0),
  [theme.breakpoints.down('tablet')]: {
    margin: theme.spacing(-3, -2),
  },
  '& .MuiTabs-root': {
    'paddingTop': theme.spacing(5),
    'paddingBottom': theme.spacing(5),
    [theme.breakpoints.down('tablet')]: {
      padding: theme.spacing(1, 2, 0, 2),
      backgroundColor: theme.palette.info.dark,
    },
    '& .MuiTab-root': {
      minHeight: 48,
      justifyContent: 'start',
      textAlign: 'left',
      color: theme.palette.info.contrastText,
      fontSize: theme.typography.body2.fontSize,
      [theme.breakpoints.down('tablet')]: {
        width: '10em',
        textAlign: 'center',
      },
    },
    '& .Mui-selected': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.info.dark
          : theme.palette.info.light,
      [theme.breakpoints.down('tablet')]: {
        backgroundColor: theme.palette.background.default,
        borderTopRightRadius: theme.shape.borderRadius,
        borderTopLeftRadius: theme.shape.borderRadius,
      },
    },
    '& .MuiTabs-indicator': {
      width: 0,
      height: 0,
    },
  },
  '& .card': {
    'position': 'absolute',
    'width': '100%',
    'height': '100%',
    'display': 'flex',
    'flexDirection': 'column',
    [theme.breakpoints.down('tablet')]: {
      display: 'none',
    },
    '& .top': {
      backgroundColor: theme.palette.info.dark,
      borderTopRightRadius: theme.shape.borderRadius,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderBottomRightRadius: theme.shape.borderRadius / 2,
      borderBottomLeftRadius: theme.shape.borderRadius / 2,
      transition: 'height 300ms',
    },
    '& .bottom': {
      backgroundColor: theme.palette.info.dark,
      borderTopRightRadius: theme.shape.borderRadius / 2,
      borderTopLeftRadius: theme.shape.borderRadius / 2,
      borderBottomRightRadius: theme.shape.borderRadius,
      borderBottomLeftRadius: theme.shape.borderRadius,
      flexGrow: 1,
      minHeight: 48,
      transition: 'height 300ms',
    },
    '& .space': {
      height: 48,
    },
  },
}));

const Actions = () => {
  const [tab, setTab] = useState(3);

  const iconPosition = useResponsiveValue({
    mobile: 'top',
    tablet: 'start',
  });

  const orientation = useResponsiveValue({
    mobile: 'horizontal',
    tablet: 'vertical',
  });

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const renderTabs = () => (
    <TabsContainer>
      <Box className="card">
        <Box className="top" sx={{ height: 40 + tab * 48 }} />
        <Box className="space" />
        <Box className="bottom" />
      </Box>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons={false}
        orientation={orientation}
      >
        <Tab
          disabled
          iconPosition={iconPosition}
          label="Pause Service"
          icon={
            <SvgIcon fontSize="small">
              <Pause />
            </SvgIcon>
          }
        />
        <Tab
          disabled
          iconPosition={iconPosition}
          label="Stop Service"
          icon={
            <SvgIcon fontSize="small">
              <StopCircle />
            </SvgIcon>
          }
        />
        <Tab
          disabled
          iconPosition={iconPosition}
          label="Pause Network"
          icon={
            <SvgIcon fontSize="small">
              <PauseCircle />
            </SvgIcon>
          }
        />
        <Tab
          iconPosition={iconPosition}
          label="Send for Signing"
          icon={
            <SvgIcon fontSize="small">
              <Share />
            </SvgIcon>
          }
        />
        <Tab
          disabled
          iconPosition={iconPosition}
          label="Generate Key"
          icon={
            <SvgIcon fontSize="small">
              <KeySkeleton />
            </SvgIcon>
          }
        />
        <Tab
          disabled
          iconPosition={iconPosition}
          label="Key Reconstruction"
          icon={
            <SvgIcon fontSize="small">
              <Redo />
            </SvgIcon>
          }
        />
      </Tabs>
    </TabsContainer>
  );

  const renderTabPanels = () => (
    <>
      <TabPanel in={tab === 0}></TabPanel>
      <TabPanel in={tab === 1}></TabPanel>
      <TabPanel in={tab === 2}></TabPanel>
      <TabPanel in={tab === 3}>
        <SendForSigningForm />
      </TabPanel>
      <TabPanel in={tab === 4}></TabPanel>
      <TabPanel in={tab === 5}></TabPanel>
    </>
  );

  return (
    <Root>
      <Grid container spacing={3}>
        <Grid item mobile={12} tablet={4}>
          {renderTabs()}
        </Grid>
        <Grid item mobile={12} tablet={8} sx={{ overflow: 'hidden' }}>
          {renderTabPanels()}
        </Grid>
      </Grid>
    </Root>
  );
};

export default Actions;
