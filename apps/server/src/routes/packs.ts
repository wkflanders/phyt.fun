import {
    PackPurchaseNotif,
    TokenURIMetadata,
    MintConfigResponse
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { purchasePackSchema } from '@/lib/validation';
import { validateAuth } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validator';
import { packService } from '@/services/packServices';

const router: Router = express.Router();

router.use(validateAuth);

router.get(
    '/init/:walletAddress',
    async (
        req: Request<
            { walletAddress: string },
            MintConfigResponse,
            Record<string, never>,
            { packType?: string }
        >,
        res: Response<MintConfigResponse>
    ) => {
        const wallet_address = req.params.walletAddress;
        const packType = req.query.packType ?? 'scrawny';

        const mintConfigId = await packService.createMintConfig(packType);
        const packPrice = packService.getPackPrice(packType);
        const merkleProof = await packService.getWhitelistProof(wallet_address);

        if (!Array.isArray(merkleProof)) {
            throw new Error('Invalid merkle proof format');
        }

        const mintConfig: MintConfigResponse = {
            mintConfigId: mintConfigId.toString(),
            packPrice: packPrice.toString(),
            merkleProof: merkleProof,
            packType: packType
        };

        res.status(200).json(mintConfig);
    }
);

router.post(
    '/purchase',
    validateSchema(purchasePackSchema),
    async (
        req: Request<
            Record<string, never>,
            TokenURIMetadata[],
            PackPurchaseNotif
        >,
        res: Response<TokenURIMetadata[]>
    ) => {
        const { buyerId, hash, packPrice, packType = 'scrawny' } = req.body;

        const result = await packService.purchasePack({
            buyerId,
            hash,
            packPrice,
            packType
        });

        res.status(200).json(result);
    }
);

export { router as packRouter };
