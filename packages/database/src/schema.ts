import { pgTable, index, uniqueIndex, serial, timestamp, varchar, foreignKey, integer, doublePrecision, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";

export const enum_cards_rarity = pgEnum("enum_cards_rarity", [
    'bronze', 'silver', 'gold', 'sapphire', 'ruby', 'opal'
]);

export const enum_acquisition_type = pgEnum("enum_acquisition_type", [
    'mint', 'transfer', 'marketplace'
]);

export const enum_runs_verification_status = pgEnum("enum_runs_verification_status", [
    'pending', 'verified', 'flagged'
]);

export const enum_transactions_transaction_type = pgEnum("enum_transactions_transaction_type", [
    'packPurchase',
    'marketplaceSale',
    'marketplaceOffer',
    'marketplaceListing',
    'rewardPayout'
]);
export const enum_users_role = pgEnum("enum_users_role", [
    'admin', 'user', 'runner'
]);
export const enum_runner_status = pgEnum("enum_runner_status", [
    'pending', 'active', 'inactive'
]);


// Tables
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
    email: varchar("email").notNull(),
    username: varchar("username").notNull(),
    role: enum_users_role("role").default('user').notNull(),
    privy_id: varchar("privy_id"),
    wallet_address: varchar("wallet_address"),
    avatar_url: varchar("avatar_url").default('https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut'),
    phytness_points: integer("phytness_points").default(0),
}, (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    uniqueIndex("users_username_idx").on(table.username),
    index("users_created_at_idx").on(table.created_at),
    index("users_updated_at_idx").on(table.updated_at),
]);

export const runners = pgTable("runners", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
    average_pace: doublePrecision("average_pace"),
    total_distance_m: doublePrecision("total_distance_m").default(0),
    total_runs: integer("total_runs").default(0),
    best_mile_time: doublePrecision("best_mile_time"),
    status: enum_runner_status("status").default('pending'),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    uniqueIndex("runners_user_idx").on(table.user_id),
    index("runners_created_at_idx").on(table.created_at),
    index("runners_updated_at_idx").on(table.updated_at),
]);

export const runs = pgTable("runs", {
    id: serial("id").primaryKey(),
    runner_id: integer("runner_id").notNull().references(() => runners.id, { onDelete: 'set null' }),
    start_time: timestamp("start_time", { precision: 3 }).notNull(),
    end_time: timestamp("end_time", { precision: 3 }).notNull(),
    duration_seconds: integer("duration_seconds").notNull(),
    distance_m: doublePrecision("distance_m").notNull(),
    average_pace_sec: doublePrecision("average_pace_sec"),
    calories_burned: integer("calories_burned"),
    step_count: integer("step_count"),
    elevation_gain_m: doublePrecision("elevation_gain_m"),
    average_heart_rate: integer("average_heart_rate"),
    max_heart_rate: integer("max_heart_rate"),
    device_id: varchar("device_id"),
    gps_route_data: varchar("gps_route_data"),
    verification_status: enum_runs_verification_status("verification_status").default('pending'),
    raw_data_json: jsonb("raw_data_json"),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("runs_runner_idx").on(table.runner_id),
    index("runs_created_at_idx").on(table.created_at),
    index("runs_updated_at_idx").on(table.updated_at),
]);

export const pack_purchases = pgTable("pack_purchases", {
    id: serial("id").primaryKey(),
    buyer_id: integer("buyer_id").notNull().references(() => users.id, { onDelete: 'set null' }),
    purchase_price: doublePrecision("purchase_price").notNull(),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("pack_purchases_buyer_idx").on(table.buyer_id),
    index("pack_purchases_created_at_idx").on(table.created_at),
    index("pack_purchases_updated_at_idx").on(table.updated_at),
]);

export const cards = pgTable("cards", {
    id: serial("id").primaryKey(),
    owner_id: integer("owner_id").notNull().references(() => users.id, { onDelete: 'set null' }),
    pack_purchase_id: integer("pack_purchase_id").references(() => pack_purchases.id, { onDelete: 'set null' }),
    token_id: integer("token_id").notNull().unique(),
    acquisition_type: enum_acquisition_type("acquisition_type").notNull().default('mint'),
    is_burned: boolean("is_burned").notNull().default(false),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("idx_cards_owner_id").on(table.owner_id),
    index("idx_cards_pack_purchase_id").on(table.pack_purchase_id),
    index("idx_cards_created_at").on(table.created_at),
    index("idx_cards_updated_at").on(table.updated_at),
]);

