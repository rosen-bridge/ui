# Bitcoin Cash endpoints

Two publicly listed services passed the BCH UI reader checks on 1 October 2026:
`cashnode.bch.ninja:50002` and `electron.jochen-hoenicke.de:51002`.
These are candidates for operator configuration. The observation is dated;
availability, certificate renewal and service limits need monitoring.

## Scope and requirements

[RCS-003, revision `7b9784dae9d8d5b66b80de7a6043d1ba36a3a4bf`](https://github.com/rosen-bridge/rcs/blob/7b9784dae9d8d5b66b80de7a6043d1ba36a3a4bf/rcs-003/README.md#requirements)
requires multiple independent node or explorer endpoints with the APIs needed
by Watchers and Guards. It does not prescribe a fixed endpoint count. One
provider implementation can use different configured services, but additional
hostnames alone do not establish independent administration or infrastructure.

| Surface | Required API | Evidence and status | Remaining owner |
| --- | --- | --- | --- |
| UI reader | Verified TLS, Electrum 1.5–1.6, BCH checkpoint, tip and native `listunspent` | Two listed services passed; snapshots were empty | Deployment operator: monitoring, rate limits and endpoint selection |
| UI authenticated parents | `blockchain.transaction.get` for every listed parent | Offline tests cover authentication; these empty live snapshots did not exercise the method | Deployment operator: populated-address qualification |
| Watcher scanner | BCHN `getblockchaininfo`, `getnetworkinfo`, `getblockhash`, `getblockheader`, `getblock`, `getrawtransaction` | These RPC contracts differ from Electrum; not qualified by this observation | Watcher operator: independent compatible node endpoints |
| Guard provider | BCHN reads above, `gettxout`, `getaddressinfo`, `listunspent`, `getindexinfo`, `getbestblockhash`, `getrawmempool` and wallet-history reads | Wallet/index configuration and independent RPC endpoints remain unqualified | Guard operator |
| Submission | Dedicated validated submission path and node acceptance | No live submission was performed; reader sessions forbid broadcast | Deployment operator and integration maintainer |

The RCS Watcher/Guard endpoint requirement remains open. The live observations
below establish UI read compatibility within their exercised methods.

## Published services

[BCH Ninja](https://bch.ninja/) publishes its mainnet SSL endpoint and identifies
Kallisti.cash as the service provider. The
[Electron Cash server list](https://github.com/Electron-Cash/Electron-Cash/blob/fdc0fff298854e1e24b3187104408b038f2d5ca8/electroncash/servers.json)
publishes both selected hosts and ports. The second service is attributed to
the [Jochen Hoenicke domain](https://jochen-hoenicke.de/); the personal homepage
does not separately state the Electrum service contract or an availability SLA.

The selected endpoints have distinct public domains and observed peer IPs.
This supports endpoint diversity. Independent administration, upstream-node
dependencies and hosting failure domains still need operator confirmation.

## Observation

The bounded observation ran from `2026-10-01T19:13:03.007Z` to
`2026-10-01T19:13:06.829Z`, using the compiled, previously validated UI reader.
Each session had an 8-second operation deadline and a qualification cap of
40 read requests. Certificate and hostname verification remained enabled.

| Endpoint | Observed peer IP | TLS | Server / negotiated protocol | Height | Result |
| --- | --- | --- | --- | --- | --- |
| `cashnode.bch.ninja:50002` | `135.148.236.246` | Authorized TLS 1.3 | Fulcrum 2.1.2 / 1.6 | 971047 | Height and stable empty native snapshot passed |
| `electron.jochen-hoenicke.de:51002` | `176.9.150.253` | Authorized TLS 1.3 | Fulcrum 2.1.2 / 1.6 | 971047 | Height and stable empty native snapshot passed |
| `bch.imaginary.cash:50002` | `67.223.119.97` | Authorized TLS 1.3 | Fulcrum 2.1.2 / 1.6 | 971047 | Additional candidate; operator attribution not independently established |
| `electroncash.dk:50002` | Not recorded | Rejected before RPC | Not negotiated | Not read | `DEPTH_ZERO_SELF_SIGNED_CERT` |

The rejected service also [publishes SSL port 50002](https://electroncash.dk/),
but its observed certificate does not meet this reader's CA verification policy.

All accepted sessions authenticated the 80-byte header at height 661648 against
the BCHN Axion checkpoint
`0000000000000000029e471c41818d24b8b74c911071c4ef0b4a0509f9b5a8ce`.
The checkpoint is pinned in
[BCHN chain parameters, revision `7359f5ce1d1bf4984e84ff59e4dc8e1e2cc7e936`](https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node/-/blob/7359f5ce1d1bf4984e84ff59e4dc8e1e2cc7e936/src/chainparams.cpp).
Their observed tip hash was
`00000000000000000137e17342a29c3d4d7063750061655a60a47963f5311afe`.

The public snapshot address was BCH Ninja's published donation address,
`bitcoincash:qzvj8dvrj52fmnwcxz2dd2e2tgnmgze47u099rchsf`.
Its confirmed native list was empty on all accepted services. Each reader
relisted the address and compared a stable tip before returning zero satoshis.
All seven sockets were destroyed. No subscription, signature, wallet RPC or
broadcast method was used.

## TLS certificate observations

Certificates can rotate. These fingerprints identify the observed certificates
and are not configured pins or substitutes for CA and hostname verification.

| Endpoint | Certificate subject CN | Issuer CN | Valid until UTC | SHA-256 fingerprint |
| --- | --- | --- | --- | --- |
| BCH Ninja | `cashnode.bch.ninja` | `YE2` | 29 December 2026 01:59:48 | `AB:95:12:02:58:41:C8:17:D4:56:89:25:09:8B:D4:D0:CC:69:48:9B:A5:5B:64:D1:B0:0A:D3:62:DB:2D:BC:FA` |
| Jochen Hoenicke domain | `ssd.jhoenicke.de` | `YR2` | 6 December 2026 23:34:20 | `2A:06:6A:4A:16:93:23:BE:C5:84:7F:C0:92:DC:D1:27:08:64:F6:44:8B:EB:81:79:BE:D0:A5:52:0F:F4:12:E8` |
| Imaginary Cash | `bch.imaginary.cash` | `YR2` | 27 October 2026 18:58:19 | `3D:11:E4:34:01:92:7E:42:7C:36:26:FF:43:90:C7:E7:DC:79:18:EB:D5:AD:1E:1D:E8:E0:2D:DF:B5:57:01:F4` |

## Reproducibility and trust

The receipt SHA-256 is
`5d90d79f9d15020235f75b490318007d1d309d5ac9f3fc1bed99e71017847f59`.
Its frozen reader inputs were:

- `electrumSession.ts`: `b22dc3378fec86a43d40dd2734a59d8c03e4f614e8e5c4584436dc5f2c218870`
- `bitcoinCashElectrumProvider.ts`: `5a231ade12fec63adcccffc87e3f6156912cc4340ef39c7f65627ab1abd92177`
- `server/index.ts`: `2881d8b0b326940c41fc1681198936e61a4ccd7cc56232422362dba99e634d3d`

The wire protocol source is
[Electrum Cash protocol, revision `631ee9eccfc82baf61c9257611553502ed9081a2`](https://github.com/cculianu/electrum-cash-protocol/blob/631ee9eccfc82baf61c9257611553502ed9081a2/protocol-methods.rst).
The configured indexer remains trusted for unspent status and reported heights.
Checkpoint identity and parent authentication do not provide SPV inclusion or
prove the honesty of an indexer. Separate configured provider instances can
serve separate endpoints; automatic failover and cross-endpoint quorum are not
implemented by this factory.
