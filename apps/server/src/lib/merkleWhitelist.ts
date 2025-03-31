import { db, users } from '@phyt/database';
import { User } from '@phyt/types';
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'viem';

export async function getWhitelistedWallets(): Promise<string[]> {
    const userRecords = await (db.select().from(users) as Promise<User[]>);
    return userRecords.map((u) => u.wallet_address.toLowerCase());
}

export async function generateMerkleTree(): Promise<MerkleTree> {
    const wallets = await getWhitelistedWallets();
    // Each leaf is the keccak256 hash of the wallet address.
    const leaves = wallets.map((addr) => keccak256(addr as `0x${string}`));
    // Create the tree with sorted pairs for consistency.
    return new MerkleTree(leaves, keccak256, { sortPairs: true });
}

export async function getMerkleRoot(): Promise<string> {
    const tree = await generateMerkleTree();
    // console.log("TREE OUTPUT!!!!: ", tree.getHexRoot());
    // need actual logging
    return tree.getHexRoot();
}

export async function getMerkleProofForWallet(
    wallet: string
): Promise<string[]> {
    const tree = await generateMerkleTree();
    const leaf = keccak256(wallet.toLowerCase() as `0x${string}`);
    return tree.getHexProof(leaf);
}
