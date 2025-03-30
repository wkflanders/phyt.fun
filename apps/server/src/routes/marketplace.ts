import {
    HttpError,
    CreateListingRequestBody,
    AuthenticatedBody
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { openBidSchema, bidSchema, listingSchema } from '@/lib/validation';
import { validateAuth } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validator';
import { marketplaceService } from '@/services/marketplaceServices';

const router: Router = express.Router();

router.get('/listings', async (req: Request, res: Response) => {
    const { minPrice, maxPrice, rarity, sort } = req.query;

    const toStringValue = (value: unknown): string | undefined => {
        if (value == null) return undefined;
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean')
            return value.toString();
        // For non-primitive objects, use JSON.stringify.
        return JSON.stringify(value);
    };

    const minPriceStr = toStringValue(minPrice);
    const maxPriceStr = toStringValue(maxPrice);

    let rarityArray: string[] | undefined;
    if (rarity != null) {
        if (Array.isArray(rarity)) {
            rarityArray = rarity.map((item) => {
                const str = toStringValue(item);
                return str ?? '';
            });
        } else {
            const rarityVal = toStringValue(rarity);
            rarityArray = rarityVal !== undefined ? [rarityVal] : undefined;
        }
    }

    const sortStr = toStringValue(sort) as
        | 'price_asc'
        | 'price_desc'
        | 'created_at'
        | undefined;

    const listings = await marketplaceService.getListings({
        minPrice: minPriceStr,
        maxPrice: maxPriceStr,
        rarity: rarityArray,
        sort: sortStr
    });

    res.status(200).json(listings);
});

// Create a new listing
router.post(
    '/listing',
    validateAuth,
    validateSchema(listingSchema),
    async (
        req: Request<
            Record<string, never>,
            unknown,
            CreateListingRequestBody & AuthenticatedBody
        >,
        res: Response
    ) => {
        const { card_id, price, signature, order_hash, order_data, user } =
            req.body;
        const listing = await marketplaceService.createListing({
            card_id,
            sellerId: user.id,
            price,
            signature,
            order_hash,
            order_data,
            expirationTime: order_data.expiration_time
        });
        res.status(201).json(listing);
    }
);

// Place a bid on a listing
router.post(
    '/bids',
    validateAuth,
    validateSchema(bidSchema),
    async (req, res) => {
        try {
            const { listingId, price, signature, orderHash, orderData, user } =
                req.body;

            const bid = await marketplaceService.createBid({
                listingId,
                bidderId: user.id,
                price,
                signature,
                orderHash,
                orderData
            });

            return res.status(201).json(bid);
        } catch (error) {
            console.error('Failed to place bid:', error);
            return res.status(500).json({ error: 'Failed to place bid' });
        }
    }
);

// Place an open bid on a card
router.post(
    '/open-bids',
    validateAuth,
    validateSchema(openBidSchema),
    async (req, res) => {
        try {
            const {
                cardId,
                price,
                signature,
                orderHash,
                orderData,
                expirationTime,
                user
            } = req.body;

            const bid = await marketplaceService.createOpenBid({
                cardId,
                bidderId: user.id,
                price,
                signature,
                orderHash,
                orderData,
                expirationTime: new Date(expirationTime)
            });

            return res.status(201).json(bid);
        } catch (error) {
            console.error('Failed to place open bid:', error);
            return res.status(500).json({ error: 'Failed to place open bid' });
        }
    }
);

// Get open bids for a card
router.get('/cards/:cardId/open-bids', async (req, res) => {
    const { cardId } = req.params;
    if (isNaN(parseInt(cardId))) {
        throw new HttpError('Invalid card ID', 400);
    }

    const bids = await marketplaceService.getOpenBidsForCard(parseInt(cardId));
    return res.status(200).json(bids);
});

// Get user's bids (both regular and open)
router.get('/users/:userId/bids', validateAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const bids = await marketplaceService.getAllUserBids(parseInt(userId));
        return res.status(200).json(bids);
    } catch (error) {
        console.error('Failed to fetch user bids:', error);
        return res.status(500).json({ error: 'Failed to fetch user bids' });
    }
});

// Accept an open bid
router.post('/open-bids/:bidId/accept', validateAuth, async (req, res) => {
    try {
        const { bidId } = req.params;
        const { transactionHash } = req.body;

        const result = await marketplaceService.acceptOpenBid({
            bidId: parseInt(bidId),
            transactionHash
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Failed to accept open bid:', error);
        return res.status(500).json({ error: 'Failed to accept open bid' });
    }
});

export { router as marketplaceRouter };
