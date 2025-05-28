// import { randomInt } from 'node:crypto';

// import { MetadataVO } from '@phyt/models';
// import {
//     DatabaseError,
//     NotFoundError,
//     AWSPutError,
//     AWSGetError,
//     AWSDeleteError
// } from '@phyt/models'; // For generic error handling

// import { RarityWeights, RarityMultipliers } from './metadataConstants.js'; // Moved to a constants file

// import type {
//     TokenURIMetadataDTO,
//     TokenURIMetadataListDTO,
//     GeneratePackMetadataBodyDTO,
//     GenerateWithRarityBodyDTO,
//     TokenIdParamDTO
// } from '@phyt/dto';
// import type { MetadataRepository } from '@phyt/repositories';
// import type {
//     UUIDv7,
//     CardRarity,
//     TokenURIMetadata,
//     SeasonCollection
// } from '@phyt/types';

// export type MetadataService = ReturnType<typeof makeMetadataService>;

// export const makeMetadataService = (repo: MetadataRepository) => {
//     const generateRarity = (): CardRarity => {
//         const weights = Object.entries(RarityWeights) as [CardRarity, number][];
//         const totalWeight = weights.reduce(
//             (sum, [, weight]) => sum + weight,
//             0
//         );
//         const random = randomInt(totalWeight);
//         let cumulativeWeight = 0;
//         for (const [rarity, weight] of weights) {
//             // Now [CardRarity, number]
//             cumulativeWeight += weight;
//             if (random < cumulativeWeight) {
//                 return rarity; // No need for 'as CardRarity' if typed correctly
//             }
//         }
//         return 'silver'; // Fallback
//     };

//     const getMultiplier = (rarity: CardRarity): number => {
//         return RarityMultipliers[rarity];
//     };

//     const _generateSingleTokenMetadata = async (
//         tokenId: number,
//         inputRarity?: CardRarity
//     ): Promise<TokenURIMetadataDTO> => {
//         const rarity = inputRarity ?? generateRarity();
//         const runnerVO = await repo.getRandomRunner();
//         const multiplier = getMultiplier(rarity);
//         const imageUrl = repo.constructCardImageUrl(runnerVO.id, rarity);
//         const runnerName = await repo.fetchRunnerName(runnerVO.userId);

//         const metadata: TokenURIMetadata = {
//             name: `Phyt #${String(tokenId)}`,
//             description: `Phyt Season 0 ${rarity} card featuring runner ${runnerName}`,
//             image: imageUrl,
//             attributes: [
//                 {
//                     runnerId: runnerVO.id,
//                     runnerName,
//                     rarity,
//                     multiplier,
//                     season: 'season_0' as SeasonCollection
//                 }
//             ]
//         };
//         await repo.storeMetadataS3(tokenId, metadata);
//         const metadataVO = MetadataVO.fromRecord(metadata);
//         return metadataVO.toDTO();
//     };

//     const generateTokenMetadata = async (
//         tokenId: number
//     ): Promise<TokenURIMetadataDTO> => {
//         try {
//             return await _generateSingleTokenMetadata(tokenId);
//         } catch (error) {
//             console.error(
//                 '[MetadataService] Error generating token metadata:',
//                 error
//             );
//             if (
//                 error instanceof DatabaseError ||
//                 error instanceof NotFoundError ||
//                 error instanceof AWSPutError ||
//                 error instanceof AWSGetError ||
//                 error instanceof AWSDeleteError
//             )
//                 throw error;
//             throw new DatabaseError(
//                 'Service failed to generate token metadata',
//                 error
//             );
//         }
//     };

//     const generateTokenMetadataWithRarity = async (
//         tokenId: number,
//         rarity: CardRarity
//     ): Promise<TokenURIMetadataDTO> => {
//         try {
//             return await _generateSingleTokenMetadata(tokenId, rarity);
//         } catch (error) {
//             console.error(
//                 '[MetadataService] Error generating token metadata with rarity:',
//                 error
//             );
//             if (
//                 error instanceof DatabaseError ||
//                 error instanceof NotFoundError ||
//                 error instanceof AWSPutError ||
//                 error instanceof AWSGetError ||
//                 error instanceof AWSDeleteError
//             )
//                 throw error;
//             throw new DatabaseError(
//                 'Service failed to generate token metadata with specific rarity',
//                 error
//             );
//         }
//     };

//     const getTokenMetadata = async (
//         tokenId: number
//     ): Promise<TokenURIMetadataDTO> => {
//         try {
//             const metadataVO = await repo.fetchMetadataS3(tokenId);
//             return metadataVO.toDTO();
//         } catch (error) {
//             console.error(
//                 '[MetadataService] Error getting token metadata:',
//                 error
//             );
//             if (
//                 error instanceof DatabaseError ||
//                 error instanceof NotFoundError ||
//                 error instanceof AWSGetError
//             )
//                 throw error;
//             throw new DatabaseError(
//                 'Service failed to retrieve token metadata',
//                 error
//             );
//         }
//     };

//     const generatePackMetadata = async (
//         startTokenId: number,
//         count: number
//     ): Promise<TokenURIMetadataListDTO> => {
//         try {
//             const metadataPromises: Promise<TokenURIMetadataDTO>[] = [];
//             for (let i = 0; i < count; i++) {
//                 metadataPromises.push(generateTokenMetadata(startTokenId + i));
//             }
//             const results = await Promise.all(metadataPromises);
//             return results as TokenURIMetadataListDTO; // Ensure DTO conversion for list
//         } catch (error) {
//             console.error(
//                 '[MetadataService] Error generating pack metadata:',
//                 error
//             );
//             if (
//                 error instanceof DatabaseError ||
//                 error instanceof NotFoundError ||
//                 error instanceof AWSPutError ||
//                 error instanceof AWSGetError ||
//                 error instanceof AWSDeleteError
//             )
//                 throw error;
//             throw new DatabaseError(
//                 'Service failed to generate pack metadata',
//                 error
//             );
//         }
//     };

//     return Object.freeze({
//         generateTokenMetadata,
//         generateTokenMetadataWithRarity,
//         getTokenMetadata,
//         generatePackMetadata
//         // Expose generateRarity and getMultiplier if they need to be used by other services
//         // directly, though typically they are internal details for metadata generation.
//         // generateRarity,
//         // getMultiplier
//     });
// };
