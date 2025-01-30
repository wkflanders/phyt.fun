import express, { Router } from 'express';
import { metadataService } from '../services/metadataServices';
import { NotFoundError } from '@phyt/types';

const router: Router = express.Router();

// Get metadata for a specific token
router.get('/:tokenId', async (req, res) => {
    try {
        const tokenId = parseInt(req.params.tokenId);
        if (isNaN(tokenId)) {
            return res.status(400).json({ error: 'Invalid token ID' });
        }

        const metadata = await metadataService.getMetadata(tokenId);
        return res.status(200).json(metadata);
    } catch (error: any) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: 'Metadata not found' });
        }
        console.error('Error in GET /metadata/:tokenId:', error);
        return res.status(500).json({ error: 'Failed to fetch metadata' });
    }
});

export { router as metadataRouter };