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
    cardMetadata,
    users
} from '@phyt/database';
import {
    UUIDv7,
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
    BidStatusOpen
} from '@phyt/types';

// helper to convert BigInt fields to string for JSONB
function serializeOrder(order: Order): Record<string, unknown> {
    return {
        trader: order.trader,
        side: order.side,
        collection: order.collection,
        tokenId: order.tokenId.toString(),
        paymentToken: order.paymentToken,
        price: order.price.toString(),
        expirationTime: order.expirationTime.toString(),
        merkleRoot: order.merkleRoot,
        salt: order.salt.toString()
    };
}

// helper to reconstruct Order from JSONB
function deserializeOrder(raw: Record<string, unknown>): Order {
    return {
        trader: raw.trader as `0x${string}`,
        side: raw.side as 'buy' | 'sell',
        collection: raw.collection as `0x${string}`,
        tokenId: BigInt(String(raw.tokenId)),
        paymentToken: raw.paymentToken as `0x${string}`,
        price: BigInt(String(raw.price)),
        expirationTime: BigInt(String(raw.expirationTime)),
        merkleRoot: raw.merkleRoot as `0x${string}`,
        salt: BigInt(String(raw.salt))
    };
}

export const marketplaceService = {
    getListings: async (
        filters?: GetListingProps
    ): Promise<MarketListing[]> => {
        try {
            // Base conditions: active listings whose expirationTime is strictly after now.
            // We simulate ">" by using gte with a 1ms offset.
            let conditions = and(
                eq(listings.status, 'active'),
                gte(listings.expirationTime, new Date(Date.now() + 1))
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
                                cardMetadata.rarity,
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
                    metadata: cardMetadata,
                    seller: users,
                    card: cards
                })
                .from(listings)
                .innerJoin(cards, eq(listings.cardId, cards.id))
                .innerJoin(
                    cardMetadata,
                    eq(cards.tokenId, cardMetadata.tokenId)
                )
                .innerJoin(users, eq(listings.sellerId, users.id))
                .where(conditions);

            // Apply sorting
            const sortedQuery =
                filters?.sort === 'priceAsc'
                    ? query.orderBy(asc(listings.price))
                    : filters?.sort === 'priceDesc'
                      ? query.orderBy(desc(listings.price))
                      : query.orderBy(desc(listings.createdAt));

            const result = await sortedQuery;
            return result.map((item) => ({
                ...item,
                listing: {
                    ...item.listing,
                    id: item.listing.id as UUIDv7,
                    buyerId: item.listing.buyerId as UUIDv7 | null,
                    sellerId: item.listing.sellerId as UUIDv7,
                    cardId: item.listing.cardId as UUIDv7,
                    highestBidderId: item.listing
                        .highestBidderId as UUIDv7 | null,
                    highestBid:
                        item.listing.highestBid !== null
                            ? String(item.listing.highestBid)
                            : null,
                    orderData: deserializeOrder(
                        item.listing.orderData as Record<string, unknown>
                    )
                },
                seller: {
                    ...item.seller,
                    id: item.seller.id as UUIDv7
                },
                card: {
                    ...item.card,
                    id: item.card.id as UUIDv7,
                    ownerId: item.card.ownerId as UUIDv7,
                    packPurchaseId: item.card.packPurchaseId as UUIDv7 | null
                },
                metadata: {
                    ...item.metadata,
                    runnerId: item.metadata.runnerId as UUIDv7
                }
            }));
        } catch (error) {
            console.error('Marketplace error in getListings:', error);
            throw new MarketplaceError('Failed to fetch listings');
        }
    },

    createListing: async ({
        cardId,
        sellerId,
        price,
        signature,
        orderData,
        orderHash,
        expirationTime
    }: CreateListingProps): Promise<Listing> => {
        try {
            // Verify card ownership
            const cardQuery = db
                .select()
                .from(cards)
                .where(and(eq(cards.id, cardId), eq(cards.ownerId, sellerId)));

            const cardResult = await cardQuery;

            if (!cardResult.length) {
                throw new MarketplaceError('Card not owned by seller');
            }
            const insertResult = await db
                .insert(listings)
                .values({
                    cardId: cardId,
                    sellerId: sellerId,
                    price,
                    signature,
                    orderHash,
                    orderData: serializeOrder(orderData),
                    expirationTime: new Date(expirationTime),
                    status: 'active',
                    transactionHash: '' // default value since listing isn't completed
                })
                .returning();

            // Convert highest_bid from decimal to string
            const result = insertResult[0];
            return {
                ...result,
                id: result.id as UUIDv7,
                cardId: result.cardId as UUIDv7,
                sellerId: result.sellerId as UUIDv7,
                buyerId: result.buyerId as UUIDv7 | null,
                highestBidderId: result.highestBidderId as UUIDv7 | null,
                highestBid:
                    result.highestBid !== null
                        ? String(result.highestBid)
                        : null,
                orderData: deserializeOrder(
                    result.orderData as Record<string, unknown>
                )
            };
        } catch (error) {
            console.error('Marketplace error in createListing:', error);
            throw new MarketplaceError('Failed to create listing');
        }
    },

    createBid: async ({
        listingId,
        bidderId,
        bidAmount,
        signature,
        orderHash,
        orderData
    }: CreateListingBidProps): Promise<ListingBid> => {
        try {
            return await db.transaction(async (tx) => {
                const listing = await tx
                    .select()
                    .from(listings)
                    .where(
                        and(
                            eq(listings.id, listingId),
                            eq(listings.status, 'active')
                        )
                    )
                    .limit(1);
                if (!listing.length) {
                    throw new NotFoundError('Listing not found or not active');
                }

                const bidListing = listing[0];

                if (
                    bidListing.highestBid &&
                    BigInt(bidAmount) <= BigInt(bidListing.highestBid)
                ) {
                    throw new MarketplaceError(
                        'Bid must be higher than current highest bid'
                    );
                }

                if (
                    listing[0].highestBid &&
                    BigInt(bidAmount) >= BigInt(bidListing.price)
                ) {
                    await marketplaceService.completePurchase({
                        listingId,
                        buyerId: bidderId,
                        transactionHash: ''
                    });
                }

                const [bid] = await tx
                    .insert(bids)
                    .values({
                        listingId: listingId,
                        cardId: bidListing.cardId,
                        bidderId: bidderId,
                        price: bidListing.price,
                        bidAmount,
                        signature,
                        orderHash: orderHash,
                        orderData: serializeOrder(orderData),
                        bidType: 'listing',
                        status: 'active',
                        expirationTime: bidListing.expirationTime,
                        acceptedAt: null
                    })
                    .returning();

                await tx
                    .update(listings)
                    .set({
                        highestBid: bidAmount,
                        highestBidderId: bidderId
                    })
                    .where(eq(listings.id, listingId));

                return {
                    ...bid,
                    id: bid.id as UUIDv7,
                    bidType: 'listing' as const,
                    bidStatus: bid.status as BidStatusListed | 'withdrawn',
                    listingId: (bid.listingId ?? listingId) as UUIDv7,
                    bidderId: bid.bidderId as UUIDv7,
                    cardId: bid.cardId as UUIDv7,
                    orderData: deserializeOrder(
                        bid.orderData as Record<string, unknown>
                    )
                };
            });
        } catch (error) {
            console.error('Error in createBid:', error);
            throw new MarketplaceError('Failed to create bid');
        }
    },

    completePurchase: async ({
        listingId,
        buyerId,
        transactionHash
    }: CompletePurchaseProps): Promise<Listing> => {
        try {
            return await db.transaction(async (tx) => {
                const listingResults = await tx
                    .select()
                    .from(listings)
                    .where(
                        and(
                            eq(listings.id, listingId),
                            eq(listings.status, 'active')
                        )
                    );

                if (!listingResults.length) {
                    throw new NotFoundError('Listing not found or not active');
                }

                const [updatedListing] = await tx
                    .update(listings)
                    .set({
                        status: 'active',
                        buyerId: buyerId,
                        transactionHash: transactionHash
                    })
                    .where(eq(listings.id, listingId))
                    .returning();

                await tx
                    .update(cards)
                    .set({
                        ownerId: buyerId,
                        acquisitionType: 'marketplace'
                    })
                    .where(eq(cards.id, listings.cardId));

                return {
                    ...updatedListing,
                    id: updatedListing.id as UUIDv7,
                    buyerId: updatedListing.buyerId as UUIDv7 | null,
                    sellerId: updatedListing.sellerId as UUIDv7,
                    cardId: updatedListing.cardId as UUIDv7,
                    highestBidderId:
                        updatedListing.highestBidderId as UUIDv7 | null,
                    higestBid:
                        updatedListing.highestBid !== null
                            ? String(updatedListing.highestBid)
                            : null,
                    orderData: deserializeOrder(
                        updatedListing.orderData as Record<string, unknown>
                    )
                };
            });
        } catch (error) {
            console.error('Error in completePurchase:', error);
            throw new MarketplaceError('Failed to complete purchase');
        }
    },

    createOpenBid: async ({
        cardId,
        bidderId,
        bidAmount,
        signature,
        orderHash,
        orderData,
        expirationTime
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
                        eq(listings.cardId, cards.id),
                        eq(listings.status, 'active')
                    )
                )
                .where(eq(cards.id, cardId));

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
                    cardId: cardId,
                    bidderId: bidderId,
                    price: bidAmount,
                    bidAmount,
                    signature,
                    orderHash: orderHash,
                    orderData: serializeOrder(orderData),
                    bidType: 'open',
                    status: 'active',
                    expirationTime: expirationTime,
                    acceptedAt: null
                })
                .returning();

            if (!insertResult.length) {
                throw new DatabaseError('Making open bid failed');
            }

            const bid = insertResult[0];

            return {
                ...bid,
                id: bid.id as UUIDv7,
                bidderId: bid.bidderId as UUIDv7,
                bidType: 'open' as const,
                bidStatus: bid.status as BidStatusOpen | 'withdrawn',
                cardId: bid.cardId as UUIDv7,
                listing_id: null,
                orderData: deserializeOrder(
                    bid.orderData as Record<string, unknown>
                )
            };
        } catch (error) {
            console.error('Error in createOpenBid:', error);
            throw new MarketplaceError('Failed to create open bid');
        }
    },

    getOpenBidsForCard: async (cardId: UUIDv7): Promise<OrderBook> => {
        try {
            const bidsData = await db
                .select({
                    bid: bids,
                    bidder: users
                })
                .from(bids)
                .innerJoin(users, eq(bids.bidderId, users.id))
                .where(
                    and(
                        eq(bids.cardId, cardId),
                        eq(bids.bidType, 'open'),
                        eq(bids.status, 'active'),
                        gt(bids.expirationTime, new Date())
                    )
                )
                .orderBy(desc(bids.price));

            return {
                bid: bidsData.map((item) => ({
                    ...item.bid,
                    id: item.bid.id as UUIDv7,
                    listingId: item.bid.listingId as UUIDv7,
                    cardId: item.bid.cardId as UUIDv7,
                    bidderId: item.bid.bidderId as UUIDv7,
                    orderData: deserializeOrder(
                        item.bid.orderData as Record<string, unknown>
                    )
                })),
                bidder: bidsData.map((item) => ({
                    ...item.bidder,
                    id: item.bidder.id as UUIDv7
                }))
            };
        } catch (error) {
            console.error('Error in getOpenBidsForCard:', error);
            throw new MarketplaceError('Failed to fetch open bids');
        }
    },

    getAllUserBids: async (userId: UUIDv7): Promise<UserBids[]> => {
        try {
            const results = await db
                .select({
                    bid: bids,
                    card: cards,
                    metadata: cardMetadata,
                    listing: {
                        id: listings.id,
                        price: listings.price,
                        expirationTime: listings.expirationTime
                    },
                    owner: {
                        id: users.id,
                        walletAddress: users.walletAddress,
                        username: users.username,
                        avatarUrl: users.avatarUrl
                    }
                })
                .from(bids)
                .innerJoin(cards, eq(bids.cardId, cards.id))
                .leftJoin(listings, eq(bids.listingId, listings.id))
                .innerJoin(
                    cardMetadata,
                    eq(cards.tokenId, cardMetadata.tokenId)
                )
                .innerJoin(users, eq(cards.ownerId, users.id))
                .where(
                    and(
                        eq(bids.bidderId, userId),
                        // eq(bids.status, 'active'),
                        gt(bids.expirationTime, new Date())
                    )
                )
                .orderBy(desc(bids.createdAt));

            return results.map((result) => ({
                ...result,
                bid: {
                    ...result.bid,
                    id: result.bid.id as UUIDv7,
                    listingId: result.bid.listingId as UUIDv7,
                    cardId: result.bid.cardId as UUIDv7,
                    bidderId: result.bid.bidderId as UUIDv7,
                    orderData: deserializeOrder(
                        result.bid.orderData as Record<string, unknown>
                    )
                },
                card: {
                    ...result.card,
                    id: result.card.id as UUIDv7,
                    ownerId: result.card.ownerId as UUIDv7,
                    packPurchaseId: result.card.packPurchaseId as UUIDv7 | null
                },
                metadata: {
                    ...result.metadata,
                    runnerId: result.metadata.runnerId as UUIDv7
                },
                listing: result.listing
                    ? {
                          ...result.listing,
                          id: result.listing.id as UUIDv7
                      }
                    : null,
                owner: {
                    ...result.owner,
                    id: result.owner.id as UUIDv7
                }
            }));
        } catch (error) {
            console.error('Error in getAllUserBids:', error);
            throw new MarketplaceError('Failed to fetch user bids');
        }
    },

    acceptOpenBid: async ({
        bidId,
        transactionHash
    }: AcceptOpenBidProps): Promise<OpenBid> => {
        try {
            return await db.transaction(async (tx) => {
                const bidResults = await tx
                    .select()
                    .from(bids)
                    .where(
                        and(
                            eq(bids.id, bidId),
                            eq(bids.status, 'active'),
                            eq(bids.bidType, 'open')
                        )
                    );

                if (!bidResults.length) {
                    throw new NotFoundError('Open bid not found or not active');
                }

                const bid = bidResults[0];

                const updatedBidResults = await tx
                    .update(bids)
                    .set({
                        status: 'filled',
                        acceptedAt: new Date()
                    })
                    .where(eq(bids.id, bidId))
                    .returning();

                await tx
                    .update(cards)
                    .set({
                        ownerId: bid.bidderId,
                        acquisitionType: 'marketplace'
                    })
                    .where(eq(cards.id, bid.cardId));

                // Cancel other open bids for this card
                await tx
                    .update(bids)
                    .set({ status: 'withdrawn' })
                    .where(
                        and(
                            eq(bids.cardId, bid.cardId),
                            eq(bids.status, 'active'),
                            eq(bids.bidType, 'open'),
                            ne(bids.id, bidId)
                        )
                    );

                const updatedBid = updatedBidResults[0];
                return {
                    ...updatedBid,
                    id: updatedBid.id as UUIDv7,
                    cardId: updatedBid.cardId as UUIDv7,
                    bidderId: updatedBid.bidderId as UUIDv7,
                    bidType: 'open' as const,
                    bidStatus: updatedBid.status as BidStatusOpen | 'withdrawn',
                    listingId: updatedBid.listingId as UUIDv7 | null,
                    orderData: deserializeOrder(
                        updatedBid.orderData as Record<string, unknown>
                    )
                };
            });
        } catch (error) {
            console.error('Error in acceptOpenBid:', error);
            throw new MarketplaceError('Failed to accept open bid');
        }
    }
};
