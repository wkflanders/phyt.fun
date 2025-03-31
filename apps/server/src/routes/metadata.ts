import { ValidationError } from '@phyt/types';
import express, { Router } from 'express';

import { validateAuth } from '@/middleware/auth';
import { metadataService } from '@/services/metadataServices';

const router: Router = express.Router();

router.use(validateAuth);

// Get metadata for a specific token
router.get('/:tokenId', async (req, res) => {
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) {
        throw new ValidationError('Invalid token Id');
    }

    const metadata = await metadataService.getMetadata(tokenId);
    res.status(200).json(metadata);
});

export { router as metadataRouter };
