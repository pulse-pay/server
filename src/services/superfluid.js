import { Framework } from '@superfluid-finance/sdk-core';
import { ethers } from 'ethers';

// Configuration for Sepolia Testnet (defaulting if env vars not set)
// In production, these should be in .env
const RPC_URL = process.env.RPC_URL || 'https://1rpc.io/sepolia';
const CHAIN_ID = 11155111;
// Default Super Token (ETHx on Sepolia) - Native ETH wrapper
// Token Address: 0x30a18cc9199d749d79df29e90f6795e3e8f99e32
export const DEFAULT_SUPER_TOKEN = '0x30a6933Ca9230361972E413a15dC8114c952414e';

let sf;
let provider;

/**
 * Initialize Superfluid Framework
 */
export const initSuperfluid = async () => {
    if (sf) return { sf, provider };

    provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    sf = await Framework.create({
        chainId: CHAIN_ID,
        provider
    });

    return { sf, provider };
};

/**
 * Create a flow from Sender to Receiver
 * @param {string} senderPrivateKey - Private key of the sender (User)
 * @param {string} receiverAddress - EVM address of the receiver (Store)
 * @param {string} flowRate - Flow rate in wei/second
 * @param {string} superTokenAddress - Address of the Super Token
 */
export const createFlow = async (senderPrivateKey, receiverAddress, flowRate, superTokenAddress = DEFAULT_SUPER_TOKEN) => {
    try {
        const { sf, provider } = await initSuperfluid();

        const signer = new ethers.Wallet(senderPrivateKey, provider);

        const superToken = await sf.loadSuperToken(superTokenAddress);

        console.log(`Creating flow from ${signer.address} to ${receiverAddress} at rate ${flowRate}`);

        const flowOp = superToken.createFlow({
            sender: signer.address,
            receiver: receiverAddress,
            flowRate: flowRate
        });

        const txResponse = await flowOp.exec(signer);
        const receipt = await txResponse.wait();

        return {
            success: true,
            flowIds: receipt.hash, // Using tx hash as reference
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Error creating flow:', error);
        throw error;
    }
};

/**
 * Stop a flow
 * @param {string} senderPrivateKey - Private key of the sender (User)
 * @param {string} receiverAddress - EVM address of the receiver (Store)
 * @param {string} superTokenAddress - Address of the Super Token
 */
export const stopFlow = async (senderPrivateKey, receiverAddress, superTokenAddress = DEFAULT_SUPER_TOKEN) => {
    try {
        const { sf, provider } = await initSuperfluid();

        const signer = new ethers.Wallet(senderPrivateKey, provider);
        const superToken = await sf.loadSuperToken(superTokenAddress);

        console.log(`Stopping flow from ${signer.address} to ${receiverAddress}`);

        const flowOp = superToken.deleteFlow({
            sender: signer.address,
            receiver: receiverAddress
        });

        const txResponse = await flowOp.exec(signer);
        const receipt = await txResponse.wait();

        return {
            success: true,
            txHash: receipt.hash,
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Error stopping flow:', error);
        throw error;
    }
};

/**
 * Get current flow info
 */
export const getFlowInfo = async (senderAddress, receiverAddress, superTokenAddress = DEFAULT_SUPER_TOKEN) => {
    const { sf } = await initSuperfluid();
    const superToken = await sf.loadSuperToken(superTokenAddress);

    const flow = await superToken.getFlow({
        sender: senderAddress,
        receiver: receiverAddress,
        providerOrSigner: provider
    });

    return flow;
};
