'use client';

import { useState } from 'react';

import {
  ApiKeyDialogProtectedAction,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Chip,
  DateTime,
  EmptyState,
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
  useConfirm,
  useToast,
} from '@rosen-bridge/ui-kit';

import { STATUS_MAP, TYPE_MAP } from './constants';
import { Details } from './Details';
import { RecentTransaction } from './types';

export const RecentTransactions = () => {
  const [current, setCurrent] = useState<RecentTransaction>();
  const isLarge = useBreakpoint('laptop-up');
  const { confirm, ConfirmDialog } = useConfirm();
  const toast = useToast();
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
  const remove = async (id: string) => {
    try {
      await id;

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) resolve(undefined);
          else reject();
        }, 500);
      });

      toast.add({
        type: 'success',
        description: 'TODO',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.add({
          type: 'error',
          description: 'The Api key is not correct',
        });
      } else {
        toast.add({
          type: 'error',
          description: error.message,
          dismissible: true,
          timeout: 0,
          more: () => JSON.stringify(error.response?.data, null, 2),
        });
      }
    }
  };

  const onRemove = async (id: string) => {
    await confirm({
      title: 'Remove Transaction',
      content: 'Are you sure you want to remove this transaction?',
      confirmText: 'Remove',
      onConfirm: () => remove(id),
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <Button size="small">Active</Button>
          {/* TODO */}
          {/* <Menu>
            <MenuTrigger
              as={Button}
              size="large"
              variant="standard"
            >
              Active
            </MenuTrigger>
            <MenuBody>
              <MenuItem>Item 1</MenuItem>
              <MenuItem>Item 2</MenuItem>
              <MenuItem>Item 3</MenuItem>
            </MenuBody>
          </Menu> */}
        </CardHeader>
        {!isLoading && !items.length ? (
          <CardBody>
            <EmptyState />
          </CardBody>
        ) : (
          <TableGrid variant="standard">
            <TableGridHeader>
              <TableGridCell>#</TableGridCell>
              {!isLarge && <TableGridCell />}
              <TableGridCell>Id</TableGridCell>
              {isLarge && <TableGridCell>Type</TableGridCell>}
              {isLarge && <TableGridCell>Status</TableGridCell>}
              {isLarge && <TableGridCell>Last Update</TableGridCell>}
              <TableGridCell />
            </TableGridHeader>
            <TableGridBody>
              {items.map((item, index) => {
                const status = STATUS_MAP[item.status];

                const type = TYPE_MAP[item.type];

                return (
                  <TableGridRow key={item.id || index}>
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
                        <DateTime
                          loading={isLoading}
                          timestamp={item.lastUpdate}
                        />
                      </TableGridCell>
                    )}
                    <TableGridCell
                      style={{ display: 'flex', justifyContent: 'end' }}
                    >
                      {!isLoading && (
                        <Toolbar>
                          <ApiKeyDialogProtectedAction>
                            <IconButton
                              size="small"
                              onClick={() => onRemove(item.id)}
                            >
                              <Icon name="TrashAlt" />
                            </IconButton>
                          </ApiKeyDialogProtectedAction>
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
                );
              })}
            </TableGridBody>
          </TableGrid>
        )}
      </Card>
      <Details value={current} onClose={() => setCurrent(undefined)} />
      {ConfirmDialog}
    </>
  );
};
