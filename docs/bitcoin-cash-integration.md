# Native Bitcoin Cash UI integration

A. Shannon · 2 October 2026 · Draft

The proposed scope is native BCH on mainnet, with eight decimal places and
explicit `bitcoincash:` addresses. CashTokens are excluded. This document covers
the UI contribution; Rosen acceptance and operational activation remain pending.
The cross-repository requirements are tracked in the coordinating
[Bitcoin Cash integration draft][Coordinating integration], proposed for the Guard
contribution. Neither draft establishes upstream submission or acceptance.

## Requirements and evidence

The authoritative contribution standards are [RCS-001], [RCS-002] and [RCS-003],
verified at revision `7b9784dae9d8d5b66b80de7a6043d1ba36a3a4bf` on 1 October 2026.
The UI source baseline is `a5f49e8b6dc2f023cd2cc37b0464ed343e738ad7` on `dev`.
RCS-003 describes the base-data changes as one merge request; implementation can
be validated in smaller dependent batches before submission.

| Requirement and source | Classification / applicability | Implementation path | Evidence and status | Pending owner |
| --- | --- | --- | --- | --- |
| RCS-001 Vitest, mirrored test paths, scenario documentation and assertions | Explicit; TypeScript | BCH network, constants, explorer helpers, calculator, wallet and service tests | Base-data32, calculator37, signed validator29, unsigned builder45, metadata22, Network client40, server180, session/wire47 and wallet adapter25 scoped cases pass. App configuration22, limits29, runtime10, bridge actions23, wire/body29, HTTP handler13 and browser submission15 pass. Startup12, actual environment2, pairing4, wallet factory3, registry3, server actions8, actual POST5 and wallet selection6 pass. Mirrored calculator/metadata/POST and builder/server method-group corrections have independent review. Broader Service and operational evidence is maintained in the coordinating draft | Contributor |
| RCS-002 JSDoc and changesets | Contribution conventions; new package | `networks/bitcoin-cash/src/metadata.ts`, `.changeset/native-bitcoin-cash-network.md` | Serializer documented; package starts at 0.0.0 with minor initialization changeset | Contributor |
| RCS-003 monochrome chain icon | Explicit; applicable | `packages/icons/src/networks/bitcoin-cash.svg` | Monochrome BCH icon exported; actual locked icon-package build and explicit SVG public declaration consumer pass | Contributor |
| RCS-003 NETWORKS registry and types | Explicit; applicable | `packages/constants`, `packages/types` | BCH registered with index -1, absent from operational keys; availability checks guard app selection. The derived Network type includes BCH. Production index assignment pending | Rosen assigns index; contributor implements |
| RCS-003 explorer URL helpers | Explicit; applicable | `packages/utils/src/getAddressUrl.ts`, `getTxUrl.ts`, `getTokenUrl.ts` | BCH address/transaction links tested; token explorer is N/A for native-only BCH | Contributor |
| RCS-003 network package bases and app registration | Explicit; applicable | `networks/bitcoin-cash`, `apps/rosen/src/networks` | Typed Network interface, actual App typecheck and trusted server producers compile; conditional registries preserve legacy identities and exclude unassigned BCH. Declared Next webpack compilation produces 19 routes, including the bridge page and BCH POST, and two browser WASM assets. Deployment and visual browser verification remain pending | Contributor; Rosen supplies treasury |
| RCS-003 base build script | Explicit instruction; named script absent on this baseline | Root workspaces and `turbo.json` | Existing workspace globs discover both packages. Scoped workspace builds and the full App compile graph pass; freshly released dependency installation remains pending. Using the current workspace/Turbo procedure in place of `build.sh` is a proposed baseline-specific adaptation | Contributor; maintainer accepts adaptation |
| RCS-003 asset calculator/interface | Explicit; applicable | `packages/asset-calculator/lib` | Optional native calculator and exported read-only provider port implemented; focused boundary and shared wrapping tests pass. Service configuration wires the dedicated server-only Electrum factory. Actual Service metadata/migration qualification is recorded in the coordinating draft; fresh released dependency installation remains pending | Contributor |
| RCS-003 Rosen Service scanner, observation and event-trigger extractors | Explicit; applicable | `apps/rosen-service/src` | Scanner, observation and Ergo event-trigger registration, shared health and real TypeORM metadata/migration joins are validated in the coordinating draft. Released BCH dependency installation remains pending | Contributor |
| RCS-003 Rosen Service configuration and scanner health | Explicit; applicable | Service config, constants, calculator and health-check services | Disabled configuration validates P2PKH treasuries, Ergo commitment address/RWT, cleanup settings, explicit RPC/TLS endpoints and scanner thresholds. Unassigned index rejects enablement. Calculator, scanner, event-trigger and persistence joins are recorded in the coordinating draft | Rosen/operator supplies values; contributor implements |
| RCS-003 height, fees and min/max transfer | Explicit; applicable | `networks/bitcoin-cash/src`, `apps/rosen/src/networks/bitcoin-cash` | Real reader/fee factories and trusted server action ports implemented; client/server require wrapped-amount fee coverage. Min/max use private bounded mapping copies and the shared BCH estimator. Actual action and registry consumers pass; the complete Next graph compiles. Operational endpoint verification remains pending | Contributor |
| RCS-003 lock transaction and metadata | Explicit; applicable | `networks/bitcoin-cash/src` | Shared registry/codec metadata, authenticated parent coin selection and native builder implemented. Signed validator passes reference BCH VM tests. Offline BCHN 29.1 accepts one/two-input Schnorr fixtures and rejects seven mutations; decoded signed bytes close against both Rosen extractors. This does not qualify live custody or relay | Contributor |
| RCS-003 wallet connection, address, balance, transfer, availability and chain list | Explicit; applicable | `wallets/cashonize` | Pinned SDK session/wire adapter has 47 tests and independent review. Wallet adapter joins consistent balance conversion, immutable transfer intent, amount-only unwrapping and signed validation. Per-transfer cancellation reaches the HTTP port; the real offline HTTP/server join rejects expiration before broadcast. The Next browser graph compiles; operational relay remains pending | Contributor |
| RCS-003 wallet app wiring | Explicit; applicable | `apps/rosen/src/wallets`, pairing dialog and wallet hook | Lazy Cashonize factory, explicit first-account confirmation, disabled registration and stale-selection cancellation are implemented. Actual React DOM renders the pairing component with App/UI kit styles and requires confirmation. The complete Next graph compiles. Screenshot/layout verification remains pending | Contributor |
| RCS-003 wrapped asset and chain configuration tokens/contracts | Explicit; Rosen-owned | Rosen contract/token configuration | Pending; treasury, RWT/AWC and wrapped BCH identifiers must not be invented | Rosen Team |

