"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_device_authorizations = exports.transactions = exports.listings = exports.gambler_results = exports.runner_results = exports.lineup_cards = exports.lineups = exports.competitions = exports.card_metadata = exports.cards = exports.pack_purchases = exports.runs = exports.runners = exports.users = exports.enum_users_role = exports.enum_transactions_transaction_type = exports.enum_runs_verification_status = exports.enum_acquisition_type = exports.enum_cards_rarity = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
exports.enum_cards_rarity = (0, pg_core_1.pgEnum)("enum_cards_rarity", [
    'bronze', 'silver', 'gold', 'sapphire', 'ruby', 'opal'
]);
exports.enum_acquisition_type = (0, pg_core_1.pgEnum)("enum_acquisition_type", [
    'mint', 'transfer', 'marketplace'
]);
exports.enum_runs_verification_status = (0, pg_core_1.pgEnum)("enum_runs_verification_status", [
    'pending', 'verified', 'flagged'
]);
exports.enum_transactions_transaction_type = (0, pg_core_1.pgEnum)("enum_transactions_transaction_type", [
    'packPurchase', 'marketplaceSale', 'rewardPayout'
]);
exports.enum_users_role = (0, pg_core_1.pgEnum)("enum_users_role", [
    'admin', 'user', 'runner'
]);
// Tables
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
    email: (0, pg_core_1.varchar)("email").notNull(),
    username: (0, pg_core_1.varchar)("username").notNull(),
    role: (0, exports.enum_users_role)("role").default('user').notNull(),
    privy_id: (0, pg_core_1.varchar)("privy_id"),
    wallet_address: (0, pg_core_1.varchar)("wallet_address"),
    avatar_url: (0, pg_core_1.varchar)("avatar_url").default('https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut'),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)("users_email_idx").on(table.email),
    (0, pg_core_1.uniqueIndex)("users_username_idx").on(table.username),
    (0, pg_core_1.index)("users_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("users_updated_at_idx").on(table.updated_at),
]; });
exports.runners = (0, pg_core_1.pgTable)("runners", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'restrict' }),
    average_pace: (0, pg_core_1.doublePrecision)("average_pace"),
    total_distance_m: (0, pg_core_1.doublePrecision)("total_distance_m").default(0),
    total_runs: (0, pg_core_1.integer)("total_runs").default(0),
    best_mile_time: (0, pg_core_1.doublePrecision)("best_mile_time"),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)("runners_user_idx").on(table.user_id),
    (0, pg_core_1.index)("runners_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("runners_updated_at_idx").on(table.updated_at),
]; });
exports.runs = (0, pg_core_1.pgTable)("runs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    runner_id: (0, pg_core_1.integer)("runner_id").notNull().references(function () { return exports.runners.id; }, { onDelete: 'set null' }),
    start_time: (0, pg_core_1.timestamp)("start_time", { precision: 3 }).notNull(),
    end_time: (0, pg_core_1.timestamp)("end_time", { precision: 3 }).notNull(),
    duration_seconds: (0, pg_core_1.integer)("duration_seconds").notNull(),
    distance_m: (0, pg_core_1.doublePrecision)("distance_m").notNull(),
    average_pace_sec: (0, pg_core_1.doublePrecision)("average_pace_sec"),
    calories_burned: (0, pg_core_1.integer)("calories_burned"),
    step_count: (0, pg_core_1.integer)("step_count"),
    elevation_gain_m: (0, pg_core_1.doublePrecision)("elevation_gain_m"),
    average_heart_rate: (0, pg_core_1.integer)("average_heart_rate"),
    max_heart_rate: (0, pg_core_1.integer)("max_heart_rate"),
    device_id: (0, pg_core_1.varchar)("device_id"),
    gps_route_data: (0, pg_core_1.varchar)("gps_route_data"),
    verification_status: (0, exports.enum_runs_verification_status)("verification_status").default('pending'),
    raw_data_json: (0, pg_core_1.jsonb)("raw_data_json"),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("runs_runner_idx").on(table.runner_id),
    (0, pg_core_1.index)("runs_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("runs_updated_at_idx").on(table.updated_at),
]; });
exports.pack_purchases = (0, pg_core_1.pgTable)("pack_purchases", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    buyer_id: (0, pg_core_1.integer)("buyer_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    purchase_price: (0, pg_core_1.doublePrecision)("purchase_price").notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("pack_purchases_buyer_idx").on(table.buyer_id),
    (0, pg_core_1.index)("pack_purchases_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("pack_purchases_updated_at_idx").on(table.updated_at),
]; });
exports.cards = (0, pg_core_1.pgTable)("cards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    owner_id: (0, pg_core_1.integer)("owner_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    pack_purchase_id: (0, pg_core_1.integer)("pack_purchase_id").references(function () { return exports.pack_purchases.id; }, { onDelete: 'set null' }),
    acquisition_type: (0, exports.enum_acquisition_type)("acquisition_type").notNull().default('mint'),
    is_burned: (0, pg_core_1.boolean)("is_burned").default(false),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_cards_owner_id").on(table.owner_id),
    (0, pg_core_1.index)("idx_cards_pack_purchase_id").on(table.pack_purchase_id),
    (0, pg_core_1.index)("idx_cards_created_at").on(table.created_at),
    (0, pg_core_1.index)("idx_cards_updated_at").on(table.updated_at),
]; });
exports.card_metadata = (0, pg_core_1.pgTable)("card_metadata", {
    token_id: (0, pg_core_1.integer)("token_id").primaryKey().references(function () { return exports.cards.id; }, { onDelete: 'cascade' }),
    runner_id: (0, pg_core_1.integer)("runner_id").notNull().references(function () { return exports.runners.id; }, { onDelete: 'restrict' }),
    runner_name: (0, pg_core_1.varchar)("runner_name").notNull(),
    rarity: (0, exports.enum_cards_rarity)("rarity").notNull(),
    multiplier: (0, pg_core_1.doublePrecision)("multiplier").notNull(),
    image_url: (0, pg_core_1.varchar)("image_url").notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("idx_card_metadata_runner_id").on(table.runner_id),
    (0, pg_core_1.index)("idx_card_metadata_created_at").on(table.created_at),
]; });
exports.competitions = (0, pg_core_1.pgTable)("competitions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    event_name: (0, pg_core_1.varchar)("event_name").notNull(),
    start_time: (0, pg_core_1.timestamp)("start_time", { precision: 3 }).notNull(),
    end_time: (0, pg_core_1.timestamp)("end_time", { precision: 3 }).notNull(),
    distance_m: (0, pg_core_1.doublePrecision)("distance_m"),
    event_type: (0, pg_core_1.varchar)("event_type"),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("competitions_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("competitions_updated_at_idx").on(table.updated_at),
]; });
exports.lineups = (0, pg_core_1.pgTable)("lineups", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    competition_id: (0, pg_core_1.integer)("competition_id").notNull().references(function () { return exports.competitions.id; }, { onDelete: 'set null' }),
    gambler_id: (0, pg_core_1.integer)("gambler_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("lineups_competition_idx").on(table.competition_id),
    (0, pg_core_1.index)("lineups_gambler_idx").on(table.gambler_id),
    (0, pg_core_1.index)("lineups_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("lineups_updated_at_idx").on(table.updated_at),
]; });
exports.lineup_cards = (0, pg_core_1.pgTable)("lineup_cards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    lineup_id: (0, pg_core_1.integer)("lineup_id").notNull().references(function () { return exports.lineups.id; }, { onDelete: 'set null' }),
    card_id: (0, pg_core_1.integer)("card_id").notNull().references(function () { return exports.cards.id; }, { onDelete: 'set null' }),
    position: (0, pg_core_1.integer)("position").notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("lineup_cards_lineup_idx").on(table.lineup_id),
    (0, pg_core_1.index)("lineup_cards_card_idx").on(table.card_id),
    (0, pg_core_1.index)("lineup_cards_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("lineup_cards_updated_at_idx").on(table.updated_at),
]; });
exports.runner_results = (0, pg_core_1.pgTable)("runner_results", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    competition_id: (0, pg_core_1.integer)("competition_id").notNull().references(function () { return exports.competitions.id; }, { onDelete: 'set null' }),
    runner_id: (0, pg_core_1.integer)("runner_id").notNull().references(function () { return exports.runners.id; }, { onDelete: 'set null' }),
    session_id: (0, pg_core_1.integer)("session_id").notNull().references(function () { return exports.runs.id; }, { onDelete: 'set null' }),
    best_time_sec: (0, pg_core_1.doublePrecision)("best_time_sec").notNull(),
    ranking: (0, pg_core_1.integer)("ranking"),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("runner_results_competition_idx").on(table.competition_id),
    (0, pg_core_1.index)("runner_results_runner_idx").on(table.runner_id),
    (0, pg_core_1.index)("runner_results_session_idx").on(table.session_id),
    (0, pg_core_1.index)("runner_results_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("runner_results_updated_at_idx").on(table.updated_at),
]; });
exports.gambler_results = (0, pg_core_1.pgTable)("gambler_results", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    lineup_id: (0, pg_core_1.integer)("lineup_id").notNull().references(function () { return exports.lineups.id; }, { onDelete: 'set null' }),
    total_score: (0, pg_core_1.doublePrecision)("total_score").notNull(),
    final_placement: (0, pg_core_1.integer)("final_placement"),
    reward_amount_p_h_y_t: (0, pg_core_1.doublePrecision)("reward_amount_p_h_y_t"),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("gambler_results_lineup_idx").on(table.lineup_id),
    (0, pg_core_1.index)("gambler_results_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("gambler_results_updated_at_idx").on(table.updated_at),
]; });
exports.listings = (0, pg_core_1.pgTable)("listings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    card_id: (0, pg_core_1.integer)("card_id").notNull().references(function () { return exports.cards.id; }, { onDelete: 'set null' }),
    seller_id: (0, pg_core_1.integer)("seller_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    listed_price: (0, pg_core_1.doublePrecision)("listed_price").notNull(),
    is_active: (0, pg_core_1.boolean)("is_active").default(true),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("listings_card_idx").on(table.card_id),
    (0, pg_core_1.index)("listings_seller_idx").on(table.seller_id),
    (0, pg_core_1.index)("listings_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("listings_updated_at_idx").on(table.updated_at),
]; });
exports.transactions = (0, pg_core_1.pgTable)("transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    from_user_id: (0, pg_core_1.integer)("from_user_id").references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    to_user_id: (0, pg_core_1.integer)("to_user_id").references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    card_id: (0, pg_core_1.integer)("card_id").references(function () { return exports.cards.id; }, { onDelete: 'set null' }),
    competition_id: (0, pg_core_1.integer)("competition_id").references(function () { return exports.competitions.id; }, { onDelete: 'set null' }),
    token_amount: (0, pg_core_1.doublePrecision)("token_amount"),
    transaction_type: (0, exports.enum_transactions_transaction_type)("transaction_type").notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("transactions_from_user_idx").on(table.from_user_id),
    (0, pg_core_1.index)("transactions_to_user_idx").on(table.to_user_id),
    (0, pg_core_1.index)("transactions_card_idx").on(table.card_id),
    (0, pg_core_1.index)("transactions_competition_idx").on(table.competition_id),
    (0, pg_core_1.index)("transactions_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("transactions_updated_at_idx").on(table.updated_at),
]; });
exports.user_device_authorizations = (0, pg_core_1.pgTable)("user_device_authorizations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    device_type: (0, pg_core_1.varchar)("device_type").notNull(),
    access_token: (0, pg_core_1.varchar)("access_token"),
    refresh_token: (0, pg_core_1.varchar)("refresh_token"),
    scopes: (0, pg_core_1.varchar)("scopes"),
    last_synced_at: (0, pg_core_1.timestamp)("last_synced_at", { precision: 3 }),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { precision: 3 }).defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at", { precision: 3 }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)("user_device_authorizations_user_idx").on(table.user_id),
    (0, pg_core_1.index)("user_device_authorizations_created_at_idx").on(table.created_at),
    (0, pg_core_1.index)("user_device_authorizations_updated_at_idx").on(table.updated_at),
]; });
