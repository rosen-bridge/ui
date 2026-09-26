# Local Ergo devnet wallet

This companion serves one Ergo-to-transparent-Zcash return from an isolated Ergo 6.0.3 devnet. It binds `127.0.0.1`, uses one disposable Ergo key held outside the browser, and accepts one explicitly selected unspent input. Starting without `--enable-sign-and-submit` permits account and balance checks while signing remains disabled.

Create a local JSON configuration outside this repository with these fields:

| Field | Value |
| --- | --- |
| `network`, `zcashNetwork` | `devnet`, `regtest` |
| `nodeUrl` | `http://127.0.0.1:19051` |
| `port` | Loopback companion port, for example `19071` |
| `allowedOrigin` | Exact local UI origin, for example `http://localhost:3000` |
| `firstBlockId` | First block ID returned by the active node at height one |
| `allowedBoxId` | Fresh, unspent rsZEC box owned by the disposable key |
| `tokenId`, `minFeeNft` | Active rsZEC token ID and MinFee NFT |
| `amount` | Exact rsZEC amount in the allowed box and Lock output |
| `bridgeFee`, `networkFee` | Exact fees from the active confirmed MinFee box |
| `ergoFee` | Exact Ergo miner fee required for this isolated return |
| `lockAddress` | Active Ergo Lock address |
| `targetAddress` | Exact transparent Zcash regtest destination |
| `keyFile`, `apiKeyFile` | Absolute paths to local JSON files containing `secretHex` (64 hex characters) and `apiKey` respectively |

Start it with `node companions/ergo-devnet/companion.mjs <absolute-config-path> --enable-sign-and-submit` after selecting the current unspent box and verifying the active deployment. The process prints a fresh session code. Enter that code when connecting **Local Ergo devnet** in the UI. The companion signs only one transaction for that session and submits only the transaction it just checked and signed.

Run the UI in development mode on the configured origin. Set `NEXT_PUBLIC_ZCASH_NETWORK=regtest`, `NEXT_PUBLIC_ERGO_DEVNET_COMPANION_URL=http://127.0.0.1:<port>`, `ERGO_DEVNET_MODE=isolated`, `ERGO_DEVNET_NODE_URL=http://127.0.0.1:19051`, `ERGO_DEVNET_NODE_API_KEY_FILE=<absolute-api-key-file>`, `ERGO_DEVNET_FIRST_BLOCK_ID=<firstBlockId>`, `ERGO_DEVNET_TOKEN_ID=<tokenId>`, `ERGO_DEVNET_MIN_FEE_NFT=<minFeeNft>`, and `ERGO_DEVNET_MINER_FEE=<ergoFee>`. Generate the UI's active `TOKENS`, `LOCK_ADDRESSES`, and `FEE_CONFIG_TOKEN_ID` from the same deployed contracts and token map. Keep the configured Ergo source route unblocked in `NEXT_PUBLIC_BLOCKED_TOKENS`.
