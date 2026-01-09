import fetch from 'node-fetch';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5001/api';

const USER_KEY = process.env.TEST_PRIVATE_KEY;
if (!USER_KEY) {
    console.error("ERROR: You must provide a TEST_PRIVATE_KEY env var to run a real transaction.");
    console.error("Usage: TEST_PRIVATE_KEY=your_key node tests/test_simulation.js");
    process.exit(1);
}
const USER_WALLET = new ethers.Wallet(USER_KEY);

const ETHX_ADDRESS = '0x30a6933Ca9230361972E413a15dC8114c952414e';
const RPC_URL = 'https://1rpc.io/sepolia';

async function main() {
    console.log('Starting Simulation...');
    console.log(`User Address: ${USER_WALLET.address}`);

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    try {
        const ethBalance = await provider.getBalance(USER_WALLET.address);
        console.log(`ETH Balance: ${ethers.utils.formatEther(ethBalance)} ETH`);

        const ethxAbi = ["function balanceOf(address) view returns (uint256)"];
        const ethxContract = new ethers.Contract(ETHX_ADDRESS, ethxAbi, provider);
        const ethxBalance = await ethxContract.balanceOf(USER_WALLET.address);
        console.log(`ETHx Balance: ${ethers.utils.formatEther(ethxBalance)} ETHx`);

        if (ethxBalance.eq(0)) {
            console.error("\nCRITICAL WARNING: You have 0 ETHx (Super ETH).");
            console.error("   Streaming requires ETHx.");
            console.error("   Please wrap ETH to ETHx at https://curated.superfluid.finance\n");
        }
    } catch (e) {
        console.error("Balance Check Failed:", e.message);
    }

    console.log('Using prehosted MongoDB');

    try {
        // Use existing walletId and serviceId from prehosted database
        const userWalletId = process.env.TEST_USER_WALLET_ID;
        const serviceId = process.env.TEST_SERVICE_ID;

        if (!userWalletId || !serviceId) {
            throw new Error('Missing TEST_USER_WALLET_ID or TEST_SERVICE_ID environment variables');
        }

        console.log(`Using User Wallet: ${userWalletId}`);
        console.log(`Using Service: ${serviceId}`);
        console.log('\n--- Initiating API Flow ---');

        const startRes = await fetch(`${API_URL}/sessions/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userWalletId: userWalletId,
                serviceId: serviceId
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
            console.log(`\nSUCCESS! On-Chain Flow Created.`);
            console.log(`Tx Hash: ${flowId}`);
            console.log(`Etherscan: https://sepolia.etherscan.io/tx/${flowId}`);

            console.log('\nWaiting 10s before sync...');
            await new Promise(r => setTimeout(r, 10000));

            const syncRes = await fetch(`${API_URL}/sessions/${sessionId}/sync`, { method: 'POST' });
            console.log('Sync Response:', await syncRes.json());

            const endRes = await fetch(`${API_URL}/sessions/${sessionId}/end`, { method: 'POST' });
            console.log('End Response:', await endRes.json());
        } else {
            console.log('Session started locally, but NO Flow ID returned.');
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

main();
