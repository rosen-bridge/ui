'use client';

import { useState } from 'react';
import { useStickyBox } from 'react-sticky-box';

import { styled } from '@mui/material';
import {
  NewPagination,
  SmartSearch,
  useTableDataPagination,
} from '@rosen-bridge/ui-kit';

import { ApiEventResponse } from '@/_types';

import { defaultSort, filters, sorts } from './smartSearchConfig';

const getKey = (filters: string) => (offset: number, limit: number) => {
  return [
    `/v1/events?offset=${offset}&limit=${limit}${filters ? '&' : ''}${filters}`,
  ];
};

const Layout = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const Events = () => {
  const [query, setQuery] = useState('');

  const {
    data,
    isLoading,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    isFirstLoad,
    isFirstPage,
    isLastPage,
  } = useTableDataPagination<ApiEventResponse>(getKey(query));

  const stickyRef = useStickyBox({
    offsetTop: 16,
    offsetBottom: 16,
  });

  if (!data) return null;

  return (
    <Layout>
      <div style={{ flexBasis: '100%' }}>
        <SmartSearch
          namespace="events"
          filters={filters}
          sorts={sorts}
          defaultSort={defaultSort}
          onChange={(selected) => {
            console.log('selected', selected);
            setQuery(selected.query);
          }}
        />
      </div>
      <div style={{ flexGrow: '1' }}>
        <div
          style={{
            flexGrow: '1',
            height: '200vh',
            background: 'white',
            padding: '16px',
            borderRadius: '16px',
          }}
        >
          body
        </div>
        <br />
        <NewPagination
          page={1}
          total={data.total}
          pageSize={10}
          pageSizeOptions={[10, 50, 100]}
          onPageChange={() => undefined}
          onSizeChange={() => undefined}
        />
      </div>
      <div
        style={{
          flexBasis: '330px',
        }}
      >
        <div
          ref={stickyRef}
          style={{
            height: '120vh',
            background: 'white',
            width: '330px',
            padding: '16px',
            borderRadius: '16px',
          }}
        >
          sidebar
        </div>
      </div>
    </Layout>
  );
};

export default Events;
