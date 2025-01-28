import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { config } from 'dotenv';
import { MinterAbi, PhytCardsAbi, deployedAddresses } from '@phyt/contracts';
import { ContractError, PackPurchaseResult } from '@phyt/types';

config();

const { MINTER, PHYT_CARDS } = deployedAddresses;

const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL),
});

const account = privateKeyToAccount(process.env.SERVER_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(process.env.BASE_RPC_URL),
});

const CONTRACTS = {
    MINTER: process.env.MINTER as `0x${string}`,
    PHYT_CARDS: process.env.PHYT_CARDS as `0x${string}`
} as const;
