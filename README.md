# PulsePay

Real-time streaming payment platform for per-second billing of services like gyms, EV charging, WiFi, and parking.

## Features

- **Real-time Streaming Payments**: Per-second billing with Superfluid integration
- **Multi-tenant**: Support for multiple store types (GYM, EV, WIFI, PARKING)
- **Wallet System**: User and store wallets with balance tracking
- **Session Management**: Start, bill, and end streaming sessions
- **QR Code Services**: Scan-to-start service sessions
- **User-Store Tracking**: Track which stores users have visited via `storeIds`

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Blockchain**: Superfluid Protocol (optional crypto streaming)
- **Documentation**: Swagger/OpenAPI

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp ENV_TEMPLATE.txt .env
# Edit .env with your configuration

# Start MongoDB
mongod

# Start the server
npm run dev
```

## API Endpoints

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| POST   | `/api/users`                  | Create user                    |
| POST   | `/api/users/login`            | User login                     |
| GET    | `/api/users/:id`              | Get user profile               |
| POST   | `/api/stores`                 | Create store                   |
| POST   | `/api/stores/login`           | Store login                    |
| GET    | `/api/stores/:id/clients`     | Get store clients (users)      |
| POST   | `/api/sessions/start`         | Start streaming session        |
| POST   | `/api/sessions/:id/end`       | End streaming session          |
| POST   | `/api/sessions/:id/bill`      | Process session billing        |
| GET    | `/api/wallets/:id/balance`    | Get wallet balance             |
| POST   | `/api/wallets/:id/topup`      | Top up wallet                  |

## Data Models

### UserAccount
- `fullName`, `email`, `phone`, `passwordHash`
- `walletId` - Reference to user's wallet
- `storeIds[]` - Array of stores the user has used
- `status` - ACTIVE | BLOCKED
- `kycLevel` - BASIC | VERIFIED

### StoreAccount
- `storeName`, `ownerName`, `email`, `phone`
- `walletId` - Reference to store's wallet
- `storeType` - GYM | EV | WIFI | PARKING
- `location` - { address, lat, lng }
- `verificationStatus` - PENDING | VERIFIED | REJECTED

### StreamSession
- `userWalletId`, `storeWalletId`, `serviceId`
- `ratePerSecond`, `startedAt`, `lastBilledAt`
- `status` - ACTIVE | PAUSED | ENDED
- `totalAmountTransferred`, `totalDurationSeconds`

## Starting a Session

```bash
curl -X POST http://localhost:5000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "userWalletId": "wallet_id_here",
    "serviceId": "service_id_here",
    "storeId": "store_id_here"
  }'
```

This will:
1. Validate user wallet and balance
2. Create a streaming session
3. Add the store to user's `storeIds` array
4. Start Superfluid flow (if crypto-enabled)

## Documentation

- **API Docs**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/health`

## Environment Variables

| Variable           | Description                     | Default                              |
|--------------------|---------------------------------|--------------------------------------|
| `PORT`             | Server port                     | `5000`                               |
| `NODE_ENV`         | Environment mode                | `development`                        |
| `MONGO_URI`        | MongoDB connection string       | `mongodb://localhost:27017/pulsepay` |
| `CORS_ORIGIN`      | Allowed CORS origins            | `*`                                  |
| `TEST_PRIVATE_KEY` | Test private key for blockchain | -                                    |

## License

MIT License
