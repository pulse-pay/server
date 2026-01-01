# PulsePay API

Real-time payment streaming API for services like Gym, EV Charging, WiFi, and Parking.

## Setup

```bash
npm install
npm run dev
```

## API Routes

### Users `/api/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Stores `/api/stores`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | Get all stores |
| GET | `/api/stores/:id` | Get store by ID |
| POST | `/api/stores` | Create store |
| PUT | `/api/stores/:id` | Update store |
| PUT | `/api/stores/:id/verify` | Verify store |
| GET | `/api/stores/:storeId/services` | Get store services |
| DELETE | `/api/stores/:id` | Delete store |

### Wallets `/api/wallets`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallets/:id` | Get wallet |
| GET | `/api/wallets/:id/balance` | Get balance |
| POST | `/api/wallets/:id/topup` | Top up wallet |
| POST | `/api/wallets/:id/withdraw` | Withdraw from wallet |
| GET | `/api/wallets/:id/transactions` | Get transactions |
| PUT | `/api/wallets/:id/suspend` | Suspend wallet |
| PUT | `/api/wallets/:id/activate` | Activate wallet |

### Services `/api/services`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get service by ID |
| GET | `/api/services/qr/:qrCodeId` | Get service by QR code |
| POST | `/api/services` | Create service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |

### Sessions `/api/sessions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions/start` | Start streaming session |
| POST | `/api/sessions/:id/end` | End session |
| POST | `/api/sessions/:id/bill` | Process billing |
| GET | `/api/sessions/:id` | Get session by ID |
| GET | `/api/sessions/active/:walletId` | Get active session |
| GET | `/api/sessions/history/:walletId` | Get session history |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/` | API info |

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pulsepay
```
