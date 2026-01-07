import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PulsePay API',
            version: '1.0.0',
            description: 'API Documentation for PulsePay - A Superfluid-powered Streaming Payment System',
            contact: {
                name: 'API Support',
                email: 'support@pulsepay.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5001/api',
                description: 'Development Server',
            },
        ],
        components: {
            schemas: {
                UserAccount: {
                    type: 'object',
                    required: ['fullName', 'email', 'phone'],
                    properties: {
                        id: { type: 'string' },
                        fullName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        walletId: { type: 'string' },
                        status: { type: 'string', enum: ['ACTIVE', 'BLOCKED'] },
                        kycLevel: { type: 'string', enum: ['BASIC', 'VERIFIED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                StoreAccount: {
                    type: 'object',
                    required: ['storeName', 'ownerName', 'email', 'phone', 'storeType'],
                    properties: {
                        id: { type: 'string' },
                        storeName: { type: 'string' },
                        ownerName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        walletId: { type: 'string' },
                        storeType: { type: 'string', enum: ['GYM', 'EV', 'WIFI', 'PARKING'] },
                        location: {
                            type: 'object',
                            properties: {
                                address: { type: 'string' },
                                lat: { type: 'number' },
                                lng: { type: 'number' }
                            }
                        },
                        verificationStatus: { type: 'string', enum: ['PENDING', 'VERIFIED', 'REJECTED'] },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Service: {
                    type: 'object',
                    required: ['storeId', 'name', 'ratePerMinute', 'minBalanceRequired'],
                    properties: {
                        id: { type: 'string' },
                        storeId: { type: 'string' },
                        name: { type: 'string' },
                        ratePerSecond: { type: 'number' },
                        ratePerMinute: { type: 'number' },
                        minBalanceRequired: { type: 'number' },
                        qrCodeId: { type: 'string' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Wallet: {
                    type: 'object',
                    required: ['ownerType', 'ownerId'],
                    properties: {
                        id: { type: 'string' },
                        ownerType: { type: 'string', enum: ['USER', 'STORE'] },
                        ownerId: { type: 'string' },
                        balance: { type: 'number' },
                        lockedBalance: { type: 'number' },
                        currency: { type: 'string', enum: ['INR', 'USD', 'EUR'] },
                        status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] },
                        activeSessionId: { type: 'string' },
                        evmAddress: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                StreamSession: {
                    type: 'object',
                    required: ['userWalletId', 'storeWalletId', 'serviceId', 'ratePerSecond'],
                    properties: {
                        id: { type: 'string' },
                        userWalletId: { type: 'string' },
                        storeWalletId: { type: 'string' },
                        serviceId: { type: 'string' },
                        ratePerSecond: { type: 'number' },
                        startedAt: { type: 'string', format: 'date-time' },
                        lastBilledAt: { type: 'string', format: 'date-time' },
                        endedAt: { type: 'string', format: 'date-time', nullable: true },
                        status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'ENDED'] },
                        totalAmountTransferred: { type: 'number' },
                        totalDurationSeconds: { type: 'number' },
                        onChainFlowId: { type: 'string' },
                        superTokenAddress: { type: 'string' }
                    }
                },
                WalletLedger: {
                    type: 'object',
                    required: ['walletId', 'direction', 'amount', 'reason', 'balanceAfter'],
                    properties: {
                        id: { type: 'string' },
                        walletId: { type: 'string' },
                        sessionId: { type: 'string' },
                        direction: { type: 'string', enum: ['DEBIT', 'CREDIT'] },
                        amount: { type: 'number' },
                        reason: {
                            type: 'string',
                            enum: [
                                'GYM_STREAM',
                                'EV_STREAM',
                                'WIFI_STREAM',
                                'PARKING_STREAM',
                                'WALLET_TOPUP',
                                'WALLET_WITHDRAWAL',
                                'REFUND',
                                'ADJUSTMENT'
                            ]
                        },
                        balanceAfter: { type: 'number' },
                        timestamp: { type: 'string', format: 'date-time' },
                        metadata: { type: 'object' }
                    }
                }
            }
        }
    },
    // Look for jsdoc in routes structure
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export default specs;