## Metadata and address boundary

`generateBitcoinCashOpReturn` uses the existing Rosen field order: one-byte
destination chain index, eight-byte big-endian bridge fee, eight-byte big-endian
network fee, one-byte encoded-address length, then shared-codec address bytes.
It emits exactly one canonical data push, bounded to 80 payload bytes. Fees are
uint64 integers in Rosen wrapped units. Only the native deposit amount is unwrapped
to satoshis; miner fees are also measured in satoshis. Shared TokenMap wrapping
uses ceiling conversion. Both the client and trusted server must require the
wrapped deposit to exceed the sum of quoted Rosen fees; comparing raw satoshis
alone is insufficient when the wrapped asset has fewer decimals.

The serializer accepts already encoded destination bytes. Its caller must obtain
them from the shared Rosen address codec and resolve the destination through the
shared chain registry. It does not establish that arbitrary bytes are an address
or that an arbitrary byte-sized chain index is approved. For BCH, the current
codec permits explicit mainnet native P2PKH20/P2SH20 CashAddr only; it rejects
prefixless, mixed-case, testnet and token-aware variants. The extractor identifies
the source by the first input outpoint, requires one matching treasury output
without CashTokens, and checks raw bytes against the RPC transaction and txid.

`generateBitcoinCashLockMetadata` closes that caller boundary by resolving the
destination through the shared UI registry and Rosen codec. Unknown destinations
and BCH's unassigned index are rejected before serialization. Operational key
lists and app selection also exclude unassigned chains. Registering BCH identity
does not create a Network instance, enable a wallet or supply operator settings.

