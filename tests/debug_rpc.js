import { ethers } from 'ethers';

const RPCS = [
    'https://rpc.ankr.com/eth_sepolia',
    'https://eth-sepolia.public.blastapi.io',
    'https://rpc.sepolia.org',
    'https://1rpc.io/sepolia'
];

async function testConnection() {
    for (const RPC_URL of RPCS) {
        console.log(`\nTesting ${RPC_URL}...`);
        try {
            const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
            // Add a timeout to avoid hanging
            const network = await Promise.race([
                provider.getNetwork(),
                new Promise((_, r) => setTimeout(() => r(new Error('Timeout')), 5000))
            ]);
            console.log('✅ Connected!', network.chainId);
            const block = await provider.getBlockNumber();
            console.log('📦 Block:', block);
            return; // Found a working one
        } catch (error) {
            console.error('❌ Failed:', error.code || error.message);
        }
    }
}

testConnection();
