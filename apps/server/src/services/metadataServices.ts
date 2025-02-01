import { db, eq, runners, card_metadata } from '@phyt/database';
import { CardRarity, RarityWeights, RarityMultipliers, TokenURIMetadata } from '@phyt/types';
import { s3Service } from '../lib/awsClient';
import { randomInt } from 'crypto';

export const metadataService = {
    generateRarity: (): CardRarity => {
        const weights = Object.entries(RarityWeights);
        const totalWeight = weights.reduce((sum, [_, weight]) => sum + weight, 0);

        // Generate cryptographically secure random number
        const random = randomInt(totalWeight);
        let cumulativeWeight = 0;

        for (const [rarity, weight] of weights) {
            cumulativeWeight += weight;
            if (random < cumulativeWeight) {
                return rarity as CardRarity;
            }
        }

        return 'bronze'; // Fallback, should never reach here due to cumulative weights
    },
    selectRandomRunner: async () => {
        const allRunners = await db.select()
            .from(runners)
            .execute();

        if (allRunners.length === 0) {
            throw new Error('No runners available');
        }

        const randomIndex = randomInt(allRunners.length);
        return allRunners[randomIndex];
    },
    getMultiplier: (rarity: CardRarity): number => {
        return RarityMultipliers[rarity];
    },

    generateMetadata: async (tokenId: number): Promise<TokenURIMetadata> => {
        const rarity = metadataService.generateRarity();
        const runner = await metadataService.selectRandomRunner();
        const multiplier = metadataService.getMultiplier(rarity);
        const imageUrl = s3Service.getImageUrl(runner.id, rarity);

        const metadata = {
            name: `Phyt Card #${tokenId}`,
            description: `A ${rarity} rarity card featuring runner ${runner.id}`,
            image: imageUrl,
            attributes: [{
                runner_id: runner.id,
                runner_name: runner.user_id.toString(),
                rarity: rarity,
                multiplier: multiplier,
            }]
        };

        await db.insert(card_metadata).values({
            token_id: tokenId,
            runner_id: runner.id,
            runner_name: metadata.attributes[0].runner_name,
            rarity: rarity,
            multiplier: multiplier,
            image_url: imageUrl,
        });

        await s3Service.uploadMetadata(tokenId, metadata);

        return metadata;
    },

    getMetadata: async (tokenId: number) => {
        try {
            return await s3Service.getMetadata(tokenId);
        } catch (error) {
            console.error(`Failed to get metadata for token ${tokenId}:`, error);
            throw error;
        }
    },

    generatePackMetadata: async (startTokenId: number, count: number) => {
        const metadataPromises = [];
        for (let i = 0; i < count; i++) {
            metadataPromises.push(metadataService.generateMetadata(startTokenId + i));
        }
        return Promise.all(metadataPromises);
    }
};
