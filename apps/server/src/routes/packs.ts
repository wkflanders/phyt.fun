import express, { Router } from 'express';
import { packService } from '../services/packServices';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { purchasePackSchema } from '../lib/validation';

const router: Router = express.Router();

router.use(validateAuth);

router.get('/init/:walletAddress', async (req, res) => {
    try {
        const wallet_address = req.params.walletAddress;
        const mintConfigId = await packService.createMintConfig();
        const packPrice = await packService.getPackPrice(mintConfigId);
        const merkleProof = await packService.getWhitelistProof(wallet_address);

        if (!Array.isArray(merkleProof)) {
            throw new Error('Invalid merkle proof format');
        }

        return res.status(200).json({
            mintConfigId: mintConfigId.toString(),
            packPrice: packPrice.toString(),
            merkleProof: merkleProof
        });
    } catch (error) {
        console.error('Failed to create mint config:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        });
    }
});

router.post('/purchase', validateSchema(purchasePackSchema), async (req, res) => {
    try {
        const { buyerId, hash, packPrice } = req.body;

        const result = await packService.purchasePack({
            buyerId,
            hash,
            packPrice
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Pack purchase failed:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to process pack purchase',
        });
    }
});

export { router as packRouter };