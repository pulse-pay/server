# PulsePay Schema Relations

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│   UserAccount   │         │  StoreAccount   │
│─────────────────│         │─────────────────│
│ _id             │         │ _id             │
│ fullName        │         │ storeName       │
│ email           │         │ ownerName       │
│ phone           │         │ email, phone    │
│ passwordHash    │         │ passwordHash    │
│ walletId ───────┼────┐    │ walletId ───────┼───┐
│ storeIds[] ─────┼────┼───►│ storeType       │   │
│ status          │    │    │ location        │   │
│ kycLevel        │    │    │ verificationStatus  │
└─────────────────┘    │    │ isActive        │   │
                       │    └─────────────────┘   │
                       ▼                          │
              ┌─────────────────┐                 │
              │     Wallet      │◄────────────────┘
              │─────────────────│
              │ _id             │
              │ ownerType (USER/STORE)
              │ ownerId         │
              │ balance         │
              │ lockedBalance   │
              │ currency        │
              │ status          │
              │ activeSessionId─┼──────────┐
              └─────────────────┘          │
                      ▲                    ▼
                      │          ┌─────────────────┐
                      │          │  StreamSession  │
                      │          │─────────────────│
┌─────────────────┐   │          │ _id             │
│    Service      │   │          │ userWalletId ───┼─┐
│─────────────────│   │          │ storeWalletId ──┼─┤
│ _id             │   │          │ serviceId ◄─────┼─┘
│ storeId ────────┼───┼──►Store  │ ratePerSecond   │
│ name            │   │          │ startedAt       │
│ ratePerSecond   │   │          │ lastBilledAt    │
│ minBalanceRequired  │          │ status          │
│ qrCodeId        │   │          │ totalAmountTransferred
│ isActive        │   │          │ totalDurationSeconds
└─────────────────┘   │          └─────────────────┘
                      │                  ▲
                      │                  │
              ┌───────┴─────────┐        │
              │  WalletLedger   │        │
              │─────────────────│        │
              │ _id             │        │
              │ walletId ───────┼────────┤
              │ sessionId ──────┼────────┘
              │ direction (DEBIT/CREDIT)
              │ amount          │
              │ reason          │
              │ balanceAfter    │
              │ timestamp       │
              └─────────────────┘
```

## Relationships Summary

| From          | To            | Type        | Field          | Description                              |
|---------------|---------------|-------------|----------------|------------------------------------------|
| UserAccount   | Wallet        | One-to-One  | walletId       | User's wallet for payments               |
| UserAccount   | StoreAccount  | One-to-Many | storeIds[]     | Stores the user has visited/used         |
| StoreAccount  | Wallet        | One-to-One  | walletId       | Store's wallet for receiving payments    |
| Service       | StoreAccount  | Many-to-One | storeId        | Service belongs to a store               |
| StreamSession | Wallet (User) | Many-to-One | userWalletId   | Session initiated by user wallet         |
| StreamSession | Wallet (Store)| Many-to-One | storeWalletId  | Session pays to store wallet             |
| StreamSession | Service       | Many-to-One | serviceId      | Session uses a specific service          |
| Wallet        | StreamSession | One-to-One  | activeSessionId| Current active session (if any)          |
| WalletLedger  | Wallet        | Many-to-One | walletId       | Transaction belongs to a wallet          |
| WalletLedger  | StreamSession | Many-to-One | sessionId      | Transaction linked to a session          |

## Indexes

| Collection    | Index Fields     | Type     | Purpose                          |
|---------------|------------------|----------|----------------------------------|
| UserAccount   | email            | Unique   | Fast login lookup                |
| UserAccount   | phone            | Unique   | Fast phone lookup                |
| UserAccount   | walletId         | Standard | Wallet reference lookup          |
| UserAccount   | storeIds         | Multikey | Find users by store              |
| StoreAccount  | email            | Unique   | Fast login lookup                |
| StoreAccount  | phone            | Unique   | Fast phone lookup                |
| Wallet        | ownerId+ownerType| Compound | Find wallet by owner             |
| Wallet        | evmAddress       | Unique   | Crypto wallet lookup             |
| Service       | storeId          | Standard | Find services by store           |
| Service       | qrCodeId         | Unique   | QR code scanning                 |
| StreamSession | userWalletId     | Standard | Find sessions by user            |
| StreamSession | status           | Standard | Filter active/ended sessions     |
| WalletLedger  | walletId         | Standard | Transaction history              |
| WalletLedger  | sessionId        | Standard | Session transactions             |