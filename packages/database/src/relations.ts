import { relations } from 'drizzle-orm';

import {
    users,
    runs,
    runners,
    cards,
    cardMetadata,
    competitions,
    lineups,
    lineupCards,
    runnerResults,
    managerResults,
    packPurchases,
    listings,
    userDeviceAuthorizations
} from './schema.js';

export const usersRelations = relations(users, ({ many }) => ({
    runners: many(runners),
    cards: many(cards, { relationName: 'owner' }),
    lineups: many(lineups),
    deviceAuths: many(userDeviceAuthorizations)
}));

export const runnersRelations = relations(runners, ({ one, many }) => ({
    user: one(users, {
        fields: [runners.userId],
        references: [users.id]
    }),
    runs: many(runs),
    cards: many(cardMetadata), // Changed from cards to card_metadata
    runnerResults: many(runnerResults)
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
    owner: one(users, {
        fields: [cards.ownerId], // Changed from current_owner_id to owner_id
        references: [users.id]
    }),
    metadata: one(cardMetadata, {
        fields: [cards.id],
        references: [cardMetadata.tokenId]
    }),
    packPurchase: one(packPurchases, {
        fields: [cards.packPurchaseId],
        references: [packPurchases.id]
    }),
    lineupCards: many(lineupCards)
}));

export const cardMetadataRelations = relations(cardMetadata, ({ one }) => ({
    card: one(cards, {
        fields: [cardMetadata.tokenId],
        references: [cards.id]
    }),
    runner: one(runners, {
        fields: [cardMetadata.runnerId],
        references: [runners.id]
    })
}));

export const competitionsRelations = relations(competitions, ({ many }) => ({
    lineups: many(lineups),
    runnerResults: many(runnerResults)
}));

export const lineupsRelations = relations(lineups, ({ one, many }) => ({
    competition: one(competitions, {
        fields: [lineups.competitionId],
        references: [competitions.id]
    }),
    manager: one(users, {
        fields: [lineups.managerId],
        references: [users.id]
    }),
    lineupCards: many(lineupCards),
    managerResults: many(managerResults)
}));

export const lineupCardsRelations = relations(lineupCards, ({ one }) => ({
    lineup: one(lineups, {
        fields: [lineupCards.lineupId],
        references: [lineups.id]
    }),
    card: one(cards, {
        fields: [lineupCards.cardId],
        references: [cards.id]
    })
}));

export const runnerResultsRelations = relations(runnerResults, ({ one }) => ({
    competition: one(competitions, {
        fields: [runnerResults.competitionId],
        references: [competitions.id]
    }),
    runner: one(runners, {
        fields: [runnerResults.runnerId],
        references: [runners.id]
    }),
    session: one(runs, {
        fields: [runnerResults.sessionId],
        references: [runs.id]
    })
}));

export const managerResultsRelations = relations(managerResults, ({ one }) => ({
    lineup: one(lineups, {
        fields: [managerResults.lineupId],
        references: [lineups.id]
    })
}));

export const listingsRelations = relations(listings, ({ one }) => ({
    card: one(cards, {
        fields: [listings.cardId],
        references: [cards.id]
    }),
    seller: one(users, {
        fields: [listings.sellerId],
        references: [users.id]
    })
}));

export const userDeviceAuthorizationsRelations = relations(
    userDeviceAuthorizations,
    ({ one }) => ({
        user: one(users, {
            fields: [userDeviceAuthorizations.userId],
            references: [users.id]
        })
    })
);
