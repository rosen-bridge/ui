'use client';

import {
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

export const RecentTransactions = () => {
  const isLarge = useBreakpoint('laptop-up');
  const isLoading = !true;
  const items = [
    { id: '3WyiVN7TNcX7ZVRMTqdR7jvbaUqLZRc61cxXkv6LjpQhusg7rddt', type: 'Reward', status: 'In Sign', lastUpdate: new Date() },
    { id: '3WyqFAeWjVTfPBepR6ZVkmPpFhe3WDxkn7cp1Y7D3VWSJznMYEk5', type: 'Payment', status: 'Completed', lastUpdate: new Date() },
    { id: '3WwbqPGKYtLQ5tk1WdMbmxbmqJyqhDA7Cxw6HAVaumVEuoXozi4H', type: 'Payment', status: 'Sign Failed', lastUpdate: new Date() },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <Button size="small">
          Active
        </Button>
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
          {items.map((item, index, items) => (
            <TableGridRow 
              key={item.id || index} 
              style={{
                borderBottom: `solid 1px ${items.length !== index + 1 ? 'whitesmoke' : 'transparent'}`,
                borderRadius: 0,
                padding: '4px 0'
              }}
            >
              <TableGridCell>
                {index + 1}
              </TableGridCell>
              {!isLarge && (
                <TableGridCell>
                  <Chip color="primary" label={item.status} loading={isLoading} />
                </TableGridCell>
              )}
              <TableGridCell>
                <Identifier loading={isLoading} value={item.id} />
              </TableGridCell>
              {isLarge && (
                <TableGridCell>
                  <Chip color="primary" label={item.type} loading={isLoading} />
                </TableGridCell>
              )}
              {isLarge && (
                <TableGridCell>
                  <Chip color="primary" label={item.status} loading={isLoading} />
                </TableGridCell>
              )}
              {isLarge && (
                <TableGridCell>
                  <DateTime loading={isLoading} timestamp={item.lastUpdate} />
                </TableGridCell>
              )}
              <TableGridCell style={{ display: 'flex', justifyContent: 'end' }}>
                {!isLoading && (
                  <Toolbar>
                    <IconButton size="small">
                      <Icon name="TrashAlt" />
                    </IconButton>
                    {!isLarge && (
                      <IconButton size="small">
                        <Icon name="Eye" />
                      </IconButton>
                    )}
                  </Toolbar>
                )}
              </TableGridCell>
            </TableGridRow>
          ))}
        </TableGridBody>
      </TableGrid>
    </Card>
  );
};
