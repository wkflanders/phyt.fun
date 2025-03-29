import { relations } from 'drizzle-orm';

import {
    users,
    runs,
    runners,
    cards,
    card_metadata,
    competitions,
    lineups,
    lineup_cards,
    runner_results,
    manager_results,
    pack_purchases,
    listings,
    user_device_authorizations
} from './schema';

export const usersRelations = relations(users, ({ many }) => ({
    runners: many(runners),
    cards: many(cards, { relationName: 'owner' }),
    lineups: many(lineups),
    deviceAuths: many(user_device_authorizations)
}));

export const runnersRelations = relations(runners, ({ one, many }) => ({
    user: one(users, {
        fields: [runners.user_id],
        references: [users.id]
    }),
    runs: many(runs),
    cards: many(card_metadata), // Changed from cards to card_metadata
    runnerResults: many(runner_results)
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
    owner: one(users, {
        fields: [cards.owner_id], // Changed from current_owner_id to owner_id
        references: [users.id]
    }),
    metadata: one(card_metadata, {
        fields: [cards.id],
        references: [card_metadata.token_id]
    }),
    packPurchase: one(pack_purchases, {
        fields: [cards.pack_purchase_id],
        references: [pack_purchases.id]
    }),
    lineupCards: many(lineup_cards)
}));

export const cardMetadataRelations = relations(card_metadata, ({ one }) => ({
    card: one(cards, {
        fields: [card_metadata.token_id],
        references: [cards.id]
    }),
    runner: one(runners, {
        fields: [card_metadata.runner_id],
        references: [runners.id]
    })
}));

export const competitionsRelations = relations(competitions, ({ many }) => ({
    lineups: many(lineups),
    runnerResults: many(runner_results)
}));

export const lineupsRelations = relations(lineups, ({ one, many }) => ({
    competition: one(competitions, {
        fields: [lineups.competition_id],
        references: [competitions.id]
    }),
    manager: one(users, {
        fields: [lineups.manager_id],
        references: [users.id]
    }),
    lineupCards: many(lineup_cards),
    managerResults: many(manager_results)
}));

export const lineupCardsRelations = relations(lineup_cards, ({ one }) => ({
    lineup: one(lineups, {
        fields: [lineup_cards.lineup_id],
        references: [lineups.id]
    }),
    card: one(cards, {
        fields: [lineup_cards.card_id],
        references: [cards.id]
    })
}));

export const runnerResultsRelations = relations(runner_results, ({ one }) => ({
    competition: one(competitions, {
        fields: [runner_results.competition_id],
        references: [competitions.id]
    }),
    runner: one(runners, {
        fields: [runner_results.runner_id],
        references: [runners.id]
    }),
    session: one(runs, {
        fields: [runner_results.session_id],
        references: [runs.id]
    })
}));

export const managerResultsRelations = relations(
    manager_results,
    ({ one }) => ({
        lineup: one(lineups, {
            fields: [manager_results.lineup_id],
            references: [lineups.id]
        })
    })
);

export const listingsRelations = relations(listings, ({ one }) => ({
    card: one(cards, {
        fields: [listings.card_id],
        references: [cards.id]
    }),
    seller: one(users, {
        fields: [listings.seller_id],
        references: [users.id]
    })
}));

export const userDeviceAuthorizationsRelations = relations(
    user_device_authorizations,
    ({ one }) => ({
        user: one(users, {
            fields: [user_device_authorizations.user_id],
            references: [users.id]
        })
    })
);
