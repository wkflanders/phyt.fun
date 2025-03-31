import {
    db,
    and,
    or,
    eq,
    ne,
    gte,
    lte,
    desc,
    asc,
    gt,
    listings,
    bids,
    cards,
    card_metadata,
    users
} from '@phyt/database';
import {
    DatabaseError,
    GetListingProps,
    CreateListingProps,
    Listing,
    MarketListing,
    CreateListingBidProps,
    CompletePurchaseProps,
    CreateOpenBidProps,
    ListingBid,
    OpenBid,
    Order,
    OrderBook,
    UserBids,
    AcceptOpenBidProps,
    NotFoundError,
    MarketplaceError,
    BidStatusListed,
    BidStatusOpen,
    HttpError
} from '@phyt/types';

export const marketplaceService = {
    getListings: async (
        filters?: GetListingProps
    ): Promise<MarketListing[]> => {
        try {
            // Base conditions: active listings whose expiration_time is strictly after now.
            // We simulate ">" by using gte with a 1ms offset.
            let conditions = and(
                eq(listings.status, 'active'),
                gte(listings.expiration_time, new Date(Date.now() + 1))
            );

            // Add price conditions if provided.
            if (filters?.minPrice) {
                conditions = and(
                    conditions,
                    gte(listings.price, filters.minPrice)
                );
            }
            if (filters?.maxPrice) {
                conditions = and(
                    conditions,
                    lte(listings.price, filters.maxPrice)
                );
            }

            // Add rarity conditions if provided.
            if (filters?.rarity && filters.rarity.length > 0) {
                conditions = and(
                    conditions,
                    or(
                        ...filters.rarity.map((r) =>
                            eq(
                                card_metadata.rarity,
                                r as
                                    | 'bronze'
                                    | 'silver'
                                    | 'gold'
                                    | 'sapphire'
                                    | 'ruby'
                                    | 'opal'
                            )
                        )
                    )
                );
            }

            // Build query using ORM methods.
            const query = db
                .select({
                    listing: listings,
                    metadata: card_metadata,
                    seller: users,
                    card: cards
                })
                .from(listings)
                .innerJoin(cards, eq(listings.card_id, cards.id))
                .innerJoin(
                    card_metadata,
                    eq(cards.token_id, card_metadata.token_id)
                )
                .innerJoin(users, eq(listings.seller_id, users.id))
                .where(conditions);

            // Apply sorting
            const sortedQuery =
                // eslint-disable-next-line no-nested-ternary
                filters?.sort === 'price_asc'
                    ? query.orderBy(asc(listings.price))
                    : filters?.sort === 'price_desc'
                      ? query.orderBy(desc(listings.price))
                      : query.orderBy(desc(listings.created_at));

            const result = await sortedQuery;
            return result.map((item) => ({
                ...item,
                listing: {
                    ...item.listing,
                    highest_bid:
                        item.listing.highest_bid !== null
                            ? String(item.listing.highest_bid)
                            : null,
                    order_data: item.listing.order_data as Order
                }
            }));
        } catch (error) {
            console.error('Marketplace error in getListings:', error);
            throw new MarketplaceError('Failed to fetch listings');
        }
    },

    createListing: async ({
        card_id,
        seller_id,
        price,
        signature,
        order_data,
        order_hash,
        expiration_time
    }: CreateListingProps): Promise<Listing> => {
        try {
            // Verify card ownership
            const cardQuery = db
                .select()
                .from(cards)
                .where(
                    and(eq(cards.id, card_id), eq(cards.owner_id, seller_id))
                );

            const cardResult = await cardQuery;

            if (!cardResult.length) {
                throw new MarketplaceError('Card not owned by seller');
            }
            const insertResult = await db
                .insert(listings)
                .values({
                    card_id: card_id,
                    seller_id: seller_id,
                    price,
                    signature,
                    order_hash,
                    order_data,
                    expiration_time: new Date(expiration_time),
                    status: 'active',
                    transaction_hash: '' // default value since listing isn't completed
                })
                .returning();

            // Convert highest_bid from decimal to string
            const result = insertResult[0];
            return {
                ...result,
                highest_bid:
                    result.highest_bid !== null
                        ? String(result.highest_bid)
                        : null,
                order_data: result.order_data as Order
            };
        } catch (error) {
            console.error('Marketplace error in createListing:', error);
            throw new MarketplaceError('Failed to create listing');
        }
    },

    createBid: async ({
        listing_id,
        bidder_id,
        bid_amount,
        signature,
        order_hash,
        order_data
    }: CreateListingBidProps): Promise<ListingBid> => {
        try {
            return await db.transaction(async (tx) => {
                const listing = await tx
                    .select()
                    .from(listings)
                    .where(
                        and(
                            eq(listings.id, listing_id),
                            eq(listings.status, 'active')
                        )
                    )
                    .limit(1);
                if (!listing.length) {
                    throw new NotFoundError('Listing not found or not active');
                }

                const bidListing = listing[0];

                if (
                    bidListing.highest_bid &&
                    BigInt(bid_amount) <= BigInt(bidListing.highest_bid)
                ) {
                    throw new MarketplaceError(
                        'Bid must be higher than current highest bid'
                    );
                }

                if (
                    listing[0].highest_bid &&
                    BigInt(bid_amount) >= BigInt(bidListing.price)
                ) {
                    await marketplaceService.completePurchase({
                        listing_id,
                        buyer_id: bidder_id,
                        transaction_hash: ''
                    });
                }

                const [bid] = await tx
                    .insert(bids)
                    .values({
                        listing_id: listing_id,
                        card_id: bidListing.card_id,
                        bidder_id: bidder_id,
                        price: bidListing.price,
                        bid_amount,
                        signature,
                        order_hash: order_hash,
                        order_data: order_data,
                        bid_type: 'listing',
                        status: 'active',
                        expiration_time: bidListing.expiration_time,
                        accepted_at: null
                    })
                    .returning();

                await tx
                    .update(listings)
                    .set({
                        highest_bid: bid_amount,
                        highest_bidder_id: bidder_id
                    })
                    .where(eq(listings.id, listing_id));

                return {
                    ...bid,
                    bid_type: 'listing' as const,
                    bid_status: bid.status as BidStatusListed | 'withdrawn',
                    listing_id: bid.listing_id ?? listing_id,
                    order_data: bid.order_data as Order
                };
            });
        } catch (error) {
            console.error('Error in createBid:', error);
            throw new MarketplaceError('Failed to create bid');
        }
    },

    completePurchase: async ({
        listing_id,
        buyer_id,
        transaction_hash
    }: CompletePurchaseProps): Promise<Listing> => {
        try {
            return await db.transaction(async (tx) => {
                const listingResults = await tx
                    .select()
                    .from(listings)
                    .where(
                        and(
                            eq(listings.id, listing_id),
                            eq(listings.status, 'active')
                        )
                    );

                if (!listingResults.length) {
                    throw new Error('Listing not found or not active');
                }

                const [updatedListing] = await tx
                    .update(listings)
                    .set({
                        status: 'active',
                        buyer_id: buyer_id,
                        transaction_hash: transaction_hash
                    })
                    .where(eq(listings.id, listing_id))
                    .returning();

                await tx
                    .update(cards)
                    .set({
                        owner_id: buyer_id,
                        acquisition_type: 'marketplace'
                    })
                    .where(eq(cards.id, listings.card_id));

                return {
                    ...updatedListing,
                    order_data: updatedListing.order_data as Order
                };
            });
        } catch (error) {
            console.error('Error in completePurchase:', error);
            throw new MarketplaceError('Failed to complete purchase');
        }
    },

    createOpenBid: async ({
        card_id,
        bidder_id,
        bid_amount,
        signature,
        order_hash,
        order_data,
        expiration_time
    }: CreateOpenBidProps): Promise<OpenBid> => {
        try {
            const cardQuery = db
                .select({
                    card: cards,
                    activeListing: {
                        id: listings.id
                    }
                })
                .from(cards)
                .leftJoin(
                    listings,
                    and(
                        eq(listings.card_id, cards.id),
                        eq(listings.status, 'active')
                    )
                )
                .where(eq(cards.id, card_id));

            const cardResult = await cardQuery;

            if (!cardResult.length) {
                throw new NotFoundError('Card not found');
            }

            if (cardResult[0].activeListing?.id) {
                throw new MarketplaceError('Card is currently listed for sale');
            }

            const insertResult = await db
                .insert(bids)
                .values({
                    card_id: card_id,
                    bidder_id: bidder_id,
                    price: bid_amount,
                    bid_amount,
                    signature,
                    order_hash: order_hash,
                    order_data: order_data,
                    bid_type: 'open',
                    status: 'active',
                    expiration_time: expiration_time,
                    accepted_at: null
                })
                .returning();

            if (!insertResult.length) {
                throw new DatabaseError('Making open bid failed');
            }

            const bid = insertResult[0];

            return {
                ...bid,
                bid_type: 'open' as const,
                bid_status: bid.status as BidStatusOpen | 'withdrawn',
                listing_id: null,
                order_data: bid.order_data as Order
            };
        } catch (error) {
            console.error('Error in createOpenBid:', error);
            throw new MarketplaceError('Failed to create open bid');
        }
    },

    getOpenBidsForCard: async (cardId: number): Promise<OrderBook> => {
        try {
            const bidsData = await db
                .select({
                    bid: bids,
                    bidder: users
                })
                .from(bids)
                .innerJoin(users, eq(bids.bidder_id, users.id))
                .where(
                    and(
                        eq(bids.card_id, cardId),
                        eq(bids.bid_type, 'open'),
                        eq(bids.status, 'active'),
                        gt(bids.expiration_time, new Date())
                    )
                )
                .orderBy(desc(bids.price));

            return {
                bid: bidsData.map((item) => ({
                    ...item.bid,
                    order_data: item.bid.order_data as Order
                })),
                bidder: bidsData.map((item) => item.bidder)
            };
        } catch (error) {
            console.error('Error in getOpenBidsForCard:', error);
            throw new MarketplaceError('Failed to fetch open bids');
        }
    },

    getAllUserBids: async (userId: number): Promise<UserBids[]> => {
        try {
            const results = await db
                .select({
                    bid: bids,
                    card: cards,
                    metadata: card_metadata,
                    listing: {
                        id: listings.id,
                        price: listings.price,
                        expiration_time: listings.expiration_time
                    },
                    owner: {
                        id: users.id,
                        wallet_address: users.wallet_address,
                        username: users.username,
                        avatar_url: users.avatar_url
                    }
                })
                .from(bids)
                .innerJoin(cards, eq(bids.card_id, cards.id))
                .leftJoin(listings, eq(bids.listing_id, listings.id))
                .innerJoin(
                    card_metadata,
                    eq(cards.token_id, card_metadata.token_id)
                )
                .innerJoin(users, eq(cards.owner_id, users.id))
                .where(
                    and(
                        eq(bids.bidder_id, userId),
                        // eq(bids.status, 'active'),
                        gt(bids.expiration_time, new Date())
                    )
                )
                .orderBy(desc(bids.created_at));

            return results.map((result) => ({
                ...result,
                bid: {
                    ...result.bid,
                    order_data: result.bid.order_data as Order
                }
            }));
        } catch (error) {
            console.error('Error in getAllUserBids:', error);
            throw new HttpError('Failed to fetch user bids');
        }
    },

    acceptOpenBid: async ({
        bid_id,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        transaction_hash
    }: AcceptOpenBidProps): Promise<OpenBid> => {
        try {
            return await db.transaction(async (tx) => {
                const bidResults = await tx
                    .select()
                    .from(bids)
                    .where(
                        and(
                            eq(bids.id, bid_id),
                            eq(bids.status, 'active'),
                            eq(bids.bid_type, 'open')
                        )
                    );

                if (!bidResults.length) {
                    throw new Error('Open bid not found or not active');
                }

                const bid = bidResults[0];

                const updatedBidResults = await tx
                    .update(bids)
                    .set({
                        status: 'filled',
                        accepted_at: new Date()
                    })
                    .where(eq(bids.id, bid_id))
                    .returning();

                await tx
                    .update(cards)
                    .set({
                        owner_id: bid.bidder_id,
                        acquisition_type: 'marketplace'
                    })
                    .where(eq(cards.id, bid.card_id));

                // Cancel other open bids for this card
                await tx
                    .update(bids)
                    .set({ status: 'withdrawn' })
                    .where(
                        and(
                            eq(bids.card_id, bid.card_id),
                            eq(bids.status, 'active'),
                            eq(bids.bid_type, 'open'),
                            ne(bids.id, bid_id)
                        )
                    );

                const updatedBid = updatedBidResults[0];
                return {
                    ...updatedBid,
                    bid_type: 'open' as const,
                    bid_status: updatedBid.status as
                        | BidStatusOpen
                        | 'withdrawn',
                    listing_id: updatedBid.listing_id,
                    order_data: updatedBid.order_data as Order
                };
            });
        } catch (error) {
            console.error('Database error in acceptOpenBid:', error);
            throw new DatabaseError('Failed to accept open bid');
        }
    }
};