The icon comes from the CC0 Simple Icons BCH asset, revision
`1089fb7d2bf0e323f834c205ab76265005a6d5e8`. Explorer paths use Blockchair's BCH
address and transaction pages, verified on 1 October 2026.

## Wallet decision

The proposed first wallet is [Cashonize] through WalletConnect v2. Its source at
`7ca3280fdaf2cb775402679ab881a2da776b1e4a` advertises `bch:bitcoincash`,
`bch_getAddresses` and `bch_signTransaction`, accepts transaction/source-output
requests and uses libauth for BCH signing. This provides a supported browser
wallet path without adapting a Bitcoin SegWit PSBT signer.

The adapter restricts wallet-owned inputs/change and the treasury to validated
native mainnet P2PKH addresses. Codec observation of P2SH addresses does not
establish a P2SH treasury custody policy.
Session chain and accounts, source-output values/scripts, token absence, fees,
treasury amount, metadata and returned signed transaction must be checked before
transport. Native P2PKH signatures must be qualified against the chosen ForkID
policy. Cashonize also has a contract signing path with `SIGHASH_UTXOS`; that path
is excluded from the initial native wallet adapter. No live wallet connection or
fund transfer forms part of the current evidence.

## Native treasury accounting

`AssetCalculator` accepts an optional BCH configuration after its existing logger
argument. Existing callers retain the original nine calculators. BCH accounting
requires an explicit provider and one to 100 distinct mainnet treasury addresses;
construction makes no network request and supplies no endpoint default.

The read-only provider returns confirmed native satoshis and an empty token list.
The calculator checks eight-decimal native BCH metadata, bigint amounts, token
absence, and both individual and aggregate native issuance bounds. Partial or
malformed responses reject the complete query with a fixed error. Raw amounts
stay in satoshis; wrapped amounts use the existing Rosen `TokenMap` conversion.
This accounting configuration does not assign a chain index or enable wallet
transfer routes. Provider chain authentication, query deadlines and response-byte
bounds remain requirements of the concrete server implementation.

## Service scanner compatibility

The UI baseline uses `abstract-scanner` 2.0.3. A global upgrade to the current BCH
scanner's version 4 breaks the existing observation and lifecycle types, so it
is not part of this proposal. BCH uses its own scanner dependency and the stable
network-connector interface. The shared periodic lifecycle accepts only its
actual `name` and `update` capabilities. A local candidate experiment passes
strict typing and real constructor assertions for the version 2 manager, BCH
connector, version 4 scanner and native observation extractor without network or
database requests. The actual Service data-source closure qualifies deduplicated
entity identities and migrations, as recorded in the coordinating draft.
Fresh installation of released BCH dependencies remains pending.

Enabled BCH configuration requires explicit cleanup duration in seconds and trim
count, plus the Ergo-side commitment address and RWT identifier. Scanner health
converts the millisecond interval to seconds for the existing health library and
rejects an enabled but uninitialized or mismatched scanner. No BCH scanner or
health parameter is created while the configuration is disabled. The BCH scanner
and observation packages are local candidates at version 0.0.0; final service
dependency ranges and lock entries must use their actual release versions.

The accepted custody scope uses ordinary mainnet P2PKH lock and calculator
treasury addresses matched to Guard's aggregate key policy. Enabled service
configuration rejects P2SH treasuries; shared P2SH codec and observation support
does not qualify a treasury custody policy. The calculator receives the provider
through the separate server export, using explicit TLS hostname, port and a
deadline of at most 30 seconds. No RPC credentials reach the browser.

## Cashonize signing boundary

The native wallet request follows Cashonize's [strict source-output schema] and
[signing implementation] at revision `7ca3280fdaf2cb775402679ab881a2da776b1e4a`.
It carries the exact unsigned transaction and authenticated native source
outputs, encoded with the libauth bigint and byte-array JSON markers. It sets
`broadcast:false` explicitly. Selected raw-parent context is bounded to
4,000,000 hex characters and the relay request to 250,000 ASCII characters.

