import {
    UUIDv7,
    CreateListingRequestBody,
    ListedBidRequestBody,
    OrderBook,
    UserBids,
    OpenBidRequestBody,
    MarketListing,
    OpenBid,
    Listing,
    ListingBid,
    ValidationError
} from '@phyt/types';
import express, { Request, Router, Response } from 'express';

import { toStringValue } from '@/lib/utils.js';
import { openBidSchema, bidSchema, listingSchema } from '@/lib/validation.js';
import { validateAuth } from '@/middleware/auth.js';
import { validateSchema } from '@/middleware/validator.js';
import { marketplaceService } from '@/services/marketplaceServices.js';

const router: Router = express.Router();

router.use(validateAuth);

router.get(
    '/listings',
    async (
        req: Request<
            Record<string, never>, // req params
            MarketListing[], // ressponse body
            Record<string, never>, // req body
            {
                minPrice?: string | string[];
                maxPrice?: string | string[]; // req query
                rarity?: string | string[];
                sort?: string | string[];
            }
        >,
        res: Response<MarketListing[]>
    ) => {
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
            | 'priceAsc'
            | 'priceDesc'
            | 'createdAt'
            | undefined;

        const listings = await marketplaceService.getListings({
            minPrice: minPriceStr,
            maxPrice: maxPriceStr,
            rarity: rarityArray,
            sort: sortStr
        });

        res.status(200).json(listings);
    }
);

// Create a new listing
router.post(
    '/listing',
    validateSchema(listingSchema),
    async (
        req: Request<Record<string, never>, Listing, CreateListingRequestBody>,
        res: Response<Listing>
    ) => {
        // if (!req.auth) {
        //     throw new HttpError('Authentication data missing', 401);
        // }
        const { cardId, price, signature, orderHash, orderData, user } =
            req.body;
        const listing = await marketplaceService.createListing({
            cardId,
            sellerId: user.id,
            price,
            signature,
            orderData,
            orderHash,
            expirationTime: String(orderData.expirationTime)
        });
        res.status(201).json(listing);
    }
);

// Place a bid on a listing
router.post(
    '/bid',
    validateSchema(bidSchema),
    async (
        req: Request<Record<string, never>, ListingBid, ListedBidRequestBody>,
        res: Response<ListingBid>
    ) => {
        // if (!req.auth) {
        //     throw new HttpError('Authentication data missing', 401);
        // }
        const { listingId, bidAmount, signature, orderHash, orderData, user } =
            req.body;

        const bid = await marketplaceService.createBid({
            listingId,
            bidderId: user.id,
            signature,
            orderHash,
            orderData,
            bidType: 'listing',
            bidAmount
        });

        res.status(201).json(bid);
    }
);

// Place an open bid on a card
router.post(
    '/open-bid',
    validateSchema(openBidSchema),
    async (
        req: Request<Record<string, never>, OpenBid, OpenBidRequestBody>,
        res: Response<OpenBid>
    ) => {
        // if (!req.auth) {
        //     throw new HttpError('Authentication data missing', 401);
        // }
        const {
            cardId,
            bidAmount,
            signature,
            orderHash,
            orderData,
            expirationTime,
            user
        } = req.body;

        const bid = await marketplaceService.createOpenBid({
            cardId,
            bidderId: user.id,
            bidType: 'open',
            bidAmount,
            signature,
            orderHash,
            orderData,
            expirationTime
        });

        res.status(201).json(bid);
    }
);

// Get open bids for a card
router.get(
    '/cards/:cardId/open-bids',
    async (
        req: Request<{ cardId: UUIDv7 }, OrderBook>,
        res: Response<OrderBook>
    ) => {
        const { cardId } = req.params;
        if (isNaN(parseInt(cardId))) {
            throw new ValidationError('Invalid card ID');
        }

        const bids = await marketplaceService.getOpenBidsForCard(cardId);
        res.status(200).json(bids);
    }
);

// Get user's bids (both regular and open)
router.get(
    '/users/:userId/bids',
    async (
        req: Request<{ userId: UUIDv7 }, UserBids[]>,
        res: Response<UserBids[]>
    ) => {
        const { userId } = req.params;
        const bids = await marketplaceService.getAllUserBids(userId);
        res.status(200).json(bids);
    }
);

// Accept an open bid
router.post(
    '/open-bid/:bidId/accept',
    async (
        req: Request<{ bidId: UUIDv7 }, OpenBid, { transactionHash: string }>,
        res: Response<OpenBid>
    ) => {
        const { bidId } = req.params;
        const { transactionHash } = req.body;

        const result = await marketplaceService.acceptOpenBid({
            bidId: bidId,
            transactionHash
        });

        res.status(200).json(result);
    }
);

export { router as marketplaceRouter };
