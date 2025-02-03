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
    gt
} from '@phyt/database';
import { listings, bids, cards, card_metadata, users } from '@phyt/database';
import { DatabaseError, NotFoundError } from '@phyt/types';
import type { Order } from '@phyt/types';

interface ListingFilters {
    minPrice?: string;
    maxPrice?: string;
    rarity?: string[];
    sort?: 'price_asc' | 'price_desc' | 'created_at';
}

export const marketplaceService = {
    getListings: async (filters?: ListingFilters) => {
        try {
            // Base conditions: active listings whose expiration_time is strictly after now.
            // We simulate ">" by using gte with a 1ms offset.
            let conditions = and(
                eq(listings.status, 'active'),
                gte(listings.expiration_time, new Date(Date.now() + 1))
            );

            // Add price conditions if provided.
            if (filters?.minPrice) {
                conditions = and(conditions, gte(listings.price, filters.minPrice));
            }
            if (filters?.maxPrice) {
                conditions = and(conditions, lte(listings.price, filters.maxPrice));
            }

            // Add rarity conditions if provided.
            if (filters?.rarity && filters.rarity.length > 0) {
                conditions = and(
                    conditions,
                    or(
                        ...filters.rarity.map(r =>
                            eq(card_metadata.rarity, r as 'bronze' | 'silver' | 'gold' | 'sapphire' | 'ruby' | 'opal')
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
                .innerJoin(card_metadata, eq(cards.token_id, card_metadata.token_id))
                .innerJoin(users, eq(listings.seller_id, users.id))
                .where(conditions);

            // Apply sorting
            const sortedQuery = filters?.sort === 'price_asc'
                ? query.orderBy(asc(listings.price))
                : filters?.sort === 'price_desc'
                    ? query.orderBy(desc(listings.price))
                    : query.orderBy(desc(listings.created_at));

            return await sortedQuery;
        } catch (error) {
            console.error('Database error in getListings:', error);
            throw new DatabaseError('Failed to fetch listings');
        }
    },

    createListing: async ({
        cardId,
        sellerId,
        price,
        signature,
        orderHash,
        orderData,
        expirationTime
    }: {
        cardId: number;
        sellerId: number;
        price: string;
        signature: string;
        orderHash: string;
        orderData: Order;
        expirationTime: string;
    }) => {
        try {
            // Verify card ownership
            const cardQuery = db
                .select()
                .from(cards)
                .where(and(
                    eq(cards.id, cardId),
                    eq(cards.owner_id, sellerId)
                ));

            const cardResult = await cardQuery;

            if (!cardResult.length) {
                throw new Error('Card not owned by seller');
            }
            console.log(expirationTime);
            const insertResult = await db
                .insert(listings)
                .values({
                    card_id: cardId,
                    seller_id: sellerId,
                    price,
                    signature,
                    order_hash: orderHash,
                    order_data: orderData,
                    expiration_time: new Date(expirationTime),
                    status: 'active'
                })
                .returning();

            return insertResult[0];
        } catch (error) {
            console.error('Database error in createListing:', error);
            throw new DatabaseError('Failed to create listing');
        }
    },

    createBid: async ({
        listingId,
        bidderId,
        price,
        signature,
        orderHash,
        orderData
    }: {
        listingId: number;
        bidderId: number;
        price: string;
        signature: string;
        orderHash: string;
        orderData: Order;
    }) => {
        try {
            return await db.transaction(async (tx) => {
                const listing = await tx
                    .select()
                    .from(listings)
                    .where(and(
                        eq(listings.id, listingId),
                        eq(listings.status, 'active')
                    ))
                    .limit(1);

                if (!listing.length) {
                    throw new Error('Listing not found or not active');
                }

                if (listing[0].highest_bid && BigInt(price) <= BigInt(listing[0].highest_bid)) {
                    throw new Error('Bid must be higher than current highest bid');
                }

                const [bid] = await tx
                    .insert(bids)
                    .values({
                        listing_id: listingId,
                        card_id: listing[0].card_id,
                        bidder_id: bidderId,
                        price,
                        signature,
                        order_hash: orderHash,
                        order_data: orderData,
                        bid_type: 'listing',
                        status: 'active',
                        expiration_time: listing[0].expiration_time
                    })
                    .returning();

                await tx
                    .update(listings)
                    .set({
                        highest_bid: price,
                        highest_bidder_id: bidderId
                    })
                    .where(eq(listings.id, listingId));

                return bid;
            });
        } catch (error) {
            console.error('Database error in createBid:', error);
            throw new DatabaseError('Failed to create bid');
        }
    },

    completePurchase: async ({
        listingId,
        buyerId,
        transactionHash
    }: {
        listingId: number;
        buyerId: number;
        transactionHash: string;
    }) => {
        try {
            return await db.transaction(async (tx) => {
                const [listing] = await tx
                    .select()
                    .from(listings)
                    .where(and(
                        eq(listings.id, listingId),
                        eq(listings.status, 'active')
                    ));

                if (!listing) {
                    throw new Error('Listing not found or not active');
                }

                const [updatedListing] = await tx
                    .update(listings)
                    .set({
                        status: 'completed',
                        buyer_id: buyerId,
                        transaction_hash: transactionHash
                    })
                    .where(eq(listings.id, listingId))
                    .returning();

                await tx
                    .update(cards)
                    .set({
                        owner_id: buyerId,
                        acquisition_type: 'marketplace'
                    })
                    .where(eq(cards.id, listing.card_id));

                return updatedListing;
            });
        } catch (error) {
            console.error('Database error in completePurchase:', error);
            throw new DatabaseError('Failed to complete purchase');
        }
    },

    createOpenBid: async ({
        cardId,
        bidderId,
        price,
        signature,
        orderHash,
        orderData,
        expirationTime
    }: {
        cardId: number;
        bidderId: number;
        price: string;
        signature: string;
        orderHash: string;
        orderData: Order;
        expirationTime: Date;
    }) => {
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
                .where(eq(cards.id, cardId));

            const cardResult = await cardQuery;

            if (!cardResult.length) {
                throw new Error('Card not found');
            }

            if (cardResult[0].activeListing?.id) {
                throw new Error('Card is currently listed for sale');
            }

            const insertResult = await db
                .insert(bids)
                .values({
                    card_id: cardId,
                    bidder_id: bidderId,
                    price,
                    signature,
                    order_hash: orderHash,
                    order_data: orderData,
                    bid_type: 'open',
                    status: 'active',
                    expiration_time: expirationTime
                })
                .returning();

            return insertResult[0];
        } catch (error) {
            console.error('Database error in createOpenBid:', error);
            throw new DatabaseError('Failed to create open bid');
        }
    },

    getOpenBidsForCard: async (cardId: number) => {
        try {
            return await db
                .select({
                    bid: bids,
                    bidder: users
                })
                .from(bids)
                .innerJoin(users, eq(bids.bidder_id, users.id))
                .where(and(
                    eq(bids.card_id, cardId),
                    eq(bids.bid_type, 'open'),
                    eq(bids.status, 'active'),
                    gt(bids.expiration_time, new Date())
                ))
                .orderBy(desc(bids.price));
        } catch (error) {
            console.error('Database error in getOpenBidsForCard:', error);
            throw new DatabaseError('Failed to fetch open bids');
        }
    },

    getAllUserBids: async (userId: number) => {
        try {
            return await db
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
                        username: users.username,
                        avatar_url: users.avatar_url
                    }
                })
                .from(bids)
                .innerJoin(cards, eq(bids.card_id, cards.id))
                .leftJoin(listings, eq(bids.listing_id, listings.id))
                .innerJoin(card_metadata, eq(cards.token_id, card_metadata.token_id))
                .innerJoin(users, eq(cards.owner_id, users.id))
                .where(and(
                    eq(bids.bidder_id, userId),
                    eq(bids.status, 'active'),
                    gt(bids.expiration_time, new Date())
                ))
                .orderBy(desc(bids.created_at));
        } catch (error) {
            console.error('Database error in getAllUserBids:', error);
            throw new DatabaseError('Failed to fetch user bids');
        }
    },

    acceptOpenBid: async ({
        bidId,
        transactionHash
    }: {
        bidId: number;
        transactionHash: string;
    }) => {
        try {
            return await db.transaction(async (tx) => {
                const [bid] = await tx
                    .select()
                    .from(bids)
                    .where(and(
                        eq(bids.id, bidId),
                        eq(bids.status, 'active'),
                        eq(bids.bid_type, 'open')
                    ));

                if (!bid) {
                    throw new Error('Open bid not found or not active');
                }

                const updatedBid = await tx
                    .update(bids)
                    .set({
                        status: 'accepted',
                        accepted_at: new Date()
                    })
                    .where(eq(bids.id, bidId))
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
                    .set({ status: 'cancelled' })
                    .where(and(
                        eq(bids.card_id, bid.card_id),
                        eq(bids.status, 'active'),
                        eq(bids.bid_type, 'open'),
                        ne(bids.id, bidId)
                    ));

                return updatedBid[0];
            });
        } catch (error) {
            console.error('Database error in acceptOpenBid:', error);
            throw new DatabaseError('Failed to accept open bid');
        }
    }
};