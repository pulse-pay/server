import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { ethers } from 'ethers';
import User from '../src/models/User.js';
import StoreAccount from '../src/models/StoreAccount.js';
import Wallet from '../src/models/Wallet.js';
import Service from '../src/models/Service.js';
import dotenv from 'dotenv';

dotenv.config();

// CONFIG
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pulsepay';
const API_URL = 'http://localhost:5001/api'; // Port 5001

// Setup keys
const USER_KEY = process.env.TEST_PRIVATE_KEY;
if (!USER_KEY) {
    console.error("❌ ERROR: You must provide a TEST_PRIVATE_KEY env var to run a real transaction.");
    console.error("Usage: TEST_PRIVATE_KEY=your_key node tests/test_simulation.js");
    process.exit(1);
}
const USER_WALLET = new ethers.Wallet(USER_KEY);
const STORE_KEY = ethers.Wallet.createRandom().privateKey;
const STORE_WALLET = new ethers.Wallet(STORE_KEY);

// Super Token Address (ETHx on Sepolia)
const ETHX_ADDRESS = '0x30a6933Ca9230361972E413a15dC8114c952414e';
// Reliable RPC
const RPC_URL = 'https://1rpc.io/sepolia';

async function main() {
    console.log('🧪 Starting Simulation...');
    console.log(`👤 User Address: ${USER_WALLET.address}`);
    console.log(`🏪 Store Address: ${STORE_WALLET.address}`);

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    // --- 1. Check Balances ---
    try {
        const ethBalance = await provider.getBalance(USER_WALLET.address);
        console.log(`💰 ETH Balance: ${ethers.utils.formatEther(ethBalance)} ETH`);

        const ethxAbi = ["function balanceOf(address) view returns (uint256)"];
        const ethxContract = new ethers.Contract(ETHX_ADDRESS, ethxAbi, provider);
        const ethxBalance = await ethxContract.balanceOf(USER_WALLET.address);
        console.log(`💧 ETHx Balance: ${ethers.utils.formatEther(ethxBalance)} ETHx`);

        if (ethxBalance.eq(0)) {
            console.error("\n❌ CRITICAL WARNING: You have 0 ETHx (Super ETH).");
            console.error("   Streaming requires ETHx.");
            console.error("   Please wrap ETH to ETHx at https://curated.superfluid.finance\n");
            // We continue, but expect failure.
        }
    } catch (e) {
        console.error("⚠️  Balance Check Failed:", e.message);
    }

    // --- 2. Connect DB ---
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB');

    try {
        const suffix = Math.floor(Math.random() * 10000);

        // --- 3. Create User Wallet ---
        const userWallet = await Wallet.create({
            ownerType: 'USER',
            ownerId: new mongoose.Types.ObjectId(),
            balance: 1000,
            currency: 'USD',
            evmAddress: USER_WALLET.address,
            encryptedPrivateKey: USER_KEY
        });
        console.log(`✅ Created User Wallet: ${userWallet._id}`);

        // --- 4. Create Store Wallet ---
        const storeWallet = await Wallet.create({
            ownerType: 'STORE',
            ownerId: new mongoose.Types.ObjectId(),
            balance: 0,
            currency: 'USD',
            evmAddress: STORE_WALLET.address
        });
        console.log(`✅ Created Store Wallet: ${storeWallet._id}`);

        const storeAccount = await StoreAccount.create({
            storeName: `Test Store ${suffix}`,
            ownerName: 'Test Owner',
            email: `store${suffix}@test.com`,
            phone: `12345${Math.floor(Math.random() * 100000)}`,
            passwordHash: 'secret_hash',
            walletId: storeWallet._id,
            storeType: 'GYM',
            location: { address: 'Metaverse', lat: 0, lng: 0 },
            verificationStatus: 'VERIFIED'
        });
        storeWallet.ownerId = storeAccount._id;
        await storeWallet.save();

        // --- 5. Create Service ---
        const service = await Service.create({
            storeId: storeAccount._id,
            name: `Superfluid Gym Access ${suffix}`,
            ratePerMinute: 0.0001, // 0.0001 ETH per minute
            minBalanceRequired: 10,
            isActive: true
        });
        console.log(`✅ Created Service: ${service._id}`);

        console.log('\n--- 🚀 Initiating API Flow ---');

        // --- 6. Call API ---
        const startRes = await fetch(`${API_URL}/sessions/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userWalletId: userWallet._id,
                serviceId: service._id
            })
        });

        const text = await startRes.text();
        console.log(`Response Status: ${startRes.status}`);

        let startData;
        try { startData = JSON.parse(text); }
        catch { console.log("Raw Body:", text); startData = { success: false }; }

        if (!startData.success) {
            throw new Error('API Failed: ' + (startData.message || text));
        }

        const sessionId = startData.data._id;
        const flowId = startData.data.onChainFlowId;

        if (flowId) {
            console.log(`\n✨ SUCCESS! On-Chain Flow Created.`);
            console.log(`🔗 Tx Hash: ${flowId}`);
            console.log(`🔗 Etherscan: https://sepolia.etherscan.io/tx/${flowId}`);

            console.log('\nWaiting 10s before sync...');
            await new Promise(r => setTimeout(r, 10000));

            const syncRes = await fetch(`${API_URL}/sessions/${sessionId}/sync`, { method: 'POST' });
            console.log('Sync Response:', await syncRes.json());

            // Cleanup
            const endRes = await fetch(`${API_URL}/sessions/${sessionId}/end`, { method: 'POST' });
            console.log('End Response:', await endRes.json());
        } else {
            console.log('⚠️  Session started locally, but NO Flow ID returned.');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Done');
    }
}

main();
