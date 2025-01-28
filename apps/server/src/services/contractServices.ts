import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { config } from 'dotenv';
import { MinterAbi, PhytCardsAbi, deployedAddresses, BASE_RPC_URL } from '@phyt/contracts';
import { ContractError, PackPurchaseResult } from '@phyt/types';

config();

const publicClient = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL),
});

const account = privateKeyToAccount(`0x${process.env.SERVER_PRIVATE_KEY}`);
