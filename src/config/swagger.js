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
                Wallet: {
                    type: 'object',
                    properties: {
                        ownerType: { type: 'string', enum: ['USER', 'STORE'] },
                        balance: { type: 'number' },
                        currency: { type: 'string' },
                        evmAddress: { type: 'string' },
                        status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] }
                    }
                },
                StreamSession: {
                    type: 'object',
                    properties: {
                        userWalletId: { type: 'string' },
                        storeWalletId: { type: 'string' },
                        serviceId: { type: 'string' },
                        ratePerSecond: { type: 'number' },
                        status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'ENDED'] },
                        onChainFlowId: { type: 'string' }
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
