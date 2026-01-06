# Superfluid Integration (Sepolia Testnet)

This project has been upgraded to support real-time MONEY STREAMING using the Superfluid Protocol on the Sepolia Testnet.

## Prerequisites

1.  **Funded Wallet**: You need a Sepolia ETH wallet with some `ETH` (for gas) and `ETHx` (Super ETH) for streaming.
    *   Get Sepolia ETH from a faucet (e.g., Alchemy Sepolia Faucet).
    *   Wrap ETH to ETHx at [Superfluid Dashboard](https://app.superfluid.finance/).

## Configuration

The following Environment Variables in `.env` (or default in `src/services/superfluid.js`) control the network:

```
RPC_URL=https://rpc.sepolia.org
```

## How it Works

1.  **Start Session**: When `POST /api/sessions/start` is called:
    *   The backend checks if the User Wallet has an `encryptedPrivateKey` and the Store has an `evmAddress`.
    *   If yes, it uses the **Superfluid SDK** to create a flow from User -> Store on-chain.
2.  **Sync Status**: You can call `POST /api/sessions/:id/sync` to check the on-chain status.
    *   If the user runs out of balance, Superfluid automatically stops the stream.
    *   The sync endpoint detects this (Flow Rate = 0) and ends the session in the database.
3.  **End Session**: When `POST /api/sessions/:id/end` is called, the backend stops the stream on-chain.

## Testing

A comprehensive E2E test script is provided in `tests/test_simulation.js`.

### Running the Test

1.  Start the server:
    ```bash
    npm start
    ```
    (Note: Port is configured to 5001 to avoid conflicts)

2.  Run the simulation:
    ```bash
    node tests/test_simulation.js
    ```

**Important**: The default test uses a random, unfunded wallet, so the on-chain transaction will fail (or hang/timeout). To test successfully, update `tests/test_simulation.js` with a valid Private Key.
