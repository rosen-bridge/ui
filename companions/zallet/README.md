# Rosen Zcash Zallet companion

The read-only browser bridge exposes the configured Zallet account's external
transparent receiving address and confirmed spendable transparent balance.
Start it for one browser origin; it listens only on `127.0.0.1`, uses a 15-minute random
bearer capability, and closes when that capability expires.

```text
node companion.mjs serve <config.json> <browser-origin> [port]
```

The default port is `60494`. The CLI prints the URL, origin, token, and expiry
once to the local terminal after checking the live Zebra genesis, Zallet's
node and synchronized wallet tip against that same Zebra chain, active watcher
and guard reserve, and Zallet account. Keep the token private. The
browser sends `Authorization: Bearer <token>` and its exact configured `Origin`
header to `GET /v1/account`. The bridge checks the chain, wallet sync, and
reserve again on every read. A successful response has this shape:

```json
{"network":"regtest","genesisHash":"<64 lowercase hex>","accountId":"<UUID>","reserveAddress":"<transparent address>","transparentAddress":"<external wallet transparent receiver>","spendableZat":"<decimal zat>","minimumConfirmations":1}
```

Set `NEXT_PUBLIC_ZALLET_COMPANION_URL=http://127.0.0.1:<port>` in the UI;
this value is the origin URL without `/v1/account`.

The bridge supports a CORS preflight for `GET` with the `Authorization` header.
It has no write, signing, or broadcast endpoint. It does not expose wallet
keys, RPC cookies, PCZTs, or the local configuration. The balance comes from
Zallet's `z_getbalanceforaccount` with one required confirmation. The address
comes from an external derived transparent entry, or from the transparent
receiver of an existing account Unified Address. Change and standalone
watch-only addresses are excluded. Neither read generates an address.

This local companion turns one canonical Rosen lock intent into a Zallet-signed
Zcash transaction. It accepts Regtest, Testnet, and Mainnet configurations. The
intent and Zebra genesis must match the canonical genesis for that network;
Mainnet also requires Zebra's `chain: "main"`, connected headers, and a synchronized
Zallet wallet. Zebra reports `chain: "test"` even on Regtest, so the genesis is
the network identity check there. See the
[Zcash protocol specification](https://zips.z.cash/protocol/protocol.pdf).
Zebra 6.3.0 does not report `initial_block_download_complete`; the companion
requires connected headers to equal blocks and verification progress of at least
0.9999 on public networks before preparing or submitting. These local fields do
not prove peer connectivity, so the operator must also monitor the public node's
readiness. Mainnet use still requires an end-to-end NU6.3 qualification and
Rosen operator approval; this configuration check alone does not establish it.

The `prepare` command validates the exact intent bytes, derives the RCS-003
payload from the Ergo P2PK destination and fees, verifies that the configured
watcher and guard use the requested reserve, checks the Zebra genesis and current
next-block consensus branch, asks
Zallet to create a wallet-hinted PCZT, replaces one unique 5,000-zat wallet
placeholder with the zero-value 51-byte Rosen `OP_RETURN`, and writes a review
file. It does not sign or submit.

```text
node companion.mjs prepare <config.json> <intent.json> <new-session-directory>
```

After a human approves the exact review, the `submit` command rechecks the
intent, approval, PCZT, genesis, and active reserve. It asks Zallet to sign,
extracts and independently inspects the raw transaction, binds its inputs to
the approved PCZT, validates the outputs and the transformer-verified ZIP-317 fee bound to the approved review,
writes a one-shot attempt marker, submits
once, and emits the frozen schema-v1 receipt.

```text
node companion.mjs submit <config.json> <intent.json> <session-directory> <approval.json> <new-receipt.json>
```

The receipt status is `submitted`. Confirmation and Rosen watcher observation
are separate verifier steps. Cookie-authenticated RPC destinations must use
HTTPS or loopback HTTP. Wallet keys, RPC cookies, PCZTs, approvals, sessions,
and local configuration stay outside Git.

Build the pinned transformer with Cargo and put its absolute path and SHA-256,
along with the pinned native inspector path and SHA-256, in the local config.
The config also supplies Zallet and Zebra RPC endpoints and cookie paths, the
wallet account and placeholder address, and the active watcher and guard JSON
paths.
