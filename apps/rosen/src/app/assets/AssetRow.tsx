import { useMemo, useState } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Collapse,
  Divider,
  IconButton,
  Network,
  SvgIcon,
  TableGridBodyCol,
  TableGridBodyRow,
  Token,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getAddressUrl, getDecimalString, getTokenUrl } from '@rosen-ui/utils';

import { Assets as AssetType } from '@/types/api';

import { LOCK_ADDRESSES } from '../../../configs';
import AssetRowDetails from './AssetRowDetails';

interface AssetRowProps {
  item: AssetType;
}

const AssetRow = ({ item }: AssetRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const handleToggleExpansion = () => setExpanded((prev) => !prev);

  const tokenUrl = useMemo(
    () =>
      (!item.isNative &&
        getTokenUrl(
          item.chain,
          item.chain == NETWORKS.cardano.key
            ? item.id.replace('.', '')
            : item.id,
        )) ||
      undefined,
    [item],
  );

  const [hotAmount, hotUrl] = useMemo(() => {
    const hot = item.lockedPerAddress?.find((item) =>
      Object.values(LOCK_ADDRESSES).includes(item.address),
    );
    return [
      hot?.amount || 0,
      getAddressUrl(item.chain, hot?.address) ?? undefined,
    ];
  }, [item]);

  const [coldAmount, coldUrl] = useMemo(() => {
    const cold = item.lockedPerAddress?.find(
      (item) => !Object.values(LOCK_ADDRESSES).includes(item.address),
    );
    return [
      cold?.amount || 0,
      getAddressUrl(item.chain, cold?.address) ?? undefined,
    ];
  }, [item]);

  return (
    <TableGridBodyRow>
      <TableGridBodyCol>
        <Token name={item.name} href={tokenUrl} />
      </TableGridBodyCol>
      <TableGridBodyCol>
        <Network name={item.chain} />
      </TableGridBodyCol>
      <TableGridBodyCol
        overrides={{
          mobile: { style: { display: 'none' } },
          tablet: { style: { display: 'block' } },
        }}
      >
        <Amount
          value={getDecimalString(
            (hotAmount + coldAmount).toString(),
            item.significantDecimals,
          )}
        />
      </TableGridBodyCol>
      <TableGridBodyCol
        overrides={{
          mobile: { style: { display: 'none' } },
          desktop: { style: { display: 'block' } },
        }}
      >
        <Amount
          value={getDecimalString(
            hotAmount.toString(),
            item.significantDecimals,
          )}
          href={hotUrl}
        />
      </TableGridBodyCol>
      <TableGridBodyCol
        overrides={{
          mobile: { style: { display: 'none' } },
          desktop: { style: { display: 'block' } },
        }}
      >
        <Amount
          value={getDecimalString(
            coldAmount.toString(),
            item.significantDecimals,
          )}
          href={coldUrl}
        />
      </TableGridBodyCol>
      <TableGridBodyCol
        overrides={{
          mobile: { style: { display: 'none' } },
          laptop: { style: { display: 'block' } },
        }}
      >
        <Amount
          value={getDecimalString(
            item.bridged || '0',
            item.significantDecimals,
          )}
        />
      </TableGridBodyCol>

      <TableGridBodyCol padding="actions">
        <IconButton size="small" onClick={handleToggleExpansion}>
          <SvgIcon>{expanded ? <AngleUp /> : <AngleDown />}</SvgIcon>
        </IconButton>
      </TableGridBodyCol>

      <Collapse in={expanded} sx={{ gridColumn: '1 / -1' }}>
        <Divider sx={{ mt: 1 }} />
        <TableGridBodyCol>
          <AssetRowDetails row={item} expanded={expanded} />
        </TableGridBodyCol>
      </Collapse>
    </TableGridBodyRow>
  );
};

export default AssetRow;