export const card_metadata = pgTable("card_metadata", {
    token_id: integer("token_id").primaryKey().references(() => cards.token_id, { onDelete: 'cascade' }),
    runner_id: integer("runner_id").notNull().references(() => runners.id, { onDelete: 'restrict' }),
    runner_name: varchar("runner_name").notNull(),
    rarity: enum_cards_rarity("rarity").notNull(),
    multiplier: doublePrecision("multiplier").notNull(),
    image_url: varchar("image_url").notNull(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    uniqueIndex("idx_cards_token_id").on(table.token_id),
    index("idx_card_metadata_runner_id").on(table.runner_id),
    index("idx_card_metadata_created_at").on(table.created_at),
]);

export const competitions = pgTable("competitions", {
    id: serial("id").primaryKey(),
    event_name: varchar("event_name").notNull(),
    start_time: timestamp("start_time", { precision: 3 }).notNull(),
    end_time: timestamp("end_time", { precision: 3 }).notNull(),
    distance_m: doublePrecision("distance_m"),
    event_type: varchar("event_type"),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("competitions_created_at_idx").on(table.created_at),
    index("competitions_updated_at_idx").on(table.updated_at),
]);

export const lineups = pgTable("lineups", {
    id: serial("id").primaryKey(),
    competition_id: integer("competition_id").notNull().references(() => competitions.id, { onDelete: 'set null' }),
    gambler_id: integer("gambler_id").notNull().references(() => users.id, { onDelete: 'set null' }),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("lineups_competition_idx").on(table.competition_id),
    index("lineups_gambler_idx").on(table.gambler_id),
    index("lineups_created_at_idx").on(table.created_at),
    index("lineups_updated_at_idx").on(table.updated_at),
]);

export const lineup_cards = pgTable("lineup_cards", {
    id: serial("id").primaryKey(),
    lineup_id: integer("lineup_id").notNull().references(() => lineups.id, { onDelete: 'set null' }),
    card_id: integer("card_id").notNull().references(() => cards.id, { onDelete: 'set null' }),
    position: integer("position").notNull(),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("lineup_cards_lineup_idx").on(table.lineup_id),
    index("lineup_cards_card_idx").on(table.card_id),
    index("lineup_cards_created_at_idx").on(table.created_at),
    index("lineup_cards_updated_at_idx").on(table.updated_at),
]);

export const runner_results = pgTable("runner_results", {
    id: serial("id").primaryKey(),
    competition_id: integer("competition_id").notNull().references(() => competitions.id, { onDelete: 'set null' }),
    runner_id: integer("runner_id").notNull().references(() => runners.id, { onDelete: 'set null' }),
    session_id: integer("session_id").notNull().references(() => runs.id, { onDelete: 'set null' }),
    best_time_sec: doublePrecision("best_time_sec").notNull(),
    ranking: integer("ranking"),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("runner_results_competition_idx").on(table.competition_id),
    index("runner_results_runner_idx").on(table.runner_id),
    index("runner_results_session_idx").on(table.session_id),
    index("runner_results_created_at_idx").on(table.created_at),
    index("runner_results_updated_at_idx").on(table.updated_at),
]);

export const gambler_results = pgTable("gambler_results", {
    id: serial("id").primaryKey(),
    lineup_id: integer("lineup_id").notNull().references(() => lineups.id, { onDelete: 'set null' }),
    total_score: doublePrecision("total_score").notNull(),
    final_placement: integer("final_placement"),
    reward_amount_p_h_y_t: doublePrecision("reward_amount_p_h_y_t"),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("gambler_results_lineup_idx").on(table.lineup_id),
    index("gambler_results_created_at_idx").on(table.created_at),
    index("gambler_results_updated_at_idx").on(table.updated_at),
]);

export const listings = pgTable("listings", {
    id: serial("id").primaryKey(),
    card_id: integer("card_id").notNull().references(() => cards.id, { onDelete: 'set null' }),
    seller_id: integer("seller_id").notNull().references(() => users.id, { onDelete: 'set null' }),
    buyer_id: integer("buyer_id").references(() => users.id, { onDelete: 'set null' }),
    price: varchar("price").notNull(),
    signature: varchar("signature").notNull(),
    order_hash: varchar("order_hash").notNull().unique(),
    order_data: jsonb("order_data").notNull(),
    expiration_time: timestamp("expiration_time", { precision: 3 }).notNull(),
    status: varchar("status").notNull().default('active'),
    transaction_hash: varchar("transaction_hash", { length: 66 }),
    highest_bid: varchar("highest_bid"),
    highest_bidder_id: integer("highest_bidder_id").references(() => users.id, { onDelete: 'set null' }),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("listings_card_idx").on(table.card_id),
    index("listings_seller_idx").on(table.seller_id),
    index("listings_buyer_idx").on(table.buyer_id),
    index("listings_status_idx").on(table.status),
    index("listings_created_at_idx").on(table.created_at),
    index("listings_updated_at_idx").on(table.updated_at),
]);

export const bids = pgTable("bids", {
    id: serial("id").primaryKey(),
    listing_id: integer("listing_id").references(() => listings.id, { onDelete: 'set null' }), // Made optional
    card_id: integer("card_id").notNull().references(() => cards.id, { onDelete: 'set null' }), // Added direct card reference
    bidder_id: integer("bidder_id").notNull().references(() => users.id, { onDelete: 'set null' }),
    price: varchar("price").notNull(),
    signature: varchar("signature").notNull(),
    order_hash: varchar("order_hash").notNull().unique(),
    order_data: jsonb("order_data").notNull(),
    bid_type: varchar("bid_type").notNull().default('listing'), // 'listing' or 'open'
    status: varchar("status").notNull().default('active'),
    expiration_time: timestamp("expiration_time", { precision: 3 }).notNull(), // Added expiration for open bids
    accepted_at: timestamp("accepted_at", { precision: 3 }),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("bids_listing_idx").on(table.listing_id),
    index("bids_card_idx").on(table.card_id),
    index("bids_bidder_idx").on(table.bidder_id),
    index("bids_status_idx").on(table.status),
    index("bids_type_idx").on(table.bid_type),
    index("bids_created_at_idx").on(table.created_at),
    index("bids_updated_at_idx").on(table.updated_at),
]);

export const transactions = pgTable("transactions", {
    id: serial("id").primaryKey(),
    from_user_id: integer("from_user_id").references(() => users.id, { onDelete: 'set null' }),
    to_user_id: integer("to_user_id").references(() => users.id, { onDelete: 'set null' }),
    card_id: integer("card_id").references(() => cards.id, { onDelete: 'set null' }),
    competition_id: integer("competition_id").references(() => competitions.id, { onDelete: 'set null' }),
    token_amount: doublePrecision("token_amount"),
    transaction_type: enum_transactions_transaction_type("transaction_type").notNull(),
    hash: varchar("hash", { length: 66 }), // 0x + 64 characters for hash
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("transactions_from_user_idx").on(table.from_user_id),
    index("transactions_to_user_idx").on(table.to_user_id),
    index("transactions_card_idx").on(table.card_id),
    index("transactions_competition_idx").on(table.competition_id),
    index("transactions_hash_idx").on(table.hash),
    index("transactions_created_at_idx").on(table.created_at),
    index("transactions_updated_at_idx").on(table.updated_at),
]);

export const user_device_authorizations = pgTable("user_device_authorizations", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull().references(() => users.id, { onDelete: 'set null' }),
    device_type: varchar("device_type").notNull(),
    access_token: varchar("access_token"),
    refresh_token: varchar("refresh_token"),
    scopes: varchar("scopes"),
    last_synced_at: timestamp("last_synced_at", { precision: 3 }),
    updated_at: timestamp("updated_at", { precision: 3 }).defaultNow(),
    created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
}, (table) => [
    index("user_device_authorizations_user_idx").on(table.user_id),
    index("user_device_authorizations_created_at_idx").on(table.created_at),
    index("user_device_authorizations_updated_at_idx").on(table.updated_at),
]);