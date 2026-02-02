# Shake Wallet Integration

This package provides integration between the Shake Wallet (Handshake wallet) and Rosen Bridge UI.

## Features

- Connect to Shake Wallet browser wallet
- Get wallet address and balance
- Send HNS transactions through Shake Wallet
- Automatic detection of Shake Wallet availability
- Seamless integration with Rosen Bridge UI

## Requirements

- Shake Wallet installed in browser
- Shake Wallet unlocked and connected
- Handshake (HNS) balance for transactions

## Usage

The Shake Wallet will automatically appear in the Rosen Bridge UI wallet selection when:

1. Shake Wallet is installed in the browser
2. User is on a page with Handshake as source/target chain
3. Shake Wallet is unlocked

## Architecture

This wallet integration leverages the existing Shake API exposed by Shake Wallet:

```typescript
// Connect to Shake Wallet
const wallet = await shake.connect();

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

# Build the entire Rosen Bridge UI with Shake Wallet
cd ../../
./build.sh rosen
```

## Integration Details

- **Chain Support**: Handshake (HNS) only
- **Transaction Type**: Standard HNS transfers to bridge lock address
- **Metadata**: Bridge metadata handled by Rosen Bridge network layer
- **Security**: All signing happens within Shake Wallet
- **User Experience**: Familiar Shake Wallet popup for transaction confirmation
