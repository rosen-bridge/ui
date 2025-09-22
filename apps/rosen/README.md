# Rosen App

## Setup Guide

Follow these steps to set up and run your local version of Rosen App:

### Prerequisites

1. **Postgres & Rosen Service** (Optional for bridge page access)
   - Required for full functionality
   - Setup instructions: [Rosen Service README](../rosen-service/README.md)

2. **Vercel KV Instance**
   - Required for API rate limiting feature
   - Use Vercel KV or host your own instance

### Installation and Configuration

1. **Install Dependencies and Build Packages**

   ```bash
   npm install
   ./build.sh
   cd apps/rosen
   ```

2. **Fetch Tokens Data**
   ```bash
   npm run get-config
   ```
3. **Set Environmental Variables**
   ```bash
    cp .env.example .env.local
    # Edit .env.local with your configuration
   ```
4. **Launch the App**

   ```bash
   npm run dev
   ```

5. **Exclude tokens from the dropdown list on the bridge page**

   ```bash
   # Example 1
   # Remove the `RSN` token when the source is `ergo` and the destination is `cardano`
   NEXT_PUBLIC_BLOCKED_TOKENS='ergo,cardano,RSN;'

   # Example 2
   # Remove all tokens when the source is `cardano` and the destination is `bitcoin`
   NEXT_PUBLIC_BLOCKED_TOKENS='cardano,bitcoin,*;'

   # Example 3
   # Remove the `BTC` token when the source is `bitcoin`
   NEXT_PUBLIC_BLOCKED_TOKENS='bitcoin,*,BTC;'

   # Example 4
   # Remove the `ERG` token when the destination is `bitcoin`
   NEXT_PUBLIC_BLOCKED_TOKENS='*,bitcoin,ERG;'

   # Example 5
   # Remove the `ERG` token
   NEXT_PUBLIC_BLOCKED_TOKENS='*,*,ERG;'

   # Example 6
   # Combine all previous configs together
   NEXT_PUBLIC_BLOCKED_TOKENS='ergo,cardano,RSN; cardano,bitcoin,*; bitcoin,*,BTC; *,bitcoin,ERG; *,*,ERG;'
   ```