Cashonize's ordinary P2PKH template uses BCH Schnorr signatures. The shared
validator accepts minimal signature and compressed-key pushes with sighash
`0x41`, reconstructs the intent from raw parents and canonical Rosen metadata,
checks every input signature and rejects any changed transaction body. It also
checks the wallet's claimed transaction ID. Guard's ECDSA custody path is separate.
This validates byte and signature consistency; it does not establish current
unspent status, operator approval or chain inclusion.

The signed validator has 29 passing focused tests, including one- and two-input
transactions accepted by libauth's BCH virtual machine and a corrupted second
signature rejected by both verification paths. The Cashonize wire consumer has
nine passing tests and compiles against the actual network package exports.
Offline node/extractor checks are recorded in the coordinating draft; actual app
registration and operational submission remain pending. The session and wire
adapter have 47 passing tests, including independent session-review
counterfixtures. Cashonize signs with its first approved HD account; the adapter
offers only that account for confirmation while retaining the approved namespace
list. It rejects token-aware addresses, checks wallet-returned addresses and
stored authorization, and discards late results after cancellation or session
changes. One absolute deadline covers each whole initialization, connection or
signing operation. Overdue results are rejected even before timer callbacks run;
late approval is disconnected and late SDK initialization closes its transport.

The wallet-base adapter has 25 passing tests against real TokenMap conversion,
the lock builder, Schnorr signing and signed-byte validation. Three wrapped units
with a three-decimal wrapped asset become 300000 native satoshis while quoted
Rosen fees remain unchanged. Disconnection rejects late session initialization
and late signed responses before submission. The Network client has 40 tests,
including 100001 satoshis wrapping to two units and failing to cover two fee
units. Caller-owned intent and token fields are copied before asynchronous gates.
Balance conversion retains a private TokenMap copy while native reads await.
Each transfer owns a cancellation controller; disconnect aborts the signing and
submission signal. App registration and first-account confirmation are tested
without contacting a wallet or relay.

## Trusted app submission

The app runtime constructs the certificate-verified TLS reader and dedicated
submitter from explicit server settings. Its fee query resolves the mapped Ergo
token identifier and checks the allowed route, configured minimum-fee NFT and
current/next interval before calling Rosen's shared fee calculator. Native BCH
uses the shared wrapping semantics and native P2PKH fee estimator. Transfer
limits copy every token-set decimal before quote or UTXO awaits, so an OCTM
update cannot mix fee identity with a different conversion scale.

The dedicated submission handler accepts a same-origin JSON envelope bounded to
five million bytes. Signed metadata fees are checked against a fresh server
quote, not accepted as fee authority from the browser. One absolute deadline
covers body decoding and submission; the request/deadline signal reaches the
submitter. Cancellation must prevent a broadcast that has not started. Once a
broadcast has started, its result can be unknown; an HTTP failure does not prove
that the transaction was not submitted.

The browser port validates the encoded signed intent, sends only to the app's
dedicated route and bounds its JSON response to 512 bytes. It accepts only the
exact signed transaction identifier, rejects late results and closes late
response bodies after cancellation. The shared Ergo minimum-fee explorer uses
its existing HTTP client without an exposed per-call abort signal. Endpoint
deadlines reject late quotes and prevent subsequent broadcast; they do not
promise physical cancellation of that read-only explorer request.

The actual Next POST handler, optional registries, startup environment validation
and lazy wallet factory pass focused consumer tests. An offline React DOM test
renders the actual pairing dialog with App/UI kit styles, keeps unassigned BCH
disabled and requires a click before confirming the first approved account.
This establishes DOM behavior, not visual layout or a live wallet connection.

