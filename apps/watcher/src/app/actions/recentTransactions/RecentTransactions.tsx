'use client';

import { useState } from 'react';

import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardTitle,
  Chip,
  DateTime,
  Icon,
  IconButton,
  Identifier,
  TableGrid,
  TableGridBody,
  TableGridCell,
  TableGridHeader,
  TableGridRow,
  Toolbar,
  useBreakpoint,
} from '@rosen-bridge/ui-kit';

import { STATUS_MAP, TYPE_MAP } from './constants';
import { Details } from './Details';
import { RecentTransaction } from './types';

export const RecentTransactions = () => {
  const [current, setCurrent] = useState<RecentTransaction>();
  const isLarge = useBreakpoint('laptop-up');
  const isLoading = !true;
  const items: RecentTransaction[] = [
    {
      id: '3WyiVN7TNcX7ZVRMTqdR7jvbaUqLZRc61cxXkv6LjpQhusg7rddt',
      type: 'reward',
      status: 'in-sign',
      lastUpdate: Date.now(),
    },
    {
      id: '3WyqFAeWjVTfPBepR6ZVkmPpFhe3WDxkn7cp1Y7D3VWSJznMYEk5',
      type: 'payment',
      status: 'completed',
      lastUpdate: Date.now(),
    },
    {
      id: '3WwbqPGKYtLQ5tk1WdMbmxbmqJyqhDA7Cxw6HAVaumVEuoXozi4H',
      type: 'payment',
      status: 'sign-failed',
      lastUpdate: Date.now(),
    },
  ];
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <Button size="small">Active</Button>
        </CardHeader>
        <TableGrid style={{ gap: 0 }}>
          <TableGridHeader style={{ borderRadius: 0 }}>
            <TableGridCell>#</TableGridCell>
            {!isLarge && <TableGridCell />}
            <TableGridCell>Id</TableGridCell>
            {isLarge && <TableGridCell>Type</TableGridCell>}
            {isLarge && <TableGridCell>Status</TableGridCell>}
            {isLarge && <TableGridCell>Last Update</TableGridCell>}
            <TableGridCell />
          </TableGridHeader>
          <TableGridBody>
            {items.map((item, index, items) => {
              const status = STATUS_MAP[item.status];

              const type = TYPE_MAP[item.type];

              return (
                <TableGridRow
                  key={item.id || index}
                  style={{
                    borderBottom: `solid 1px ${items.length !== index + 1 ? 'whitesmoke' : 'transparent'}`,
                    borderRadius: 0,
                    padding: '4px 0',
                  }}
                >
                  <TableGridCell>{index + 1}</TableGridCell>
                  {!isLarge && (
                    <TableGridCell>
                      <Avatar 
                        background={status.backgroundColor}
                        color={status.color}
                        loading={isLoading}
                        size="28px"
                      >
                        <Icon name={status.icon} size="16px" />
                      </Avatar>
                    </TableGridCell>
                  )}
                  <TableGridCell>
                    <Identifier loading={isLoading} value={item.id} />
                  </TableGridCell>
                  {isLarge && (
                    <TableGridCell>
                      <Chip
                        color="neutral-light"
                        label={type}
                        loading={isLoading}
                      />
                    </TableGridCell>
                  )}
                  {isLarge && (
                    <TableGridCell>
                      <Chip
                        color={status.color}
                        icon={status.icon}
                        label={item.status}
                        loading={isLoading}
                      />
                    </TableGridCell>
                  )}
                  {isLarge && (
                    <TableGridCell>
                      <DateTime loading={isLoading} timestamp={item.lastUpdate} />
                    </TableGridCell>
                  )}
                  <TableGridCell
                    style={{ display: 'flex', justifyContent: 'end' }}
                  >
                    {!isLoading && (
                      <Toolbar>
                        <IconButton size="small" onClick={() => 'TODO'}>
                          <Icon name="TrashAlt" />
                        </IconButton>
                        {!isLarge && (
                          <IconButton
                            size="small"
                            onClick={() => setCurrent(item)}
                          >
                            <Icon name="Eye" />
                          </IconButton>
                        )}
                      </Toolbar>
                    )}
                  </TableGridCell>
                </TableGridRow>
              )
            })}
          </TableGridBody>
        </TableGrid>
      </Card>
      <Details value={current} onClose={() => setCurrent(undefined)} />
    </>
  );
};
