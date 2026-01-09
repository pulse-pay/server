# PulsePay API Documentation

PulsePay is a real-time streaming payment platform that enables per-second billing for services like gyms, EV charging stations, WiFi hotspots, and parking.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [Users](#users)
  - [Stores](#stores)
  - [Wallets](#wallets)
  - [Services](#services)
  - [Sessions](#sessions)
- [Data Models](#data-models)
- [Swagger Documentation](#swagger-documentation)

---

## Base URL

```
http://localhost:5000/api
```

| Environment   | Base URL                          |
|---------------|-----------------------------------|
| Development   | `http://localhost:5000/api`       |
| Production    | `https://your-domain.com/api`     |

---

## Authentication

> **Note:** Authentication is not yet implemented. JWT-based authentication is planned for future releases.

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "count": 10,           // Optional: for list endpoints
  "total": 100,          // Optional: for paginated endpoints
  "message": "..."       // Optional: success message
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "stack": "..."         // Only in development mode
}
```

---

## Error Handling

| Status Code | Description                        |
|-------------|------------------------------------|
| `200`       | Success                            |
| `201`       | Created successfully               |
| `400`       | Bad request / Validation error     |
| `404`       | Resource not found                 |
| `500`       | Internal server error              |

---

## API Endpoints

---

### Health Check

#### `GET /health`

Check if the server is running.

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-09T10:30:00.000Z"
}
```

#### `GET /`

Welcome endpoint.

**Response:**

```json
{
  "success": true,
  "message": "Welcome to PulsePay API",
  "version": "1.0.0"
}
```

---

### Users

Base path: `/api/users`

#### `GET /api/users`

List all users.

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "walletId": "64a1b2c3d4e5f6789...",
      "status": "ACTIVE",
      "kycLevel": "BASIC",
      "createdAt": "2026-01-09T10:00:00.000Z",
      "updatedAt": "2026-01-09T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/users`

Create a new user.

**Request Body:**

| Field      | Type   | Required | Description                |
|------------|--------|----------|----------------------------|
| `fullName` | string | Yes      | User's full name (max 100) |
| `email`    | string | Yes      | Valid email address        |
| `phone`    | string | Yes      | Valid phone number         |
| `password` | string | Yes      | Password (min 6 chars)     |

**Example Request:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepass123"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "walletId": "64a1b2c3d4e5f6789...",
    "status": "ACTIVE",
    "kycLevel": "BASIC",
    "createdAt": "2026-01-09T10:00:00.000Z"
  }
}
```

---

#### `GET /api/users/:id`

Get a user by ID.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | User ID     |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "walletId": "64a1b2c3d4e5f6789...",
    "status": "ACTIVE",
    "kycLevel": "BASIC"
  }
}
```

---

#### `PUT /api/users/:id`

Update a user.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | User ID     |

**Request Body:** (all fields optional)

```json
{
  "fullName": "Jane Doe",
  "phone": "+0987654321",
  "status": "ACTIVE",
  "kycLevel": "VERIFIED"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "fullName": "Jane Doe",
    "email": "john@example.com",
    "phone": "+0987654321",
    "status": "ACTIVE",
    "kycLevel": "VERIFIED"
  }
}
```

---

#### `DELETE /api/users/:id`

Delete a user.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | User ID     |

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Stores

Base path: `/api/stores`

#### `GET /api/stores`

List all stores with optional filters.

**Query Parameters:**

| Parameter            | Type   | Description                                     |
|----------------------|--------|-------------------------------------------------|
| `storeType`          | string | Filter by type: `GYM`, `EV`, `WIFI`, `PARKING`  |
| `verificationStatus` | string | Filter by: `PENDING`, `VERIFIED`, `REJECTED`    |

**Example Request:**

```
GET /api/stores?storeType=GYM&verificationStatus=VERIFIED
```

**Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789...",
      "storeName": "FitZone Gym",
      "ownerName": "Alice Smith",
      "email": "fitzone@example.com",
      "phone": "+1234567890",
      "walletId": "64a1b2c3d4e5f6789...",
      "storeType": "GYM",
      "location": {
        "address": "123 Main St, City",
        "lat": 40.7128,
        "lng": -74.0060
      },
      "verificationStatus": "VERIFIED",
      "isActive": true,
      "createdAt": "2026-01-09T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/stores`

Create a new store.

**Request Body:**

| Field        | Type   | Required | Description                                    |
|--------------|--------|----------|------------------------------------------------|
| `storeName`  | string | Yes      | Store name (max 100)                           |
| `ownerName`  | string | Yes      | Owner's name (max 100)                         |
| `email`      | string | Yes      | Valid email address                            |
| `phone`      | string | Yes      | Valid phone number                             |
| `password`   | string | Yes      | Password (min 6 chars)                         |
| `storeType`  | string | Yes      | One of: `GYM`, `EV`, `WIFI`, `PARKING`         |
| `location`   | object | Yes      | Location object with address, lat, lng         |

**Example Request:**

```json
{
  "storeName": "PowerCharge EV Station",
  "ownerName": "Bob Johnson",
  "email": "powercharge@example.com",
  "phone": "+1122334455",
  "password": "securepass123",
  "storeType": "EV",
  "location": {
    "address": "456 Electric Ave, City",
    "lat": 40.7580,
    "lng": -73.9855
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "storeName": "PowerCharge EV Station",
    "ownerName": "Bob Johnson",
    "email": "powercharge@example.com",
    "phone": "+1122334455",
    "walletId": "64a1b2c3d4e5f6789...",
    "storeType": "EV",
    "location": {
      "address": "456 Electric Ave, City",
      "lat": 40.7580,
      "lng": -73.9855
    },
    "verificationStatus": "PENDING",
    "isActive": true
  }
}
```

---

#### `GET /api/stores/:id`

Get a store by ID.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Store ID    |

---

#### `PUT /api/stores/:id`

Update a store.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Store ID    |

**Request Body:** (all fields optional)

```json
{
  "storeName": "Updated Store Name",
  "location": {
    "address": "789 New St, City",
    "lat": 40.7000,
    "lng": -74.0000
  },
  "isActive": true
}
```

---

#### `DELETE /api/stores/:id`

Delete a store.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Store ID    |

---

#### `PUT /api/stores/:id/verify`

Verify or reject a store.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Store ID    |

**Request Body:**

| Field                | Type   | Required | Description                       |
|----------------------|--------|----------|-----------------------------------|
| `verificationStatus` | string | Yes      | `VERIFIED` or `REJECTED`          |

**Example Request:**

```json
{
  "verificationStatus": "VERIFIED"
}
```

---

#### `GET /api/stores/:storeId/services`

Get all services offered by a specific store.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `storeId` | string | Store ID    |

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789...",
      "storeId": "64a1b2c3d4e5f6789...",
      "name": "Gym Session",
      "ratePerSecond": 0.0167,
      "ratePerMinute": 1.00,
      "minBalanceRequired": 50,
      "qrCodeId": "GYM-001-SESSION",
      "isActive": true
    }
  ]
}
```

---

### Wallets

Base path: `/api/wallets`

#### `GET /api/wallets/:id`

Get wallet details by ID.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Wallet ID   |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "ownerType": "USER",
    "ownerId": "64a1b2c3d4e5f6789...",
    "balance": 500.00,
    "lockedBalance": 50.00,
    "currency": "INR",
    "status": "ACTIVE",
    "activeSessionId": null,
    "evmAddress": "0x1234567890abcdef...",
    "availableBalance": 450.00
  }
}
```

---

#### `GET /api/wallets/:id/balance`

Get wallet balance information.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Wallet ID   |

**Response:**

```json
{
  "success": true,
  "data": {
    "balance": 500.00,
    "lockedBalance": 50.00,
    "availableBalance": 450.00,
    "currency": "INR"
  }
}
```

---

#### `POST /api/wallets/:id/topup`

Top up wallet balance.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Wallet ID   |

**Request Body:**

| Field    | Type   | Required | Description             |
|----------|--------|----------|-------------------------|
| `amount` | number | Yes      | Amount to top up (> 0)  |

**Example Request:**

```json
{
  "amount": 100.00
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "wallet": {
      "_id": "64a1b2c3d4e5f6789...",
      "balance": 600.00,
      "lockedBalance": 50.00,
      "availableBalance": 550.00
    },
    "transaction": {
      "_id": "64a1b2c3d4e5f6789...",
      "direction": "CREDIT",
      "amount": 100.00,
      "reason": "WALLET_TOPUP",
      "balanceAfter": 600.00
    }
  }
}
```

---

#### `POST /api/wallets/:id/withdraw`

Withdraw from wallet.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Wallet ID   |

**Request Body:**

| Field    | Type   | Required | Description                |
|----------|--------|----------|----------------------------|
| `amount` | number | Yes      | Amount to withdraw (> 0)   |

**Example Request:**

```json
{
  "amount": 50.00
}
```

**Error Responses:**

- `400`: Invalid amount or insufficient balance
- `404`: Wallet not found

---

#### `GET /api/wallets/:id/transactions`

Get wallet transaction history (ledger).

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Wallet ID   |

**Query Parameters:**

| Parameter | Type    | Default | Description             |
|-----------|---------|---------|-------------------------|
| `limit`   | integer | 50      | Records to return       |
| `skip`    | integer | 0       | Records to skip         |

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789...",
      "walletId": "64a1b2c3d4e5f6789...",
      "sessionId": null,
      "direction": "CREDIT",
      "amount": 100.00,
      "reason": "WALLET_TOPUP",
      "balanceAfter": 600.00,
      "timestamp": "2026-01-09T10:00:00.000Z",
      "metadata": {}
    }
  ]
}
```

**Transaction Reasons:**

- `WALLET_TOPUP` - Wallet top-up
- `WALLET_WITHDRAWAL` - Wallet withdrawal
- `GYM_STREAM` - Gym service streaming payment
- `EV_STREAM` - EV charging streaming payment
- `WIFI_STREAM` - WiFi service streaming payment
- `PARKING_STREAM` - Parking streaming payment
- `REFUND` - Refund transaction
- `ADJUSTMENT` - Manual adjustment

---

#### `PUT /api/wallets/:id/suspend`

Suspend a wallet.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Wallet ID   |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "status": "SUSPENDED"
  }
}
```

