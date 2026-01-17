import { NETWORKS } from '@rosen-ui/constants';
import { getAddressUrl, getDecimalString, getTokenUrl } from '@rosen-ui/utils';

import { Assets } from '@/types/api';

import { LOCK_ADDRESSES } from '../../../configs';

export type AssetsFullData = ReturnType<typeof getFullAssetData>;

export const getFullAssetData = (item: Assets) => {
  const tokenUrl = (() => {
    if (item.isNative) return;

    const tokenId =
      item.chain === NETWORKS.cardano.key ? item.id.replace('.', '') : item.id;

    return getTokenUrl(item.chain, tokenId);
  })();

  const cold = item.lockedPerAddress?.find((item) => {
    return !Object.values(LOCK_ADDRESSES).includes(item.address);
  });

  const coldUrl = getAddressUrl(item.chain, cold?.address);

  const coldAmount = getDecimalString(
    cold?.amount || 0,
    item.significantDecimals,
  );

  const hot = item.lockedPerAddress?.find((item) => {
    return Object.values(LOCK_ADDRESSES).includes(item.address);
  });

  const hotUrl = getAddressUrl(item.chain, hot?.address);

  const hotAmount = getDecimalString(
    hot?.amount || 0,
    item.significantDecimals,
  );

  const lockedAmount = getDecimalString(
    (hot?.amount || 0) + (cold?.amount || 0),
    item.significantDecimals,
  );

  const bridgedAmount = getDecimalString(
    item.bridged ?? '0',
    item.significantDecimals,
  );

  return {
    ...item,
    tokenUrl,
    coldAmount,
    coldUrl,
    hotAmount,
    hotUrl,
    lockedAmount,
    bridgedAmount,
    bridged: [],
    ergoSideTokenId: item.ergoSideTokenId,
  };
};
