import { randomInt } from 'node:crypto';

import { db, eq, runners, users } from '@phyt/database';
import {
    CardRarity,
    RarityWeights,
    RarityMultipliers,
    TokenURIMetadata,
    Runner,
    HttpError,
    NotFoundError,
    DatabaseError
} from '@phyt/types';

import { s3Service } from '@/lib/awsClient.js';

export const metadataService = {
    generateRarity: (): CardRarity => {
        const weights = Object.entries(RarityWeights);
        const totalWeight = weights.reduce(
            (sum, [, weight]) => sum + weight,
            0
        );

        // Generate a random number between 0 (inclusive) and totalWeight (exclusive)
        const random = randomInt(totalWeight);
        let cumulativeWeight = 0;

        for (const [rarity, weight] of weights) {
            cumulativeWeight += weight;
            if (random < cumulativeWeight) {
                return rarity as CardRarity;
            }
        }

        return 'silver'; // Fallback, should never reach here due to cumulative weights
    },
    selectRandomRunner: async (): Promise<Runner> => {
        try {
            const allRunners = await db.select().from(runners).execute();

            if (allRunners.length === 0) {
                throw new NotFoundError('No runners found');
            }

            const randomIndex = randomInt(allRunners.length);
            return allRunners[randomIndex];
        } catch (err: unknown) {
            console.error('Error with selectRandomRunner', err);
            throw new HttpError('Error with selecting a random runner');
        }
    },

    getMultiplier: (rarity: CardRarity): number => {
        return RarityMultipliers[rarity];
    },

    getRunnerName: async (runnerUserId: number): Promise<string> => {
        try {
            const user = await db
                .select({
                    username: users.username
                })
                .from(users)
                .where(eq(users.id, runnerUserId))
                .execute();

            return user[0].username;
        } catch (err: unknown) {
            console.error('Error with getRunnerName ', err);
            throw new DatabaseError('Failed to fetch runner name');
        }
    },

    generateMetadata: async (tokenId: number): Promise<TokenURIMetadata> => {
        const rarity = metadataService.generateRarity();
        const runner = await metadataService.selectRandomRunner();
        const multiplier = metadataService.getMultiplier(rarity);
        const imageUrl = s3Service.getImageUrl(runner.id, rarity);
        const runnerName = await metadataService.getRunnerName(runner.id);

        const metadata = {
            name: `Phyt #${String(tokenId)}`,
            description: `Phyt Season 0 ${rarity} card featuring runner ${runnerName}`,
            image: imageUrl,
            attributes: [
                {
                    runner_id: runner.id,
                    runner_name: runnerName,
                    rarity: rarity,
                    multiplier: multiplier,
                    season: 'season_0' as const
                }
            ]
        };

        try {
            await s3Service.uploadMetadata(tokenId, metadata);

            return metadata;
        } catch (err: unknown) {
            console.error('Error with generateMetadata ', err);
            throw new HttpError('Failed to generate metadata');
        }
    },

    generateMetadataWithRarity: async (
        tokenId: number,
        rarity: CardRarity
    ): Promise<TokenURIMetadata> => {
        const runner = await metadataService.selectRandomRunner();
        const multiplier = metadataService.getMultiplier(rarity);
        const imageUrl = s3Service.getImageUrl(runner.id, rarity);
        const runnerName = await metadataService.getRunnerName(runner.id);

        const metadata = {
            name: `Phyt #${String(tokenId)}`,
            description: `Season 0 ${rarity} card featuring runner ${runnerName}`,
            image: imageUrl,
            attributes: [
                {
                    runner_id: runner.id,
                    runner_name: runnerName,
                    rarity: rarity,
                    multiplier: multiplier,
                    season: 'season_0' as const
                }
            ]
        };
        try {
            await s3Service.uploadMetadata(tokenId, metadata);

            return metadata;
        } catch (err: unknown) {
            console.error('Error with generateMetadataWithRarity ', err);
            throw new HttpError('Failed to generate metadata with rarity');
        }
    },

    getMetadata: async (tokenId: number): Promise<TokenURIMetadata> => {
        try {
            return await s3Service.getMetadata(tokenId);
        } catch (err: unknown) {
            console.error('Error with getMetadata', err);
            throw new HttpError('Failed to get metadata for token');
        }
    },

    generatePackMetadata: async (
        startTokenId: number,
        count: number
    ): Promise<TokenURIMetadata[]> => {
        try {
            const metadataPromises = [];
            for (let i = 0; i < count; i++) {
                metadataPromises.push(
                    metadataService.generateMetadata(startTokenId + i)
                );
            }
            return await Promise.all(metadataPromises);
        } catch (err: unknown) {
            console.error('Error with generatePackMetadata', err);
            throw new HttpError('Error with generating pack metadata');
        }
    }
};
