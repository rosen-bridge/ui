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
   cd apps/rosen
   ./build.sh

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
