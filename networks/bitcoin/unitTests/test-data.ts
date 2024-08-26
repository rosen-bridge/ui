import { RosenTokens } from '@rosen-bridge/tokens';

export const testTokenMap: RosenTokens = JSON.parse(`
  {
    "idKeys" : {
      "ergo" : "tokenId",
      "cardano" : "tokenId",
      "bitcoin" : "tokenId"
    },
    "tokens" : []
  }
`);

export const multiDecimalTokenMap: RosenTokens = JSON.parse(`
  {
    "idKeys" : {
      "ergo" : "tokenId",
      "cardano" : "tokenId",
      "bitcoin" : "tokenId"
    },
    "tokens" : [
      { 
        "cardano": {
          "tokenId": "6d7cc9577a04be165cc4f2cf36f580dbeaf88f68e78f790805430940.72734254432d6c6f656e",
          "policyId": "6d7cc9577a04be165cc4f2cf36f580dbeaf88f68e78f790805430940",
          "assetName": "72734254432d6c6f656e",
          "name": "rsBTC-loen",
          "decimals": 6,
          "metaData": {
            "type": "CIP26",
            "residency": "wrapped"
          }
        },
        "bitcoin": {
          "tokenId": "btc",
          "name": "BTC",
          "decimals": 8,
          "metaData": {
            "type": "native",
            "residency": "native"
          }
        }
      }
    ]
  }
`);
