import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const RPC_URL = 'https://1rpc.io/sepolia';
const ETHX_ADDRESS = '0x30a6933Ca9230361972E413a15dC8114c952414e';
const USER_KEY = process.env.TEST_PRIVATE_KEY;

async function check() {
    if (!USER_KEY) return console.log("No key");
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(USER_KEY, provider);

    console.log("Address:", wallet.address);
    const eth = await wallet.getBalance();
    console.log("ETH:", ethers.utils.formatEther(eth));

    const ethx = new ethers.Contract(ETHX_ADDRESS, ["function balanceOf(address) view returns (uint256)"], provider);
    const bal = await ethx.balanceOf(wallet.address);
    console.log("ETHx:", ethers.utils.formatEther(bal));
}
check();
