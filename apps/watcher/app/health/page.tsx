'use client';

import { useState } from 'react';

import {
  useResponsiveValue,
  EnhancedTable,
  TableRow,
  TableCell,
  TableHeadItem,
} from '@rosen-bridge/ui-kit';

const test = [
  {
    id: '3W',
    fromChain: 'Chain A',
    toChain: 'Chain B',
    amount: 1250,
    fromAddress: '',
    toAddress: '',
    height: '',
    networkFee: '',
    bridgeFee: '',
    sourceChainTokenId: '',
    targetChainTokenId: '',
    sourceTxId: '',
    sourceBlockId: '',
    requestId: '',
    block: '',
    extractor: '',
  },
  {
    id: '3Wv',
    fromChain: 'Chain P',
    toChain: 'Chain B',
    amount: 1250,
  },
  {
    id: '3Wvu',
    fromChain: 'Chain W',
    toChain: 'Chain B',
    amount: 1250,
  },
  {
    id: '3Wvux',
    fromChain: 'Chain K',
    toChain: 'Chain B',
    amount: 1250,
  },
  {
    id: '3Wvuxxkc',
    fromChain: 'Chain M',
    toChain: 'Chain B',
    amount: 1250,
  },
];

const head: TableHeadItem[] = [
  {
    title: '#',
    cellProps: {
      width: 50,
    },
  },
  {
    title: 'Id',
    cellProps: {
      width: 250,
    },
  },
  {
    title: 'From chain',
    cellProps: {
      width: 200,
    },
  },
  {
    title: 'To chain',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Amount',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Height',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Network fee',
    cellProps: {
      width: 150,
    },
  },
  {
    title: 'Bridge fee',
    cellProps: {
      width: 150,
    },
  },
];

const mobileHead: TableHeadItem[] = [
  {
    title: '#',
    cellProps: {
      width: '10%',
    },
  },
  {
    title: 'Id',
    cellProps: {
      width: '30%',
    },
  },
  {
    title: 'From chain',
    cellProps: {
      width: '60%',
    },
  },
];

const Row = (row: any) => {
  const [expand, set_expand] = useState<boolean>(false);

  const toggle_expand = () => {
    set_expand((prevState: boolean) => !prevState);
  };

  return (
    <>
      <TableRow className="divider">
        <TableCell>{row.number}</TableCell>
        <TableCell>
          <div>{row.id}</div>
        </TableCell>
        <TableCell>{row.fromChain}</TableCell>
        <TableCell>{row.toChain}</TableCell>
        <TableCell align="right">{row.amount.toFixed(2)}</TableCell>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>
      </TableRow>
    </>
  );
};

const MobileRow = (row: any) => {
  const [expand, set_expand] = useState<boolean>(false);

  const toggle_expand = () => {
    set_expand((prevState: boolean) => !prevState);
  };

  return (
    <>
      <TableRow className="divider">
        <TableCell>{row.number}</TableCell>
        <TableCell>
          <div>{row.id}</div>
        </TableCell>
        <TableCell>{row.fromChain}</TableCell>
      </TableRow>
    </>
  );
};

const Health = () => {
  const val = useResponsiveValue({
    mobile: 'mobile',
    // tablet: 'tablet',
    // laptop: 'laptop',
    // desktop: 'desktop',
  });

  console.log('@@@@@ value', val);

  return (
    <div>
      <EnhancedTable
        data={test}
        mobileTableHead={head}
        renderMobileRow={(row) => <Row key={row.id} {...row} />}
        paginated
        pageSize={2}
      />
    </div>
  );
};
export default Health;