---

#### `PUT /api/wallets/:id/activate`

Activate a suspended wallet.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Wallet ID   |

---

### Services

Base path: `/api/services`

#### `GET /api/services`

List all services with optional filters.

**Query Parameters:**

| Parameter  | Type    | Description            |
|------------|---------|------------------------|
| `storeId`  | string  | Filter by store ID     |
| `isActive` | boolean | Filter by active status|

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789...",
      "storeId": "64a1b2c3d4e5f6789...",
      "name": "Standard Workout Session",
      "ratePerSecond": 0.0167,
      "ratePerMinute": 1.00,
      "minBalanceRequired": 50,
      "qrCodeId": "GYM-001-STD",
      "isActive": true,
      "ratePerHour": 60.12
    }
  ]
}
```

---

#### `POST /api/services`

Create a new service.

**Request Body:**

| Field               | Type   | Required | Description                         |
|---------------------|--------|----------|-------------------------------------|
| `storeId`           | string | Yes      | Store ID this service belongs to    |
| `name`              | string | Yes      | Service name (max 100)              |
| `ratePerMinute`     | number | Yes      | Rate per minute (≥ 0)               |
| `ratePerSecond`     | number | No       | Rate per second (auto-calculated)   |
| `minBalanceRequired`| number | Yes      | Minimum wallet balance to start     |

**Example Request:**

```json
{
  "storeId": "64a1b2c3d4e5f6789...",
  "name": "Premium Gym Session",
  "ratePerMinute": 2.00,
  "minBalanceRequired": 100
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "storeId": "64a1b2c3d4e5f6789...",
    "name": "Premium Gym Session",
    "ratePerSecond": 0.0333,
    "ratePerMinute": 2.00,
    "minBalanceRequired": 100,
    "qrCodeId": "SVC-64a1b2c3d4e5f6789",
    "isActive": true
  }
}
```

---

#### `GET /api/services/qr/:qrCodeId`

Get service by QR code.

**Parameters:**

| Parameter  | Type   | Description   |
|------------|--------|---------------|
| `qrCodeId` | string | QR Code ID    |

**Example Request:**

```
GET /api/services/qr/GYM-001-STD
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "storeId": "64a1b2c3d4e5f6789...",
    "name": "Standard Workout Session",
    "ratePerSecond": 0.0167,
    "ratePerMinute": 1.00,
    "minBalanceRequired": 50,
    "qrCodeId": "GYM-001-STD",
    "isActive": true
  }
}
```

---

#### `GET /api/services/:id`

Get service by ID.

---

#### `PUT /api/services/:id`

Update a service.

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Service Name",
  "ratePerMinute": 1.50,
  "minBalanceRequired": 75,
  "isActive": true
}
```

