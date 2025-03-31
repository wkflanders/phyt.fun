import {
    HttpError,
    CreateListingRequestBody,
    AuthenticatedBody,
    ListedBidRequestBody,
    OpenBidRequestBody
} from '@phyt/types';
import express, { Router, Request, Response } from 'express';

import { toStringValue } from '@/lib/utils';
import { openBidSchema, bidSchema, listingSchema } from '@/lib/validation';
import { validateAuth } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validator';
import { marketplaceService } from '@/services/marketplaceServices';

const router: Router = express.Router();

router.get('/listings', async (req: Request, res: Response) => {
    const { minPrice, maxPrice, rarity, sort } = req.query;

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
            seller_id: user.id,
            price,
            signature,
            order_data,
            order_hash,
            expiration_time: String(order_data.expiration_time)
        });
        res.status(201).json(listing);
    }
);

// Place a bid on a listing
router.post(
    '/bid',
    validateAuth,
    validateSchema(bidSchema),
    async (
        req: Request<
            Record<string, never>,
            unknown,
            ListedBidRequestBody & AuthenticatedBody
        >,
        res: Response
    ) => {
        const {
            listing_id,
            bid_amount,
            signature,
            order_hash,
            order_data,
            user
        } = req.body;

        const bid = await marketplaceService.createBid({
            listing_id,
            bidder_id: user.id,
            signature,
            order_hash,
            order_data,
            bid_type: 'listing', // Adding the missing property
            bid_amount // Using price as bid_amount
        });

        res.status(201).json(bid);
    }
);

// Place an open bid on a card
router.post(
    '/open-bid',
    validateAuth,
    validateSchema(openBidSchema),
    async (
        req: Request<
            Record<string, never>,
            unknown,
            OpenBidRequestBody & AuthenticatedBody
        >,
        res: Response
    ) => {
        const {
            card_id,
            bid_amount,
            signature,
            order_hash,
            order_data,
            expiration_time,
            user
        } = req.body;

        const bid = await marketplaceService.createOpenBid({
            card_id,
            bidder_id: user.id,
            bid_type: 'open',
            bid_amount,
            signature,
            order_hash,
            order_data,
            expiration_time
        });

        res.status(201).json(bid);
    }
);

// Get open bids for a card
router.get('/cards/:cardId/open-bids', async (req, res) => {
    const { cardId } = req.params;
    if (isNaN(parseInt(cardId))) {
        throw new HttpError('Invalid card ID', 400);
    }

    const bids = await marketplaceService.getOpenBidsForCard(parseInt(cardId));
    res.status(200).json(bids);
});

// Get user's bids (both regular and open)
router.get('/users/:userId/bids', validateAuth, async (req, res) => {
    const { userId } = req.params;
    const bids = await marketplaceService.getAllUserBids(parseInt(userId));
    res.status(200).json(bids);
});

// Accept an open bid
router.post(
    '/open-bid/:bidId/accept',
    validateAuth,
    async (
        req: Request<
            Record<string, never>,
            unknown,
            { transaction_hash: string } & AuthenticatedBody
        >,
        res: Response
    ) => {
        const { bidId } = req.params;
        const { transaction_hash } = req.body;

        const result = await marketplaceService.acceptOpenBid({
            bid_id: parseInt(bidId),
            transaction_hash
        });

        res.status(200).json(result);
    }
);

export { router as marketplaceRouter };
