// import {
//     PackIdSchema,
//     CreatePackSchema,
//     UpdatePackSchema,
//     PackQueryParamsSchema
// } from '@phyt/dto';

// import { validateAuth } from '@/middleware/auth.js';
// import { validateSchema } from '@/middleware/validator.js';

// import type {
//     PackDTO,
//     PacksPageDTO,
//     PackIdDTO,
//     CreatePackDTO,
//     UpdatePackDTO
// } from '@phyt/dto';
// import type { PacksService } from '@phyt/services';
// import type { UUIDv7, PackQueryParams } from '@phyt/types';
// import type { Request, RequestHandler, Response } from 'express';

// export interface PacksController {
//     createPack: RequestHandler[];
//     getPacks: RequestHandler[];
//     getPackById: RequestHandler[];
//     getBuyerPacks: RequestHandler[];
//     updatePack: RequestHandler[];
//     deletePack: RequestHandler[];
//     // Minting endpoints
//     createMintConfig: RequestHandler[];
//     getWhitelistProof: RequestHandler[];
//     purchasePack: RequestHandler[];
// }

// export const makePacksController = (svc: PacksService): PacksController => {
//     const createPack = [
//         validateAuth,
//         validateSchema(undefined, CreatePackSchema),
//         async (
//             req: Request<Record<string, never>, PackDTO, CreatePackDTO>,
//             res: Response<PackDTO>
//         ) => {
//             const pack = await svc.createPack(req.body);
//             res.status(201).json(pack);
//         }
//     ] as RequestHandler[];

//     const getPacks = [
//         validateSchema(undefined, undefined, PackQueryParamsSchema),
//         async (
//             req: Request<
//                 Record<string, never>,
//                 PacksPageDTO,
//                 unknown,
//                 PackQueryParams
//             >,
//             res: Response<PacksPageDTO>
//         ) => {
//             const packs = await svc.getPacks(req.query);
//             res.status(200).json(packs);
//         }
//     ] as RequestHandler[];

//     const getPackById = [
//         validateSchema(PackIdSchema),
//         async (req: Request<PackIdDTO, PackDTO>, res: Response<PackDTO>) => {
//             const pack = await svc.getPackById(req.params.id);
//             res.status(200).json(pack);
//         }
//     ] as RequestHandler[];

//     const getBuyerPacks = [
//         validateAuth,
//         validateSchema(undefined, undefined, PackQueryParamsSchema),
//         async (
//             req: Request<
//                 { buyerId: UUIDv7 },
//                 PacksPageDTO,
//                 unknown,
//                 PackQueryParams
//             >,
//             res: Response<PacksPageDTO>
//         ) => {
//             const packs = await svc.getBuyerPacks(
//                 req.params.buyerId,
//                 req.query
//             );
//             res.status(200).json(packs);
//         }
//     ] as RequestHandler[];

//     const updatePack = [
//         validateAuth,
//         validateSchema(PackIdSchema, UpdatePackSchema),
//         async (
//             req: Request<PackIdDTO, PackDTO, UpdatePackDTO>,
//             res: Response<PackDTO>
//         ) => {
//             const pack = await svc.updatePack(req.params.id, req.body);
//             res.status(200).json(pack);
//         }
//     ] as RequestHandler[];

//     const deletePack = [
//         validateAuth,
//         validateSchema(PackIdSchema),
//         async (req: Request<PackIdDTO, PackDTO>, res: Response<PackDTO>) => {
//             const pack = await svc.deletePack(req.params.id);
//             res.status(200).json(pack);
//         }
//     ] as RequestHandler[];

//     // Minting endpoints
//     const createMintConfig = [
//         validateAuth,
//         async (
//             req: Request<
//                 Record<string, never>,
//                 { configId: string },
//                 { packType: string }
//             >,
//             res: Response
//         ) => {
//             const { packType = 'scrawny' } = req.body;
//             const configId = await svc.createMintConfig(packType);
//             res.status(200).json({ configId: configId.toString() });
//         }
//     ] as RequestHandler[];

//     const getWhitelistProof = [
//         validateAuth,
//         async (req: Request<{ wallet: string }, string[]>, res: Response) => {
//             const proof = await svc.getWhitelistProof(req.params.wallet);
//             res.status(200).json(proof);
//         }
//     ] as RequestHandler[];

//     const purchasePack = [
//         validateAuth,
//         async (
//             req: Request<
//                 Record<string, never>,
//                 any,
//                 {
//                     buyerId: string;
//                     hash: string;
//                     packPrice: string;
//                     packType?: string;
//                 }
//             >,
//             res: Response
//         ) => {
//             const metadata = await svc.purchasePack(req.body);
//             res.status(200).json(metadata);
//         }
//     ] as RequestHandler[];

//     return {
//         createPack,
//         getPacks,
//         getPackById,
//         getBuyerPacks,
//         updatePack,
//         deletePack,
//         // Minting endpoints
//         createMintConfig,
//         getWhitelistProof,
//         purchasePack
//     };
// };