---

#### `DELETE /api/services/:id`

Delete a service.

---

### Sessions

Base path: `/api/sessions`

Sessions are the core of PulsePay - they represent real-time streaming payment sessions between users and services.

#### `POST /api/sessions/start`

Start a new streaming session.

**Request Body:**

| Field          | Type   | Required | Description                               |
|----------------|--------|----------|-------------------------------------------|
| `serviceId`    | string | Yes      | Service ID to stream                      |
| `userWalletId` | string | No*      | User wallet ID                            |
| `evmAddress`   | string | No*      | EVM address to look up wallet             |

> \* Either `userWalletId` or `evmAddress` must be provided.

**Example Request:**

```json
{
  "serviceId": "64a1b2c3d4e5f6789...",
  "userWalletId": "64a1b2c3d4e5f6789..."
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "userWalletId": "64a1b2c3d4e5f6789...",
    "storeWalletId": "64a1b2c3d4e5f6789...",
    "serviceId": "64a1b2c3d4e5f6789...",
    "ratePerSecond": 0.0167,
    "startedAt": "2026-01-09T10:00:00.000Z",
    "lastBilledAt": "2026-01-09T10:00:00.000Z",
    "status": "ACTIVE",
    "totalAmountTransferred": 0,
    "totalDurationSeconds": 0,
    "onChainFlowId": null,
    "superTokenAddress": null
  }
}
```

