# Rosen Service

Rosen Service is the backend data provider for Rosen App.

## Bitcoin Cash RPC configuration

Bitcoin Cash remains disabled unless `bitcoin-cash.enabled` is `true`. Enabled
configuration requires the assigned chain index and the operator's treasury,
contracts, Electrum endpoint and scanner settings.

Set `bitcoin-cash.rpc.url` to HTTPS, or to HTTP on a literal IPv4 `127/8` or IPv6
`::1` loopback address. DNS names such as `localhost`, mapped IPv6 addresses and
alternate IPv4 spellings do not qualify for plaintext HTTP. URL credentials and
fragments are rejected. Configure `rpc.username` and `rpc.password` together, or
omit both; credentials must be nonempty and at most 1024 characters, without
control characters or surrounding whitespace. Usernames cannot contain a colon.
`rpc.timeoutMs` remains a positive integer no greater than 120000.

Optional `bitcoin-cash.rpc.limits` values override the scanner's resource budgets:

| Key | Default | Hard maximum |
| --- | ---: | ---: |
| `transactionBytes` | 1000000 | 8000000 |
| `transactionIO` | 4096 | 100000 |
| `blockTransactions` | 10000 | 250000 |
| `blockTransactionBytes` | 32000000 | 128000000 |
| `responseBytes` | 64000000 | 256000000 |

Every override must be a positive safe integer; unknown keys are rejected.
These are local resource budgets, not BCH consensus limits. If scanning stops at
a budget, qualify the deployment's memory capacity, increase the relevant value
within its hard maximum, and restart at the unchanged block. Do not skip it.
