import { RosenTokens } from '@rosen-bridge/tokens';

export const testTokenMap: RosenTokens = JSON.parse(`[]`);

export const multiDecimalTokenMap: RosenTokens = JSON.parse(`
  [
    { 
      "cardano": {
        "tokenId": "6d7cc9577a04be165cc4f2cf36f580dbeaf88f68e78f790805430940.72734254432d6c6f656e",
        "extra": {
          "policyId": "6d7cc9577a04be165cc4f2cf36f580dbeaf88f68e78f790805430940",
          "assetName": "72734254432d6c6f656e"
        },
        "name": "rsBTC-loen",
        "decimals": 6,
        "type": "CIP26",
        "residency": "wrapped"
      },
      "bitcoin": {
        "tokenId": "btc",
        "name": "BTC",
        "decimals": 8,
        "type": "native",
        "residency": "native",
        "extra": {}
      }
    }
  ]
`);