**Error Responses:**

- `400`: Validation failed, insufficient balance, or wallet already has active session
- `404`: Service or wallet not found

---

#### `GET /api/sessions/active/:walletId`

Get the active session for a wallet.

**Parameters:**

| Parameter  | Type   | Description    |
|------------|--------|----------------|
| `walletId` | string | User wallet ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "userWalletId": "64a1b2c3d4e5f6789...",
    "storeWalletId": "64a1b2c3d4e5f6789...",
    "serviceId": {
      "_id": "64a1b2c3d4e5f6789...",
      "name": "Gym Session"
    },
    "ratePerSecond": 0.0167,
    "startedAt": "2026-01-09T10:00:00.000Z",
    "status": "ACTIVE",
    "currentDurationSeconds": 300,
    "unbilledAmount": 5.01
  }
}
```

---

#### `GET /api/sessions/history/:walletId`

Get session history for a wallet.

**Parameters:**

| Parameter  | Type   | Description    |
|------------|--------|----------------|
| `walletId` | string | User wallet ID |

**Query Parameters:**

| Parameter | Type    | Default | Description       |
|-----------|---------|---------|-------------------|
| `limit`   | integer | 20      | Records to return |
| `skip`    | integer | 0       | Records to skip   |

**Response:**

```json
{
  "success": true,
  "count": 5,
  "total": 20,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789...",
      "serviceId": {
        "name": "Gym Session"
      },
      "startedAt": "2026-01-09T09:00:00.000Z",
      "endedAt": "2026-01-09T10:00:00.000Z",
      "status": "ENDED",
      "totalAmountTransferred": 60.00,
      "totalDurationSeconds": 3600
    }
  ]
}
```

---

#### `GET /api/sessions/:id`

Get session by ID.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Session ID  |

---

#### `POST /api/sessions/:id/end`

End a streaming session.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Session ID  |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "status": "ENDED",
    "endedAt": "2026-01-09T11:00:00.000Z",
    "totalAmountTransferred": 60.00,
    "totalDurationSeconds": 3600
  }
}
```

