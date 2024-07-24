# Watcher App

## Setup Guide

Follow these steps to set up and run your local version of Watcher App:

1. **Run a Watcher Service**

   - Watcher App requires a running Watcher Service.
   - Refer to the Watcher Service documentation for setup instructions.
   - Important: Set `allowedOrigin` in the service config to enable API requests from localhost.

2. **Configure API URL**

   - Open the `fetcher.ts` file.
   - Set `axios.defaults.baseURL` to your Watcher Service API URL.

3. **Install Dependencies and Build Packages**
   ```bash
   npm install
   ./build.sh
   cd apps/watcher
   ```
4. **Launch the App**
   ```bash
   npm run dev
   ```
