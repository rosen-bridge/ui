import { AssetBalance } from '@rosen-bridge/selection-types';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';

export class InsufficientAssetsError extends Error {
  public name = 'InsufficientAssetsError';
  constructor(
    public values: string[] = [],
    public cause?: unknown,
  ) {
    super(
      `The transaction cannot be completed because at least ${values.join(' and ')} ${values.length === 1 ? 'is' : 'are'} still required to cover fees or minimum box requirements.`,
      {
        cause,
      },
    );
  }
}

export const handleUncoveredAssets = (
  tokenMap: TokenMap,
  nativeTokenKey: Network,
  assetBalance?: AssetBalance,
) => {
  const values: string[] = [];

  const nativeToken = tokenMap
    .search(nativeTokenKey, { tokenId: NETWORKS[nativeTokenKey].nativeToken })
    .at(0)![nativeTokenKey];

  if (assetBalance && assetBalance?.nativeToken !== 0n) {
    const decimals = nativeToken.decimals;

    const amount = getDecimalString(assetBalance.nativeToken, decimals);

    const value = `${amount} ${nativeToken.name}`;

    values.push(value);
  }

  for (const tokenInfo of assetBalance?.tokens || []) {
    const token: RosenChainToken = tokenMap
      .search(nativeTokenKey, { tokenId: tokenInfo.id })
      .at(0)![nativeTokenKey];

    const decimals = token.decimals;

    const amount = getDecimalString(tokenInfo.value, decimals);

    const value = `${amount} ${token.name}`;

    values.push(value);
  }

  if (!values.length) {
    throw new Error('Unexpected Error');
  }

  throw new InsufficientAssetsError(values);
};