---

#### `POST /api/sessions/:id/bill`

Process billing for an active session. This deducts the unbilled amount from the user wallet and credits the store wallet.

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Session ID  |

**Response:**

```json
{
  "success": true,
  "data": {
    "billedAmount": 10.02,
    "billedDuration": 600,
    "session": {
      "_id": "64a1b2c3d4e5f6789...",
      "lastBilledAt": "2026-01-09T10:10:00.000Z",
      "totalAmountTransferred": 10.02
    }
  }
}
```

**Error Responses:**

- `400`: No active session to bill or insufficient balance

---

#### `POST /api/sessions/:id/sync`

Sync session status with blockchain (for crypto-enabled sessions using Superfluid).

**Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | Session ID  |

**Response:**

```json
{
  "success": true,
  "data": {
    "session": { ... },
    "onChainData": {
      "flowRate": "16666666666666",
      "totalStreamed": "1000000000000000000"
    }
  }
}
```

**Error Responses:**

- `400`: Not a crypto session or wallet addresses missing

---

## Data Models

### User

| Field          | Type     | Description                           |
|----------------|----------|---------------------------------------|
| `_id`          | ObjectId | Unique identifier                     |
| `fullName`     | string   | User's full name                      |
| `email`        | string   | Email address (unique)                |
| `phone`        | string   | Phone number (unique)                 |
| `walletId`     | ObjectId | Reference to user's wallet            |
| `status`       | string   | `ACTIVE` or `BLOCKED`                 |
| `kycLevel`     | string   | `BASIC` or `VERIFIED`                 |
| `createdAt`    | Date     | Creation timestamp                    |
| `updatedAt`    | Date     | Last update timestamp                 |

### Store

| Field                | Type     | Description                                    |
|----------------------|----------|------------------------------------------------|
| `_id`                | ObjectId | Unique identifier                              |
| `storeName`          | string   | Store name                                     |
| `ownerName`          | string   | Owner's name                                   |
| `email`              | string   | Email address (unique)                         |
| `phone`              | string   | Phone number (unique)                          |
| `walletId`           | ObjectId | Reference to store's wallet                    |
| `storeType`          | string   | `GYM`, `EV`, `WIFI`, or `PARKING`              |
| `location`           | object   | `{ address, lat, lng }`                        |
| `verificationStatus` | string   | `PENDING`, `VERIFIED`, or `REJECTED`           |
| `isActive`           | boolean  | Whether store is active                        |

### Wallet

