import express, { Router } from 'express';
import { validateAuth } from '../middleware/auth';
import { validateSchema } from '../middleware/validator';
import { marketplaceService } from '../services/marketplaceServices';
import { openBidSchema, bidSchema, listingSchema } from '../lib/validation';

const router: Router = express.Router();

router.get('/listings', async (req, res) => {
    try {
        const { minPrice, maxPrice, rarity, sort } = req.query;

        const listings = await marketplaceService.getListings({
            minPrice: minPrice?.toString(),
            maxPrice: maxPrice?.toString(),
            rarity: rarity ? (Array.isArray(rarity) ? rarity.map(item => item.toString()) : [rarity.toString()]) : undefined,
            sort: sort?.toString() as 'price_asc' | 'price_desc' | 'created_at'
        });

        return res.status(200).json(listings);
    } catch (error) {
        console.error('Failed to fetch listings:', error);
        return res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// Create a new listing
router.post('/listings', validateAuth, validateSchema(listingSchema), async (req, res) => {
    try {
        const { cardId, price, signature, orderHash, orderData, user } = req.body;
        const listing = await marketplaceService.createListing({
            cardId,
            sellerId: user.id,
            price,
            signature,
            orderHash,
            orderData,
            expirationTime: orderData.expiration_time
        });
        return res.status(201).json(listing);
    } catch (error) {
        console.error('Failed to create listing:', error);
        return res.status(500).json({ error: 'Failed to create listing' });
    }
});

// Place a bid on a listing
router.post('/bids', validateAuth, validateSchema(bidSchema), async (req, res) => {
    try {
        const { listingId, price, signature, orderHash, orderData, user } = req.body;

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
});

// Place an open bid on a card
router.post('/open-bids', validateAuth, validateSchema(openBidSchema), async (req, res) => {
    try {
        const { cardId, price, signature, orderHash, orderData, expirationTime, user } = req.body;

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
});

// Get open bids for a card
router.get('/cards/:cardId/open-bids', async (req, res) => {
    try {
        const { cardId } = req.params;
        const bids = await marketplaceService.getOpenBidsForCard(parseInt(cardId));
        return res.status(200).json(bids);
    } catch (error) {
        console.error('Failed to fetch open bids:', error);
        return res.status(500).json({ error: 'Failed to fetch open bids' });
    }
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