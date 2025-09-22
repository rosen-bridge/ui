# Guard App

## Setup Guide

Follow these steps to set up and run your local version of Guard App:

1. **Run a Guard Service**
   - Guard App requires a running Guard Service.
   - Refer to the Guard Service documentation for setup instructions.
   - Important: Set `allowedOrigin` in the service config to enable API requests from localhost.

2. **Configure API URL**
   - Open the `fetcher.ts` file.
   - Set `axios.defaults.baseURL` to your Guard Service API URL.

3. **Install Dependencies and Build Packages**
   ```bash
   npm install
   ./build.sh
   cd apps/guard
   ```
4. **Launch the App**
   ```bash
   npm run dev
   ```