| Field              | Type     | Description                                    |
|--------------------|----------|------------------------------------------------|
| `_id`              | ObjectId | Unique identifier                              |
| `ownerType`        | string   | `USER` or `STORE`                              |
| `ownerId`          | ObjectId | Reference to owner (User or Store)             |
| `balance`          | number   | Total balance                                  |
| `lockedBalance`    | number   | Amount locked in active sessions               |
| `currency`         | string   | `INR`, `USD`, or `EUR`                         |
| `status`           | string   | `ACTIVE` or `SUSPENDED`                        |
| `activeSessionId`  | ObjectId | Current active session (if any)                |
| `evmAddress`       | string   | EVM wallet address for crypto payments         |
| `availableBalance` | number   | Virtual: `balance - lockedBalance`             |

### Service

| Field               | Type     | Description                                    |
|---------------------|----------|------------------------------------------------|
| `_id`               | ObjectId | Unique identifier                              |
| `storeId`           | ObjectId | Reference to store                             |
| `name`              | string   | Service name                                   |
| `ratePerSecond`     | number   | Rate per second for streaming                  |
| `ratePerMinute`     | number   | Rate per minute                                |
| `minBalanceRequired`| number   | Minimum balance to start session               |
| `qrCodeId`          | string   | Unique QR code identifier                      |
| `isActive`          | boolean  | Whether service is available                   |
| `ratePerHour`       | number   | Virtual: calculated hourly rate                |

### Session (StreamSession)

| Field                  | Type     | Description                                 |
|------------------------|----------|---------------------------------------------|
| `_id`                  | ObjectId | Unique identifier                           |
| `userWalletId`         | ObjectId | User's wallet                               |
| `storeWalletId`        | ObjectId | Store's wallet                              |
| `serviceId`            | ObjectId | Service being used                          |
| `ratePerSecond`        | number   | Rate at session start                       |
| `startedAt`            | Date     | Session start time                          |
| `lastBilledAt`         | Date     | Last billing timestamp                      |
| `endedAt`              | Date     | Session end time (null if active)           |
| `status`               | string   | `ACTIVE`, `PAUSED`, or `ENDED`              |
| `totalAmountTransferred`| number  | Total amount billed                         |
| `totalDurationSeconds` | number   | Total duration in seconds                   |
| `onChainFlowId`        | string   | Blockchain transaction/flow ID              |
| `superTokenAddress`    | string   | Super token address for Superfluid          |

### WalletLedger

| Field         | Type     | Description                                    |
|---------------|----------|------------------------------------------------|
| `_id`         | ObjectId | Unique identifier                              |
| `walletId`    | ObjectId | Reference to wallet                            |
| `sessionId`   | ObjectId | Reference to session (if applicable)           |
| `direction`   | string   | `DEBIT` or `CREDIT`                            |
| `amount`      | number   | Transaction amount                             |
| `reason`      | string   | Transaction reason (see list above)            |
| `balanceAfter`| number   | Balance after transaction                      |
| `timestamp`   | Date     | Transaction timestamp                          |
| `metadata`    | object   | Additional metadata                            |

---

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:5000/api/docs
```

This provides a Swagger UI interface where you can:
- View all API endpoints
- See request/response schemas
- Test API calls directly from the browser

---

## Environment Variables

| Variable          | Description                    | Default                              |
|-------------------|--------------------------------|--------------------------------------|
| `PORT`            | Server port                    | `5000`                               |
| `NODE_ENV`        | Environment mode               | `development`                        |
| `MONGO_URI`       | MongoDB connection string      | `mongodb://localhost:27017/pulsepay` |
| `CORS_ORIGIN`     | Allowed CORS origins           | `*`                                  |
| `TEST_PRIVATE_KEY`| Test private key for blockchain| -                                    |

---

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp ENV_TEMPLATE.txt .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   mongod
   ```

4. **Start the server:**
   ```bash
   npm start
   # or for development with hot reload:
   npm run dev
   ```

5. **Access the API:**
   - Base URL: `http://localhost:5000/api`
   - Swagger Docs: `http://localhost:5000/api/docs`
   - Health Check: `http://localhost:5000/health`

---

## License

MIT License
