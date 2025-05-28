import { MerkleTree } from 'merkletreejs';

import { keccak256 } from 'viem';

import type { UsersRepository } from '@phyt/repositories';

export type MerkleTreeService = ReturnType<typeof makeMerkleTreeService>;

export const makeMerkleTreeService = ({
    usersRepo
}: {
    usersRepo: UsersRepository;
}) => {
    const generateMerkleTree = async (): Promise<MerkleTree> => {
        const wallets = await usersRepo.findWhitelistedWallets();
        const leaves = wallets.map((addr) => keccak256(addr));
        return new MerkleTree(leaves, keccak256, { sortPairs: true });
    };

    const getMerkleRoot = async (): Promise<string> => {
        const tree = await generateMerkleTree();
        // console.log('TREE OUTPUT!!!!: ', tree.getHexRoot());
        // need actual logging
        return tree.getHexRoot();
    };

    const getMerkleProofForWallet = async ({
        wallet
    }: {
        wallet: string;
    }): Promise<string[]> => {
        const tree = await generateMerkleTree();
        const leaf = keccak256(wallet.toLowerCase() as `0x${string}`);
        return tree.getHexProof(leaf);
    };

    return {
        generateMerkleTree,
        getMerkleRoot,
        getMerkleProofForWallet
    };
};
