---
'@rosen-network/bitcoin-runes': major
---

Handle signing of p2wpkh UTXOs by:

- Separately adding p2wpkh inputs to the PSBT
- And returning sign indexes for each address alongside 2 PSBT strings encoded as base64 and hex
