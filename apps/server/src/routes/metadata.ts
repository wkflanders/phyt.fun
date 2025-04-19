import { ValidationError, TokenURIMetadata } from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { validateAuth } from '@/middleware/auth.js';
import { metadataService } from '@/services/metadataServices.js';

const router: Router = express.Router();

router.use(validateAuth);

// Get metadata for a specific token
router.get(
    '/:tokenId',
    async (
        req: Request<{ tokenId: string }, TokenURIMetadata>,
        res: Response<TokenURIMetadata>
    ) => {
        const tokenId = parseInt(req.params.tokenId);
        if (isNaN(tokenId)) {
            throw new ValidationError('Invalid token Id');
        }

        const metadata = await metadataService.getMetadata(tokenId);
        res.status(200).json(metadata);
    }
);

export { router as metadataRouter };
