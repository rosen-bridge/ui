'use client';

import { useState } from 'react';

import {
  Icon,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanels,
  TabsPanel,
  useResponsiveValue,
} from '@rosen-bridge/ui-kit';

import { RequestAnOrderForm } from './RequestAnOrderForm';
import { RequestToSignForm } from './RequestToSignForm';

import './style.css';

const Actions = () => {
  const [tab, setTab] = useState(3);

  const iconPosition = useResponsiveValue({
    mobile: 'top',
    tablet: 'start',
  });

  return (
    <Tabs
      className='actions'
      gap={2}
      value={tab}
      rewrite={{ 
        mobile: { orientation: 'horizontal' },
        tablet: { orientation: 'vertical' }
      }}
      onChange={(value) => setTab(value as number)}
    >
      <TabsList 
        align="center" 
        rewrite={{ 
          mobile: { grow: true },
          tablet: { grow: false },
        }}
      >
        <TabsTrigger
          disabled
          icon={<Icon name="Pause" size="small" />}
          iconPosition={iconPosition}
          value={0}
        >
          Pause Service
        </TabsTrigger>
        <TabsTrigger
          disabled
          icon={<Icon name="StopCircle" size="small" />}
          iconPosition={iconPosition}
          value={1}
        >
          Stop Service
        </TabsTrigger>
        <TabsTrigger
          disabled
          icon={<Icon name="Pause" size="small" />}
          iconPosition={iconPosition}
          value={2}
        >
          Pause Network
        </TabsTrigger>
        <TabsTrigger
          icon={<Icon name="FileEditAlt" size="small" />}
          iconPosition={iconPosition}
          value={3}
        >
          Request To Sign
        </TabsTrigger>
        <TabsTrigger
          icon={<Icon name="ReceiptAlt" size="small" />}
          iconPosition={iconPosition}
          value={4}
        >
          Request An Order
        </TabsTrigger>
        <TabsTrigger
          disabled
          icon={<Icon name="KeySkeleton" size="small" />}
          iconPosition={iconPosition}
          value={5}
        >
          Generate Key
        </TabsTrigger>
        <TabsTrigger
          disabled
          icon={<Icon name="Redo" size="small" />}
          iconPosition={iconPosition}
          value={6}
        >
          Key Reconstruction
        </TabsTrigger>
      </TabsList>
      <TabsPanels>
        <TabsPanel value={0}></TabsPanel>
        <TabsPanel value={1}></TabsPanel>
        <TabsPanel value={2}></TabsPanel>
        <TabsPanel value={3}>
          <RequestToSignForm />
        </TabsPanel>
        <TabsPanel value={4}>
          <RequestAnOrderForm />
        </TabsPanel>
        <TabsPanel value={5}></TabsPanel>
        <TabsPanel value={6}></TabsPanel>
      </TabsPanels>
    </Tabs>
  );
};

export default Actions;

// TODO
{/* <Slide
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
</Slide> */}

// const Root = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   flexDirection: 'row',
//   backgroundColor: theme.palette.background.paper,
//   marginTop: theme.spacing(2),
//   marginBottom: theme.spacing(2),
//   marginLeft: -theme.shape.borderRadius * 2,
//   marginRight: -theme.shape.borderRadius * 2,
//   paddingLeft: theme.shape.borderRadius * 2,
//   paddingRight: theme.shape.borderRadius * 2,
//   [theme.breakpoints.down('tablet')]: {
//     display: 'block',
//     marginLeft: `-${theme.spacing(2)}`,
//     marginRight: theme.spacing(-2),
//     paddingRight: theme.spacing(2),
//   },
// }));

// const TabsContainer = styled(Box)(({ theme }) => ({
//   'position': 'relative',
//   'height': 'calc(100% + 32px)',
//   'margin': theme.spacing(-2, 0),
//   [theme.breakpoints.down('tablet')]: {
//     margin: theme.spacing(-3, -2),
//   },
//   '& .MuiTabs-root': {
//     'paddingTop': theme.spacing(5),
//     'paddingBottom': theme.spacing(5),
//     [theme.breakpoints.down('tablet')]: {
//       padding: theme.spacing(1, 2, 0, 2),
//       backgroundColor: theme.palette.primary.main,
//     },
//     '& .MuiTab-root': {
//       minHeight: 48,
//       justifyContent: 'start',
//       textAlign: 'left',
//       color: theme.palette.primary.contrastText,
//       fontSize: theme.typography.body2.fontSize,
//       [theme.breakpoints.down('tablet')]: {
//         width: '10em',
//         textAlign: 'center',
//       },
//     },
//     '& .Mui-selected': {
//       color: theme.palette.primary.dark,
//       [theme.breakpoints.down('tablet')]: {
//         backgroundColor: theme.palette.background.paper,
//         borderTopRightRadius: theme.shape.borderRadius,
//         borderTopLeftRadius: theme.shape.borderRadius,
//       },
//     },
//     '& .MuiTabs-indicator': {
//       width: 0,
//       height: 0,
//     },
//   },
//   '& .card': {
//     'position': 'absolute',
//     'width': '100%',
//     'height': '100%',
//     'display': 'flex',
//     'flexDirection': 'column',
//     [theme.breakpoints.down('tablet')]: {
//       display: 'none',
//     },
//     '& .top': {
//       backgroundColor: theme.palette.primary.main,
//       borderTopRightRadius: theme.shape.borderRadius,
//       borderTopLeftRadius: theme.shape.borderRadius,
//       borderBottomRightRadius: theme.shape.borderRadius / 2,
//       borderBottomLeftRadius: theme.shape.borderRadius / 2,
//       transition: 'height 300ms',
//     },
//     '& .bottom': {
//       backgroundColor: theme.palette.primary.main,
//       borderTopRightRadius: theme.shape.borderRadius / 2,
//       borderTopLeftRadius: theme.shape.borderRadius / 2,
//       borderBottomRightRadius: theme.shape.borderRadius,
//       borderBottomLeftRadius: theme.shape.borderRadius,
//       flexGrow: 1,
//       minHeight: 48,
//       transition: 'height 300ms',
//     },
//     '& .space': {
//       height: 48,
//     },
//   },
// }));
