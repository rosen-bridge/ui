import { useMemo } from 'react';

import { NETWORKS } from '@rosen-ui/constants';
import { getAddressUrl, getDecimalString, getTokenUrl } from '@rosen-ui/utils';

import { Assets as AssetType } from '@/types/api';

import { LOCK_ADDRESSES } from '../../../configs';

export const useAsset = (item: AssetType) => {
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
    const hot = item.lockedPerAddress?.find((item: AssetType) =>
      Object.values(LOCK_ADDRESSES).includes(item.address),
    );
    return [
      hot?.amount || 0,
      getAddressUrl(item.chain, hot?.address) ?? undefined,
    ];
  }, [item]);

  const [coldAmount, coldUrl] = useMemo(() => {
    const cold = item.lockedPerAddress?.find(
      (item: AssetType) =>
        !Object.values(LOCK_ADDRESSES).includes(item.address),
    );
    return [
      cold?.amount || 0,
      getAddressUrl(item.chain, cold?.address) ?? undefined,
    ];
  }, [item]);

  return {
    hot: getDecimalString(hotAmount, item.significantDecimals),
    cold: getDecimalString(coldAmount, item.significantDecimals),
    locked: getDecimalString(hotAmount + coldAmount, item.significantDecimals),
    bridged: getDecimalString(item.bridged || '0', item.significantDecimals),
    hotUrl,
    coldUrl,
    tokenUrl,
  };
};
