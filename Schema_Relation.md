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