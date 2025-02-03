import { Address, encodePacked, keccak256, parseEther, zeroAddress } from "viem";
import {
    listings,
    offers,
    cards,
    users,
    transactions,
    card_metadata,
    db, eq, and, sql, not
} from "@phyt/database";
import {
    NotFoundError,
    ValidationError,
    DatabaseError,
    Order,
    CreateListingParams,
    CreateOfferParams,
    Side,
    Offer
} from "@phyt/types";
import { ExchangeAbi } from "@phyt/contracts";
import { publicClient } from "../lib/viemClient";

const EXCHANGE_ADDRESS = process.env.EXCHANGE_ADDRESS as Address;
const PHYT_CARDS_ADDRESS = process.env.PHYT_CARDS_ADDRESS as Address;

export const marketplaceService = {

    async createListing({
        seller_id,
        card_id,
        price,
        payment_token,
        expiration_time,
        signature,
        salt
    }: CreateListingParams) {
        try {
            // Verify card ownership and get token ID
            const card = await db.query.cards.findFirst({
                where: and(
                    eq(cards.id, card_id),
                    eq(cards.owner_id, seller_id),
                    eq(cards.is_burned, false)
                ),
                with: {
                    owner: true
                }
            });

            if (!card) {
                throw new NotFoundError("Card not found or not owned by seller");
            }

            // Start a transaction since we're doing multiple operations
            return await db.transaction(async (tx) => {
                // Create the listing
                const [listing] = await tx.insert(listings).values({
                    seller_id: seller_id,
                    card_id: card_id,
                    price: price,
                    payment_token: payment_token,
                    expiration_time: new Date(expiration_time * 1000),
                    signature,
                    salt,
                    active: true
                }).returning();

                // Record the listing transaction
                await tx.insert(transactions).values({
                    from_user_id: seller_id,
                    card_id: card_id,
                    transaction_type: 'marketplaceListing',
                    token_amount: price
                });

                return listing;
            });
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error creating listing:', error);
            throw new DatabaseError('Failed to create listing');
        }
    },

    async createOffer({
        buyer_id,
        card_id,
        price,
        payment_token,
        expiration_time,
        signature,
        salt
    }: CreateOfferParams) {
        try {
            // Verify card exists and is not burned
            const card = await db.query.cards.findFirst({
                where: and(
                    eq(cards.id, card_id),
                    eq(cards.is_burned, false)
                ),
                with: {
                    owner: true
                }
            });

            if (!card) {
                throw new NotFoundError("Card not found or is burned");
            }

            if (card.owner_id === buyer_id) {
                throw new ValidationError("Cannot place offer on your own card");
            }

            // Start a transaction for offer creation
            return await db.transaction(async (tx) => {
                // Create the offer
                const [offer] = await tx.insert(offers).values({
                    buyer_id: buyer_id,
                    card_id: card_id,
                    price,
                    payment_token: payment_token,
                    expiration_time: new Date(expiration_time * 1000),
                    signature,
                    salt,
                    active: true
                }).returning();

                // Record the offer transaction
                await tx.insert(transactions).values({
                    from_user_id: buyer_id,
                    to_user_id: card.owner_id,
                    card_id: card_id,
                    transaction_type: 'marketplaceOffer',
                    token_amount: price
                });

                return offer;
            });
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
            console.error('Error creating offer:', error);
            throw new DatabaseError('Failed to create offer');
        }
    },

    async acceptOffer(offer_id: number, seller_id: number) {
        try {
            const offer = await db.query.offers.findFirst({
                where: and(
                    eq(offers.id, offer_id),
                    eq(offers.active, true)
                ),
                with: {
                    card: {
                        with: {
                            owner: true
                        }
                    },
                    buyer: true
                }
            }) as Offer | null;

            if (!offer) {
                throw new NotFoundError("Offer not found or inactive");
            }

            if (offer.card.owner_id !== seller_id) {
                throw new ValidationError("Only card owner can accept offers");
            }

            const expiration_time = new Date(offer.expiration_time).getTime() / 1000;
            if (expiration_time < Date.now() / 1000) {
                throw new ValidationError("Offer has expired");
            }

            return await db.transaction(async (tx) => {
                // Deactivate the offer
                const [updatedOffer] = await tx
                    .update(offers)
                    .set({ active: false })
                    .where(eq(offers.id, offer_id))
                    .returning();

                // Record the sale transaction
                await tx.insert(transactions).values({
                    from_user_id: seller_id,
                    to_user_id: offer.buyer_id,
                    card_id: offer.card_id,
                    transaction_type: 'marketplaceSale',
                    token_amount: offer.price
                });

                // Update card ownership
                await tx
                    .update(cards)
                    .set({
                        owner_id: offer.buyer_id,
                        acquisition_type: 'marketplace'
                    })
                    .where(eq(cards.id, offer.card_id));

                // Deactivate any other offers for this card
                await tx
                    .update(offers)
                    .set({ active: false })
                    .where(
                        and(
                            eq(offers.card_id, offer.card_id),
                            not(eq(offers.id, offer_id))
                        )
                    );

                return updatedOffer;
            });
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
            console.error('Error accepting offer:', error);
            throw new DatabaseError('Failed to accept offer');
        }
    },

    async acceptListing(listing_id: number, buyer_id: number) {
        try {
            const listing = await db.query.listings.findFirst({
                where: and(
                    eq(listings.id, listing_id),
                    eq(listings.active, true)
                ),
                with: {
                    card: {
                        with: {
                            owner: true
                        }
                    },
                    seller: true
                }
            });

            if (!listing) {
                throw new NotFoundError("Listing not found or inactive");
            }

            if (listing.seller_id === buyer_id) {
                throw new ValidationError("Cannot buy your own listing");
            }

            const expiration_time = new Date(listing.expiration_time).getTime() / 1000;
            if (expiration_time < Date.now() / 1000) {
                throw new ValidationError("Listing has expired");
            }

            return await db.transaction(async (tx) => {
                // Deactivate the listing
                const [updatedListing] = await tx
                    .update(listings)
                    .set({ active: false })
                    .where(eq(listings.id, listing_id))
                    .returning();

                // Record the sale transaction
                await tx.insert(transactions).values({
                    from_user_id: listing.seller_id,
                    to_user_id: buyer_id,
                    card_id: listing.card_id,
                    transaction_type: 'marketplaceSale',
                    token_amount: listing.price
                });

                // Update card ownership
                await tx
                    .update(cards)
                    .set({
                        owner_id: buyer_id,
                        acquisition_type: 'marketplace'
                    })
                    .where(eq(cards.id, listing.card_id));

                // Deactivate any offers for this card
                await tx
                    .update(offers)
                    .set({ active: false })
                    .where(eq(offers.card_id, listing.card_id));

                return updatedListing;
            });
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
            console.error('Error accepting listing:', error);
            throw new DatabaseError('Failed to accept listing');
        }
    },

    async cancelListing(listing_id: number, seller_id: number) {
        try {
            const [listing] = await db
                .update(listings)
                .set({ active: false })
                .where(
                    and(
                        eq(listings.id, listing_id),
                        eq(listings.seller_id, seller_id),
                        eq(listings.active, true)
                    )
                )
                .returning();

            if (!listing) {
                throw new NotFoundError("Listing not found, inactive, or not owned by seller");
            }

            return listing;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error cancelling listing:', error);
            throw new DatabaseError('Failed to cancel listing');
        }
    },

    async cancelOffer(offer_id: number, buyer_id: number) {
        try {
            const [offer] = await db
                .update(offers)
                .set({ active: false })
                .where(
                    and(
                        eq(offers.id, offer_id),
                        eq(offers.buyer_id, buyer_id),
                        eq(offers.active, true)
                    )
                )
                .returning();

            if (!offer) {
                throw new NotFoundError("Offer not found, inactive, or not owned by buyer");
            }

            return offer;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error cancelling offer:', error);
            throw new DatabaseError('Failed to cancel offer');
        }
    },

    async getListingsByCard(card_id: number) {
        try {
            const listingsByCard = await db.query.listings.findMany({
                where: and(
                    eq(listings.card_id, card_id),
                    eq(listings.active, true)
                ),
                with: {
                    seller: true,
                    card: {
                        with: {
                            metadata: true
                        }
                    }
                },
                orderBy: [sql`created_at DESC`]
            });

            return listingsByCard;
        } catch (error) {
            console.error('Error getting listings by card:', error);
            throw new DatabaseError('Failed to get listings');
        }
    },

    async getOffersByCard(card_id: number) {
        try {
            const offersByCard = await db.query.offers.findMany({
                where: and(
                    eq(offers.card_id, card_id),
                    eq(offers.active, true)
                ),
                with: {
                    buyer: true,
                    card: {
                        with: {
                            metadata: true
                        }
                    }
                },
                orderBy: [sql`created_at DESC`]
            });

            return offersByCard;
        } catch (error) {
            console.error('Error getting offers by card:', error);
            throw new DatabaseError('Failed to get offers');
        }
    },

    async verifyOrder(order: Order, signature: string): Promise<boolean> {
        try {
            // Verify order format and signature using Exchange contract
            const valid = await publicClient.readContract({
                address: EXCHANGE_ADDRESS,
                abi: ExchangeAbi,
                functionName: 'verifyOrder',
                args: [order, signature]
            });

            return valid;
        } catch (error) {
            console.error('Error verifying order:', error);
            throw new Error('Failed to verify order');
        }
    },

    formatOrder(
        trader: string,
        side: Side,
        token_id: number,
        payment_token: string,
        price: string,
        expiration_time: number,
        salt: string
    ): Order {
        return {
            trader: trader as Address,
            side: side === 'buy' ? 0 : 1,
            collection: PHYT_CARDS_ADDRESS,
            token_id: BigInt(token_id),
            payment_token: (payment_token || zeroAddress) as Address,
            price: parseEther(price),
            expiration_time: BigInt(expiration_time),
            merkle_root: "0x0000000000000000000000000000000000000000000000000000000000000000",
            salt: BigInt(salt)
        };
    },

    async getListing(listing_id: number) {
        try {
            const listing = await db.query.listings.findFirst({
                where: eq(listings.id, listing_id),
                with: {
                    card: {
                        with: {
                            metadata: true,
                            owner: true
                        }
                    },
                    seller: true
                }
            });

            if (!listing) {
                throw new NotFoundError('Listing not found');
            }

            return listing;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error getting listing:', error);
            throw new DatabaseError('Failed to get listing');
        }
    },

    async getOffer(offer_id: number) {
        try {
            const offer = await db.query.offers.findFirst({
                where: eq(offers.id, offer_id),
                with: {
                    card: {
                        with: {
                            metadata: true,
                            owner: true
                        }
                    },
                    buyer: true
                }
            });

            if (!offer) {
                throw new NotFoundError('Offer not found');
            }

            return offer;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            console.error('Error getting offer:', error);
            throw new DatabaseError('Failed to get offer');
        }
    }
};