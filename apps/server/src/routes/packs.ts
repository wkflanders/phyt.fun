import express, { Router } from 'express';
import { packService } from '../services/packServices';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { purchasePackSchema } from '../lib/validation';

const router: Router = express.Router();

router.use(validateAuth);

router.post('/purchase', validateSchema(purchasePackSchema), async (req, res) => {
    try {
        const purchaseData = await packService.purchasePack(req.body);
        return res.status(200).json(purchaseData);
    } catch (error: any) {
        console.error('Error in POST /packs/purchase: ', error);
        return res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to purchase pack'
        });
    }
});

export { router as packRouter };