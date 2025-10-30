# Bob Extension Wallet Integration

This package provides integration between the Bob Extension (Handshake wallet) and Rosen Bridge UI.

## Features

- Connect to Bob Extension browser wallet
- Get wallet address and balance
- Send HNS transactions through Bob Extension
- Automatic detection of Bob Extension availability
- Seamless integration with Rosen Bridge UI

## Requirements

- Bob Extension installed in browser
- Bob Extension unlocked and connected
- Handshake (HNS) balance for transactions

## Usage

The Bob Extension wallet will automatically appear in the Rosen Bridge UI wallet selection when:

1. Bob Extension is installed in the browser
2. User is on a page with Handshake as source/target chain
3. Bob Extension is unlocked

## Architecture

This wallet integration leverages the existing Bob3 API exposed by Bob Extension:

```typescript
// Connect to Bob Extension
const wallet = await bob3.connect();

// Get wallet info
const address = await wallet.getAddress();
const balance = await wallet.getBalance();

// Send transaction
const tx = await wallet.send(lockAddress, amountInHNS);
```

## Development

```bash
# Build the wallet package
npm run build

# Build the entire Rosen Bridge UI with Bob Extension
cd ../../
./build.sh rosen
```

## Integration Details

- **Chain Support**: Handshake (HNS) only
- **Transaction Type**: Standard HNS transfers to bridge lock address
- **Metadata**: Bridge metadata handled by Rosen Bridge network layer
- **Security**: All signing happens within Bob Extension
- **User Experience**: Familiar Bob Extension popup for transaction confirmation
