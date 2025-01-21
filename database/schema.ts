import { pgTable, index, uniqueIndex, serial, timestamp, varchar, foreignKey, integer, numeric, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const enum_cards_rarity = pgEnum("enum_cards_rarity", ['Common', 'Rare', 'Exotic', 'Legendary']);
export const enum_runs_verification_status = pgEnum("enum_runs_verification_status", ['pending', 'verified', 'flagged']);
export const enum_transactions_transaction_type = pgEnum("enum_transactions_transaction_type", ['packPurchase', 'marketplaceSale', 'rewardPayout']);
export const enum_users_role = pgEnum("enum_users_role", ['admin', 'user', 'runner']);


export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	email: varchar().notNull(),
	username: varchar().notNull(),
	role: enum_users_role().default('user').notNull(),
	privy_id: varchar(),
	wallet_address: varchar(),
}, (table) => [
	index("users_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	uniqueIndex("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	uniqueIndex("users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
]);

export const runs = pgTable("runs", {
	id: serial().primaryKey().notNull(),
	runner_id: integer().notNull(),
	start_time: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
	end_time: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
	duration_seconds: numeric().notNull(),
	distance_m: numeric().notNull(),
	average_pace_sec: numeric(),
	calories_burned: numeric(),
	step_count: numeric(),
	elevation_gain_m: numeric(),
	average_heart_rate: numeric(),
	max_heart_rate: numeric(),
	device_id: varchar(),
	gps_route_data: varchar(),
	verification_status: enum_runs_verification_status().default('pending'),
	raw_data_j_s_o_n: jsonb(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("runs_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("runs_runner_idx").using("btree", table.runner_id.asc().nullsLast().op("int4_ops")),
	index("runs_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.runner_id],
		foreignColumns: [users.id],
		name: "runs_runner_id_users_id_fk"
	}).onDelete("set null"),
]);

export const cards = pgTable("cards", {
	id: serial().primaryKey().notNull(),
	runner_id: integer().notNull(),
	current_owner_id: integer().notNull(),
	rarity: enum_cards_rarity().default('Common').notNull(),
	multiplier: numeric().default('1').notNull(),
	is_burned: boolean().default(false),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("cards_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("cards_current_owner_idx").using("btree", table.current_owner_id.asc().nullsLast().op("int4_ops")),
	index("cards_runner_idx").using("btree", table.runner_id.asc().nullsLast().op("int4_ops")),
	index("cards_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.runner_id],
		foreignColumns: [runners.id],
		name: "cards_runner_id_runners_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.current_owner_id],
		foreignColumns: [users.id],
		name: "cards_current_owner_id_users_id_fk"
	}).onDelete("set null"),
]);

export const competitions = pgTable("competitions", {
	id: serial().primaryKey().notNull(),
	event_name: varchar().notNull(),
	start_time: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
	end_time: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
	distance_m: numeric(),
	event_type: varchar(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("competitions_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("competitions_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
]);

export const lineups = pgTable("lineups", {
	id: serial().primaryKey().notNull(),
	competition_id: integer().notNull(),
	gambler_id: integer().notNull(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("lineups_competition_idx").using("btree", table.competition_id.asc().nullsLast().op("int4_ops")),
	index("lineups_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("lineups_gambler_idx").using("btree", table.gambler_id.asc().nullsLast().op("int4_ops")),
	index("lineups_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.competition_id],
		foreignColumns: [competitions.id],
		name: "lineups_competition_id_competitions_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.gambler_id],
		foreignColumns: [users.id],
		name: "lineups_gambler_id_users_id_fk"
	}).onDelete("set null"),
]);

export const lineup_cards = pgTable("lineup_cards", {
	id: serial().primaryKey().notNull(),
	lineup_id: integer().notNull(),
	card_id: integer().notNull(),
	position: numeric().notNull(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("lineup_cards_card_idx").using("btree", table.card_id.asc().nullsLast().op("int4_ops")),
	index("lineup_cards_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("lineup_cards_lineup_idx").using("btree", table.lineup_id.asc().nullsLast().op("int4_ops")),
	index("lineup_cards_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.lineup_id],
		foreignColumns: [lineups.id],
		name: "lineup_cards_lineup_id_lineups_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.card_id],
		foreignColumns: [cards.id],
		name: "lineup_cards_card_id_cards_id_fk"
	}).onDelete("set null"),
]);

export const runners = pgTable("runners", {
	id: serial().primaryKey().notNull(),
	user_id: integer().notNull(),
	average_pace: numeric(),
	total_distance_m: numeric().default('0'),
	total_runs: numeric().default('0'),
	best_mile_time: numeric(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("runners_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("runners_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	uniqueIndex("runners_user_idx").using("btree", table.user_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.user_id],
		foreignColumns: [users.id],
		name: "runners_user_id_users_id_fk"
	}).onDelete("set null"),
]);

export const runner_results = pgTable("runner_results", {
	id: serial().primaryKey().notNull(),
	competition_id: integer().notNull(),
	runner_id: integer().notNull(),
	session_id: integer().notNull(),
	best_time_sec: numeric().notNull(),
	ranking: numeric(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("runner_results_competition_idx").using("btree", table.competition_id.asc().nullsLast().op("int4_ops")),
	index("runner_results_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("runner_results_runner_idx").using("btree", table.runner_id.asc().nullsLast().op("int4_ops")),
	index("runner_results_session_idx").using("btree", table.session_id.asc().nullsLast().op("int4_ops")),
	index("runner_results_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.competition_id],
		foreignColumns: [competitions.id],
		name: "runner_results_competition_id_competitions_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.runner_id],
		foreignColumns: [runners.id],
		name: "runner_results_runner_id_runners_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.session_id],
		foreignColumns: [runs.id],
		name: "runner_results_session_id_runs_id_fk"
	}).onDelete("set null"),
]);

export const gambler_results = pgTable("gambler_results", {
	id: serial().primaryKey().notNull(),
	lineup_id: integer().notNull(),
	total_score: numeric().notNull(),
	final_placement: numeric(),
	reward_amount_p_h_y_t: numeric(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gambler_results_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("gambler_results_lineup_idx").using("btree", table.lineup_id.asc().nullsLast().op("int4_ops")),
	index("gambler_results_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.lineup_id],
		foreignColumns: [lineups.id],
		name: "gambler_results_lineup_id_lineups_id_fk"
	}).onDelete("set null"),
]);

export const transactions = pgTable("transactions", {
	id: serial().primaryKey().notNull(),
	from_user_id: integer(),
	to_user_id: integer(),
	card_id: integer(),
	competition_id: integer(),
	token_amount: numeric(),
	transaction_type: enum_transactions_transaction_type().notNull(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("transactions_card_idx").using("btree", table.card_id.asc().nullsLast().op("int4_ops")),
	index("transactions_competition_idx").using("btree", table.competition_id.asc().nullsLast().op("int4_ops")),
	index("transactions_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("transactions_from_user_idx").using("btree", table.from_user_id.asc().nullsLast().op("int4_ops")),
	index("transactions_to_user_idx").using("btree", table.to_user_id.asc().nullsLast().op("int4_ops")),
	index("transactions_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.from_user_id],
		foreignColumns: [users.id],
		name: "transactions_from_user_id_users_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.to_user_id],
		foreignColumns: [users.id],
		name: "transactions_to_user_id_users_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.card_id],
		foreignColumns: [cards.id],
		name: "transactions_card_id_cards_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.competition_id],
		foreignColumns: [competitions.id],
		name: "transactions_competition_id_competitions_id_fk"
	}).onDelete("set null"),
]);

export const pack_purchases_card_ids = pgTable("pack_purchases_card_ids", {
	_order: integer().notNull(),
	_parent_id: integer().notNull(),
	id: varchar().primaryKey().notNull(),
	card_id: integer(),
}, (table) => [
	index("pack_purchases_card_ids_card_idx").using("btree", table.card_id.asc().nullsLast().op("int4_ops")),
	index("pack_purchases_card_ids_order_idx").using("btree", table._order.asc().nullsLast().op("int4_ops")),
	index("pack_purchases_card_ids_parent_id_idx").using("btree", table._parent_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.card_id],
		foreignColumns: [cards.id],
		name: "pack_purchases_card_ids_card_id_cards_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table._parent_id],
		foreignColumns: [pack_purchases.id],
		name: "pack_purchases_card_ids_parent_id_fk"
	}).onDelete("cascade"),
]);

export const pack_purchases = pgTable("pack_purchases", {
	id: serial().primaryKey().notNull(),
	buyer_id: integer().notNull(),
	purchase_price: numeric().notNull(),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("pack_purchases_buyer_idx").using("btree", table.buyer_id.asc().nullsLast().op("int4_ops")),
	index("pack_purchases_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("pack_purchases_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.buyer_id],
		foreignColumns: [users.id],
		name: "pack_purchases_buyer_id_users_id_fk"
	}).onDelete("set null"),
]);

export const listings = pgTable("listings", {
	id: serial().primaryKey().notNull(),
	card_id: integer().notNull(),
	seller_id: integer().notNull(),
	listed_price: numeric().notNull(),
	is_active: boolean().default(true),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("listings_card_idx").using("btree", table.card_id.asc().nullsLast().op("int4_ops")),
	index("listings_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("listings_seller_idx").using("btree", table.seller_id.asc().nullsLast().op("int4_ops")),
	index("listings_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
		columns: [table.card_id],
		foreignColumns: [cards.id],
		name: "listings_card_id_cards_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.seller_id],
		foreignColumns: [users.id],
		name: "listings_seller_id_users_id_fk"
	}).onDelete("set null"),
]);

export const user_device_authorizations = pgTable("user_device_authorizations", {
	id: serial().primaryKey().notNull(),
	user_id: integer().notNull(),
	device_type: varchar().notNull(),
	access_token: varchar(),
	refresh_token: varchar(),
	scopes: varchar(),
	last_synced_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }),
	updated_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_at: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_device_authorizations_created_at_idx").using("btree", table.created_at.asc().nullsLast().op("timestamptz_ops")),
	index("user_device_authorizations_updated_at_idx").using("btree", table.updated_at.asc().nullsLast().op("timestamptz_ops")),
	index("user_device_authorizations_user_idx").using("btree", table.user_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.user_id],
		foreignColumns: [users.id],
		name: "user_device_authorizations_user_id_users_id_fk"
	}).onDelete("set null"),
]);
