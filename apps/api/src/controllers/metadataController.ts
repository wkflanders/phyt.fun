// import {
//     TokenIdParamSchema,
//     GeneratePackMetadataBodySchema,
//     GenerateWithRarityBodySchema
// } from '@phyt/dto';

// import { validateSchema } from '@/middleware/validator.js';

// import type {
//     TokenIdParamDTO,
//     GeneratePackMetadataBodyDTO,
//     GenerateWithRarityBodyDTO,
//     TokenURIMetadataDTO,
//     TokenURIMetadataListDTO
// } from '@phyt/dto';
// import type { MetadataService } from '@phyt/services';
// import type { Request, Response, RequestHandler } from 'express';
// // Assuming validateAuth middleware exists and is similar to commentsController
// // import { validateAuth } from '@/middleware/auth.js';

// export interface MetadataController {
//     getTokenMetadata: RequestHandler[];
//     generateTokenMetadata: RequestHandler[]; // For a single token, perhaps admin only
//     generateTokenMetadataWithRarity: RequestHandler[]; // Admin only
//     generatePackMetadata: RequestHandler[]; // Admin only
// }

// export const makeMetadataController = (
//     svc: MetadataService
// ): MetadataController => {
//     const getTokenMetadata = [
//         // validateAuth, // Add if auth is needed
//         validateSchema(TokenIdParamSchema),
//         async (
//             req: Request<TokenIdParamDTO, TokenURIMetadataDTO>,
//             res: Response<TokenURIMetadataDTO>
//         ) => {
//             const metadata = await svc.getTokenMetadata(req.params.tokenId);
//             res.status(200).json(metadata);
//         }
//     ] as RequestHandler[];

//     // Example: Endpoint to generate metadata for a single new token ID (could be POST)
//     // This would likely be an admin-only or internal service endpoint.
//     const generateTokenMetadata = [
//         // validateAuth, // Add admin auth if needed
//         validateSchema(TokenIdParamSchema), // Assuming tokenId is in params for which to generate
//         async (
//             req: Request<TokenIdParamDTO, TokenURIMetadataDTO>,
//             res: Response<TokenURIMetadataDTO>
//         ) => {
//             const metadata = await svc.generateTokenMetadata(
//                 req.params.tokenId
//             );
//             res.status(201).json(metadata);
//         }
//     ] as RequestHandler[];

//     const generateTokenMetadataWithRarity = [
//         // validateAuth, // Add admin auth if needed
//         validateSchema(undefined, GenerateWithRarityBodySchema), // tokenId and rarity in body
//         async (
//             req: Request<
//                 Record<string, never>,
//                 TokenURIMetadataDTO,
//                 GenerateWithRarityBodyDTO
//             >,
//             res: Response<TokenURIMetadataDTO>
//         ) => {
//             const { tokenId, rarity } = req.body;
//             const metadata = await svc.generateTokenMetadataWithRarity(
//                 tokenId,
//                 rarity
//             );
//             res.status(201).json(metadata);
//         }
//     ] as RequestHandler[];

//     const generatePackMetadata = [
//         // validateAuth, // Add admin auth if needed
//         validateSchema(undefined, GeneratePackMetadataBodySchema),
//         async (
//             req: Request<
//                 Record<string, never>,
//                 TokenURIMetadataListDTO,
//                 GeneratePackMetadataBodyDTO
//             >,
//             res: Response<TokenURIMetadataListDTO>
//         ) => {
//             const { startTokenId, count } = req.body;
//             const metadataList = await svc.generatePackMetadata(
//                 startTokenId,
//                 count
//             );
//             res.status(201).json(metadataList);
//         }
//     ] as RequestHandler[];

//     return {
//         getTokenMetadata,
//         generateTokenMetadata,
//         generateTokenMetadataWithRarity,
//         generatePackMetadata
//     };
// };
