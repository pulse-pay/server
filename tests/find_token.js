import { Framework } from '@superfluid-finance/sdk-core';
import { ethers } from 'ethers';

const RPC_URL = 'https://1rpc.io/sepolia';
const CHAIN_ID = 11155111;

async function findToken() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const sf = await Framework.create({
        chainId: CHAIN_ID,
        provider
    });

    console.log("Looking up ETHx...");
    try {
        const superToken = await sf.loadSuperToken("ETHx");
        console.log("✅ ETHx Found!");
        console.log("Address:", superToken.address);
        console.log("Symbol:", await superToken.symbol({ providerOrSigner: provider }));
    } catch (e) {
        console.error("❌ Failed to load by symbol:", e.message);
    }
}

findToken();
