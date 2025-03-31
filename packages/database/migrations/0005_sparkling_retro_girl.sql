CREATE TYPE "public"."enum_acquisition_type" AS ENUM('mint', 'transfer', 'marketplace');--> statement-breakpoint
CREATE TYPE "public"."enum_bid_status" AS ENUM('active', 'outbid', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."enum_bid_type" AS ENUM('listing', 'open');--> statement-breakpoint
CREATE TYPE "public"."enum_cards_rarity" AS ENUM('bronze', 'silver', 'gold', 'sapphire', 'ruby', 'opal');--> statement-breakpoint
CREATE TYPE "public"."enum_listing_status" AS ENUM('active', 'expiring', 'starting', 'expired', 'inactive', 'fulfilled');--> statement-breakpoint
CREATE TYPE "public"."enum_pack_type" AS ENUM('scrawny', 'toned', 'swole', 'phyt');--> statement-breakpoint
CREATE TYPE "public"."enum_posts_status" AS ENUM('visible', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."enum_reaction_type" AS ENUM('like', 'funny', 'insightful', 'fire');--> statement-breakpoint
CREATE TYPE "public"."enum_report_reason" AS ENUM('spam', 'harassment', 'inappropriate', 'other');--> statement-breakpoint
CREATE TYPE "public"."enum_report_status" AS ENUM('pending', 'reviewed', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."enum_runner_status" AS ENUM('pending', 'active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."enum_runs_verification_status" AS ENUM('pending', 'verified', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."enum_seasons" AS ENUM('season_0');--> statement-breakpoint
CREATE TYPE "public"."enum_transactions_transaction_type" AS ENUM('packPurchase', 'marketplaceSale', 'marketplaceOffer', 'marketplaceListing', 'rewardPayout');--> statement-breakpoint
CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user', 'runner');--> statement-breakpoint
CREATE TABLE "bids" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"bidder_id" integer NOT NULL,
	"price" numeric(78, 0) NOT NULL,
	"bid_amount" numeric(78, 0) NOT NULL,
	"signature" varchar NOT NULL,
	"order_hash" varchar NOT NULL,
	"order_data" jsonb NOT NULL,
	"bid_type" "enum_bid_type" DEFAULT 'listing' NOT NULL,
	"status" "enum_bid_status" DEFAULT 'active' NOT NULL,
	"expiration_time" timestamp (3) NOT NULL,
	"accepted_at" timestamp (3),
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "bids_order_hash_unique" UNIQUE("order_hash")
);
--> statement-breakpoint
CREATE TABLE "card_metadata" (
	"token_id" integer PRIMARY KEY NOT NULL,
	"runner_id" integer NOT NULL,
	"runner_name" varchar NOT NULL,
	"rarity" "enum_cards_rarity" NOT NULL,
	"multiplier" double precision NOT NULL,
	"seasons" "enum_seasons" NOT NULL,
	"image_url" varchar NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"pack_purchase_id" integer,
	"token_id" integer NOT NULL,
	"acquisition_type" "enum_acquisition_type" DEFAULT 'mint' NOT NULL,
	"is_burned" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "cards_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" varchar NOT NULL,
	"parent_comment_id" integer,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" varchar NOT NULL,
	"start_time" timestamp (3) NOT NULL,
	"end_time" timestamp (3) NOT NULL,
	"distance_m" double precision,
	"event_type" varchar,
	"jackpot" numeric(78, 0) DEFAULT '0',
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lineup_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"lineup_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"position" integer NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lineups" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition_id" integer NOT NULL,
	"manager_id" integer NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer,
	"seller_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"price" numeric(78, 0) NOT NULL,
	"highest_bid" numeric(78, 0),
	"highest_bidder_id" integer,
	"expiration_time" timestamp (3) NOT NULL,
	"signature" varchar NOT NULL,
	"order_hash" varchar NOT NULL,
	"order_data" jsonb NOT NULL,
	"transaction_hash" varchar(66) NOT NULL,
	"status" "enum_listing_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "listings_order_hash_unique" UNIQUE("order_hash")
);
--> statement-breakpoint
CREATE TABLE "manager_leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ranking" integer NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manager_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"lineup_id" integer NOT NULL,
	"total_score" double precision NOT NULL,
	"final_placement" integer,
	"reward_amount_phyt" double precision,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer NOT NULL,
	"purchase_price" numeric(78, 0) NOT NULL,
	"pack_type" "enum_pack_type" NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"run_id" integer NOT NULL,
	"status" "enum_posts_status" DEFAULT 'visible' NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"viewer_id" integer,
	"ip_address" varchar,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer,
	"comment_id" integer,
	"type" "enum_reaction_type" NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer NOT NULL,
	"post_id" integer,
	"comment_id" integer,
	"reason" "enum_report_reason" NOT NULL,
	"details" varchar,
	"status" "enum_report_status" DEFAULT 'pending',
	"reviewed_by" integer,
	"reviewed_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runner_leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"runner_id" integer NOT NULL,
	"ranking" integer NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runner_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition_id" integer NOT NULL,
	"runner_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"best_time_sec" double precision NOT NULL,
	"ranking" integer,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"average_pace" double precision,
	"total_distance_m" double precision DEFAULT 0,
	"total_runs" integer DEFAULT 0,
	"best_mile_time" double precision,
	"status" "enum_runner_status" DEFAULT 'pending' NOT NULL,
	"is_pooled" boolean DEFAULT false NOT NULL,
	"runner_wallet" varchar,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "runners_runner_wallet_unique" UNIQUE("runner_wallet")
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"runner_id" integer NOT NULL,
	"start_time" timestamp (3) NOT NULL,
	"end_time" timestamp (3) NOT NULL,
	"duration_seconds" integer NOT NULL,
	"distance_m" double precision NOT NULL,
	"average_pace_sec" double precision,
	"calories_burned" integer,
	"step_count" integer,
	"elevation_gain_m" double precision,
	"average_heart_rate" integer,
	"max_heart_rate" integer,
	"device_id" varchar,
	"gps_route_data" varchar,
	"is_posted" boolean DEFAULT false,
	"verification_status" "enum_runs_verification_status" DEFAULT 'pending',
	"raw_data_json" jsonb,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user_id" integer,
	"to_user_id" integer,
	"card_id" integer,
	"competition_id" integer,
	"price" numeric(78, 0),
	"transaction_type" "enum_transactions_transaction_type" NOT NULL,
	"pack_purchases_id" integer,
	"hash" varchar(66),
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_device_authorizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"device_type" varchar NOT NULL,
	"access_token" varchar,
	"refresh_token" varchar,
	"scopes" varchar,
	"last_synced_at" timestamp (3),
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	"username" varchar NOT NULL,
	"role" "enum_users_role" DEFAULT 'user' NOT NULL,
	"privy_id" varchar NOT NULL,
	"wallet_address" varchar NOT NULL,
	"twitter_handle" varchar,
	"strava_handle" varchar,
	"avatar_url" varchar DEFAULT 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut' NOT NULL,
	"phytness_points" integer DEFAULT 0,
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_users_id_fk" FOREIGN KEY ("bidder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_metadata" ADD CONSTRAINT "card_metadata_token_id_cards_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."cards"("token_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_metadata" ADD CONSTRAINT "card_metadata_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_pack_purchase_id_pack_purchases_id_fk" FOREIGN KEY ("pack_purchase_id") REFERENCES "public"."pack_purchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineup_cards" ADD CONSTRAINT "lineup_cards_lineup_id_lineups_id_fk" FOREIGN KEY ("lineup_id") REFERENCES "public"."lineups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineup_cards" ADD CONSTRAINT "lineup_cards_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_highest_bidder_id_users_id_fk" FOREIGN KEY ("highest_bidder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_leaderboard" ADD CONSTRAINT "manager_leaderboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_results" ADD CONSTRAINT "manager_results_lineup_id_lineups_id_fk" FOREIGN KEY ("lineup_id") REFERENCES "public"."lineups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_purchases" ADD CONSTRAINT "pack_purchases_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runner_leaderboard" ADD CONSTRAINT "runner_leaderboard_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runner_results" ADD CONSTRAINT "runner_results_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runner_results" ADD CONSTRAINT "runner_results_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runner_results" ADD CONSTRAINT "runner_results_session_id_runs_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runners" ADD CONSTRAINT "runners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runners" ADD CONSTRAINT "runners_runner_wallet_users_wallet_address_fk" FOREIGN KEY ("runner_wallet") REFERENCES "public"."users"("wallet_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_pack_purchases_id_pack_purchases_id_fk" FOREIGN KEY ("pack_purchases_id") REFERENCES "public"."pack_purchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_device_authorizations" ADD CONSTRAINT "user_device_authorizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bids_listing_idx" ON "bids" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "bids_card_idx" ON "bids" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "bids_bidder_idx" ON "bids" USING btree ("bidder_id");--> statement-breakpoint
CREATE INDEX "bids_status_idx" ON "bids" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bids_type_idx" ON "bids" USING btree ("bid_type");--> statement-breakpoint
CREATE INDEX "bids_created_at_idx" ON "bids" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bids_updated_at_idx" ON "bids" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_cards_token_id" ON "card_metadata" USING btree ("token_id");--> statement-breakpoint
CREATE INDEX "idx_card_metadata_runner_id" ON "card_metadata" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "idx_card_metadata_created_at" ON "card_metadata" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_cards_owner_id" ON "cards" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_cards_pack_purchase_id" ON "cards" USING btree ("pack_purchase_id");--> statement-breakpoint
CREATE INDEX "idx_cards_created_at" ON "cards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_cards_updated_at" ON "cards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "comments_post_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_user_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_parent_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "competitions_created_at_idx" ON "competitions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "competitions_updated_at_idx" ON "competitions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_unique_idx" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "lineup_cards_lineup_idx" ON "lineup_cards" USING btree ("lineup_id");--> statement-breakpoint
CREATE INDEX "lineup_cards_card_idx" ON "lineup_cards" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "lineup_cards_created_at_idx" ON "lineup_cards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lineup_cards_updated_at_idx" ON "lineup_cards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "lineups_competition_idx" ON "lineups" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "lineups_manager_idx" ON "lineups" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "lineups_created_at_idx" ON "lineups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lineups_updated_at_idx" ON "lineups" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "listings_card_idx" ON "listings" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "listings_seller_idx" ON "listings" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "listings_buyer_idx" ON "listings" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "listings_status_idx" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "listings_created_at_idx" ON "listings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listings_updated_at_idx" ON "listings" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "manager_leaderboard_user_idx" ON "manager_leaderboard" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "manager_leaderboard_ranking_idx" ON "manager_leaderboard" USING btree ("ranking");--> statement-breakpoint
CREATE INDEX "manager_results_lineup_idx" ON "manager_results" USING btree ("lineup_id");--> statement-breakpoint
CREATE INDEX "manager_results_created_at_idx" ON "manager_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "manager_results_updated_at_idx" ON "manager_results" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "pack_purchases_buyer_idx" ON "pack_purchases" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "pack_purchases_created_at_idx" ON "pack_purchases" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pack_purchases_updated_at_idx" ON "pack_purchases" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "posts_user_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_run_idx" ON "posts" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "profile_views_profile_idx" ON "profile_views" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "profile_views_created_at_idx" ON "profile_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "profile_views_ip_recent_idx" ON "profile_views" USING btree ("ip_address","created_at");--> statement-breakpoint
CREATE INDEX "reactions_post_idx" ON "reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "reactions_comment_idx" ON "reactions" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "reactions_user_idx" ON "reactions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reactions_post_unique_idx" ON "reactions" USING btree ("user_id","post_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "reactions_comment_unique_idx" ON "reactions" USING btree ("user_id","comment_id","type");--> statement-breakpoint
CREATE INDEX "reports_reporter_idx" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reports_post_idx" ON "reports" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "reports_comment_idx" ON "reports" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "runner_leaderboard_runner_idx" ON "runner_leaderboard" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "runner_leaderboard_ranking_idx" ON "runner_leaderboard" USING btree ("ranking");--> statement-breakpoint
CREATE INDEX "runner_results_competition_idx" ON "runner_results" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "runner_results_runner_idx" ON "runner_results" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "runner_results_session_idx" ON "runner_results" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "runner_results_created_at_idx" ON "runner_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "runner_results_updated_at_idx" ON "runner_results" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "runners_user_idx" ON "runners" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "runners_created_at_idx" ON "runners" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "runners_updated_at_idx" ON "runners" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "runs_runner_idx" ON "runs" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "runs_created_at_idx" ON "runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "runs_updated_at_idx" ON "runs" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "transactions_from_user_idx" ON "transactions" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "transactions_to_user_idx" ON "transactions" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "transactions_card_idx" ON "transactions" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "transactions_competition_idx" ON "transactions" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "transactions_hash_idx" ON "transactions" USING btree ("hash");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "user_device_authorizations_user_idx" ON "user_device_authorizations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_device_authorizations_created_at_idx" ON "user_device_authorizations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_device_authorizations_updated_at_idx" ON "user_device_authorizations" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_wallet_address_idx" ON "users" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");