The shared Rosen Ergo and Cardano codec packages now map browser requests to
their authentic browser WASM dependencies, retaining Node implementations for
server consumers. BCH continues to use the same shared encoder and decoder.
App `build` and `dev` explicitly select webpack. The client enables asynchronous
WASM and async-function output for Next 16's supported Chrome/Edge/Firefox 111+
and Safari 16.4+ profile, verified against the installed Next 16.3.6 defaults and
[official Next 16 browser requirements][Next browser requirements] on 2 October
2026. [Webpack's asynchronous WASM support][Webpack WASM] governs module readiness;
no filesystem substitute is added. This bundler choice is proposed for maintainer
review. Direct Vite 7.1.9 use requires a WASM plugin; the Next result does not
establish portability to arbitrary bundlers.

The declared App build succeeds in compilation mode with 19 routes, including
nonempty bridge-page and BCH POST modules, and two browser WASM assets. Remaining
warnings concern legacy MetaMask optional React Native storage, viem expression
imports and server-side Cardano dynamic requires. Compilation mode does not
qualify production prerendering, database availability or operational endpoints.

A controlled webpack web-target harness passes 22 first-use checks. It waits for
both actual WASM assets before exposing the entry, executes the shared codecs and
BCH metadata, reconstructs the one/two-input locks previously checked by offline
BCHN, and invokes the actual signed validator on both Schnorr transactions and
seven invalid mutations. This checks module readiness and the declared byte/
signature joins in a controlled VM; it is not a full browser or live-wallet test.
Independent review closes the exact browser-module inputs and output assets.
The generator includes the BCH operator key with an empty value and was run
against isolated synthetic inputs. The workspace lock records local BCH
candidates without fabricated registry archives; fresh installation remains
blocked until the scanner and observation packages have real releases.

The session adapter pins `@walletconnect/sign-client` version `2.25.0`,
whose npm metadata identifies source revision
`e4310ceae6c1408fa42caeeb2f350ee88813f5f9` (verified 2026-10-01).
Cashonize approves four methods even when fewer are requested. The adapter
allows that documented permission shape but calls only `bch_getAddresses`,
`bch_signTransaction` and `bch_cancelPendingRequests`. It never requests message
signing. Exact SDK dependencies are recorded in the workspace lockfile; existing
wallet dependency resolutions remain unchanged.

## Next batches

1. Retain the reviewed browser-module, Next compilation, mirrored tests and local
   package-content evidence for unchanged inputs. Compare the exact contribution
   with the coordinating matrix before submission.
2. Resolve maintainer decisions on the current build procedure and coordinate
   actual package releases before regenerating dependent installation locks.
3. Obtain Rosen-owned index, treasury, contracts and token identifiers before
   enabling an operational BCH route. Visual browser verification and live
   deployment checks remain separate from the offline consumer evidence.

[RCS-001]: https://github.com/rosen-bridge/rcs/blob/7b9784dae9d8d5b66b80de7a6043d1ba36a3a4bf/rcs-001.md
[RCS-002]: https://github.com/rosen-bridge/rcs/blob/7b9784dae9d8d5b66b80de7a6043d1ba36a3a4bf/rcs-002.md
[RCS-003]: https://github.com/rosen-bridge/rcs/blob/7b9784dae9d8d5b66b80de7a6043d1ba36a3a4bf/rcs-003/README.md
[Cashonize]: https://github.com/cashonize/cashonize-wallet/blob/7ca3280fdaf2cb775402679ab881a2da776b1e4a/src/stores/walletconnectStore.ts
[strict source-output schema]: https://github.com/cashonize/cashonize-wallet/blob/7ca3280fdaf2cb775402679ab881a2da776b1e4a/src/utils/zodValidation.ts
[signing implementation]: https://github.com/cashonize/cashonize-wallet/blob/7ca3280fdaf2cb775402679ab881a2da776b1e4a/src/utils/dapp/wcSigning.ts
[Coordinating integration]: https://github.com/a-shannon/guard-service/blob/a-shannon/bitcoin-cash/docs/bitcoin-cash-integration.md
[Next browser requirements]: https://nextjs.org/docs/app/guides/upgrading/version-16
[Webpack WASM]: https://webpack.js.org/configuration/experiments/#experimentsasyncwebassembly
