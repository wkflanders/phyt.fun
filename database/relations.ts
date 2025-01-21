import { relations } from "drizzle-orm/relations";
import { users, runs, runners, cards, competitions, lineups, lineup_cards, runner_results, gambler_results, transactions, pack_purchases_card_ids, pack_purchases, listings, user_device_authorizations } from "./schema";

export const runsRelations = relations(runs, ({ one, many }) => ({
	user: one(users, {
		fields: [runs.runner_id],
		references: [users.id]
	}),
	runner_results: many(runner_results),
}));

export const usersRelations = relations(users, ({ many }) => ({
	runs: many(runs),
	cards: many(cards),
	lineups: many(lineups),
	runners: many(runners),
	transactions_from_user_id: many(transactions, {
		relationName: "transactions_from_user_id_users_id"
	}),
	transactions_to_user_id: many(transactions, {
		relationName: "transactions_to_user_id_users_id"
	}),
	pack_purchases: many(pack_purchases),
	listings: many(listings),
	user_device_authorizations: many(user_device_authorizations),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
	runner: one(runners, {
		fields: [cards.runner_id],
		references: [runners.id]
	}),
	user: one(users, {
		fields: [cards.current_owner_id],
		references: [users.id]
	}),
	lineup_cards: many(lineup_cards),
	transactions: many(transactions),
	pack_purchases_card_ids: many(pack_purchases_card_ids),
	listings: many(listings),
}));

export const runnersRelations = relations(runners, ({ one, many }) => ({
	cards: many(cards),
	user: one(users, {
		fields: [runners.user_id],
		references: [users.id]
	}),
	runner_results: many(runner_results),
}));

export const lineupsRelations = relations(lineups, ({ one, many }) => ({
	competition: one(competitions, {
		fields: [lineups.competition_id],
		references: [competitions.id]
	}),
	user: one(users, {
		fields: [lineups.gambler_id],
		references: [users.id]
	}),
	lineup_cards: many(lineup_cards),
	gambler_results: many(gambler_results),
}));

export const competitionsRelations = relations(competitions, ({ many }) => ({
	lineups: many(lineups),
	runner_results: many(runner_results),
	transactions: many(transactions),
}));

export const lineup_cardsRelations = relations(lineup_cards, ({ one }) => ({
	lineup: one(lineups, {
		fields: [lineup_cards.lineup_id],
		references: [lineups.id]
	}),
	card: one(cards, {
		fields: [lineup_cards.card_id],
		references: [cards.id]
	}),
}));

export const runner_resultsRelations = relations(runner_results, ({ one }) => ({
	competition: one(competitions, {
		fields: [runner_results.competition_id],
		references: [competitions.id]
	}),
	runner: one(runners, {
		fields: [runner_results.runner_id],
		references: [runners.id]
	}),
	run: one(runs, {
		fields: [runner_results.session_id],
		references: [runs.id]
	}),
}));

export const gambler_resultsRelations = relations(gambler_results, ({ one }) => ({
	lineup: one(lineups, {
		fields: [gambler_results.lineup_id],
		references: [lineups.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
	user_from_user_id: one(users, {
		fields: [transactions.from_user_id],
		references: [users.id],
		relationName: "transactions_from_user_id_users_id"
	}),
	user_to_user_id: one(users, {
		fields: [transactions.to_user_id],
		references: [users.id],
		relationName: "transactions_to_user_id_users_id"
	}),
	card: one(cards, {
		fields: [transactions.card_id],
		references: [cards.id]
	}),
	competition: one(competitions, {
		fields: [transactions.competition_id],
		references: [competitions.id]
	}),
}));

export const pack_purchases_card_idsRelations = relations(pack_purchases_card_ids, ({ one }) => ({
	card: one(cards, {
		fields: [pack_purchases_card_ids.card_id],
		references: [cards.id]
	}),
	pack_purchase: one(pack_purchases, {
		fields: [pack_purchases_card_ids._parent_id],
		references: [pack_purchases.id]
	}),
}));

export const pack_purchasesRelations = relations(pack_purchases, ({ one, many }) => ({
	pack_purchases_card_ids: many(pack_purchases_card_ids),
	user: one(users, {
		fields: [pack_purchases.buyer_id],
		references: [users.id]
	}),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
	card: one(cards, {
		fields: [listings.card_id],
		references: [cards.id]
	}),
	user: one(users, {
		fields: [listings.seller_id],
		references: [users.id]
	}),
}));

export const user_device_authorizationsRelations = relations(user_device_authorizations, ({ one }) => ({
	user: one(users, {
		fields: [user_device_authorizations.user_id],
		references: [users.id]
	}),
}));