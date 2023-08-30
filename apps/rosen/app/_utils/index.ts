import { RosenChainToken } from '@rosen-bridge/tokens';

export const hexToString = (hex: string) => {
  if (!hex) return '';

  let arr = new Uint8Array(
    hex.match(/[\da-f]{2}/gi)!.map((h) => {
      return parseInt(h, 16);
    }),
  );
  return new TextDecoder().decode(arr);
};

export const getTokenNameAndId = (token: RosenChainToken) => {
  if (token.tokenName && token.tokenId) {
    return {
      tokenName: token.tokenName,
      tokenId: token.tokenId,
    };
  }

  return {
    tokenName: hexToString(token.assetName),
    tokenId: token.fingerprint,
  };
};
