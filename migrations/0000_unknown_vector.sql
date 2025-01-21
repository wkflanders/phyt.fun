
CREATE TYPE "public"."enum_cards_rarity" AS ENUM('Common', 'Rare', 'Exotic', 'Legendary');--> statement-breakpoint
CREATE TYPE "public"."enum_runs_verification_status" AS ENUM('pending', 'verified', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."enum_transactions_transaction_type" AS ENUM('packPurchase', 'marketplaceSale', 'rewardPayout');--> statement-breakpoint
CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user', 'runner');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	"username" varchar NOT NULL,
	"role" "enum_users_role" DEFAULT 'user' NOT NULL,
	"privy_id" varchar,
	"wallet_address" varchar
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"runner_id" integer NOT NULL,
	"start_time" timestamp(3) with time zone NOT NULL,
	"end_time" timestamp(3) with time zone NOT NULL,
	"duration_seconds" numeric NOT NULL,
	"distance_m" numeric NOT NULL,
	"average_pace_sec" numeric,
	"calories_burned" numeric,
	"step_count" numeric,
	"elevation_gain_m" numeric,
	"average_heart_rate" numeric,
	"max_heart_rate" numeric,
	"device_id" varchar,
	"gps_route_data" varchar,
	"verification_status" "enum_runs_verification_status" DEFAULT 'pending',
	"raw_data_j_s_o_n" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"runner_id" integer NOT NULL,
	"current_owner_id" integer NOT NULL,
	"rarity" "enum_cards_rarity" DEFAULT 'Common' NOT NULL,
	"multiplier" numeric DEFAULT '1' NOT NULL,
	"is_burned" boolean DEFAULT false,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" varchar NOT NULL,
	"start_time" timestamp(3) with time zone NOT NULL,
	"end_time" timestamp(3) with time zone NOT NULL,
	"distance_m" numeric,
	"event_type" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lineups" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition_id" integer NOT NULL,
	"gambler_id" integer NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lineup_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"lineup_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"position" numeric NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"average_pace" numeric,
	"total_distance_m" numeric DEFAULT '0',
	"total_runs" numeric DEFAULT '0',
	"best_mile_time" numeric,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runner_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition_id" integer NOT NULL,
	"runner_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"best_time_sec" numeric NOT NULL,
	"ranking" numeric,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gambler_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"lineup_id" integer NOT NULL,
	"total_score" numeric NOT NULL,
	"final_placement" numeric,
	"reward_amount_p_h_y_t" numeric,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user_id" integer,
	"to_user_id" integer,
	"card_id" integer,
	"competition_id" integer,
	"token_amount" numeric,
	"transaction_type" "enum_transactions_transaction_type" NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_purchases_card_ids" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"card_id" integer
);
--> statement-breakpoint
CREATE TABLE "pack_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer NOT NULL,
	"purchase_price" numeric NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"listed_price" numeric NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_device_authorizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"device_type" varchar NOT NULL,
	"access_token" varchar,
	"refresh_token" varchar,
	"scopes" varchar,
	"last_synced_at" timestamp(3) with time zone,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_runner_id_users_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_current_owner_id_users_id_fk" FOREIGN KEY ("current_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_gambler_id_users_id_fk" FOREIGN KEY ("gambler_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineup_cards" ADD CONSTRAINT "lineup_cards_lineup_id_lineups_id_fk" FOREIGN KEY ("lineup_id") REFERENCES "public"."lineups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineup_cards" ADD CONSTRAINT "lineup_cards_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runners" ADD CONSTRAINT "runners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runner_results" ADD CONSTRAINT "runner_results_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runner_results" ADD CONSTRAINT "runner_results_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runner_results" ADD CONSTRAINT "runner_results_session_id_runs_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gambler_results" ADD CONSTRAINT "gambler_results_lineup_id_lineups_id_fk" FOREIGN KEY ("lineup_id") REFERENCES "public"."lineups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_purchases_card_ids" ADD CONSTRAINT "pack_purchases_card_ids_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_purchases_card_ids" ADD CONSTRAINT "pack_purchases_card_ids_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pack_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_purchases" ADD CONSTRAINT "pack_purchases_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_device_authorizations" ADD CONSTRAINT "user_device_authorizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username" text_ops);--> statement-breakpoint
CREATE INDEX "runs_created_at_idx" ON "runs" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "runs_runner_idx" ON "runs" USING btree ("runner_id" int4_ops);--> statement-breakpoint
CREATE INDEX "runs_updated_at_idx" ON "runs" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "cards_created_at_idx" ON "cards" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "cards_current_owner_idx" ON "cards" USING btree ("current_owner_id" int4_ops);--> statement-breakpoint
CREATE INDEX "cards_runner_idx" ON "cards" USING btree ("runner_id" int4_ops);--> statement-breakpoint
CREATE INDEX "cards_updated_at_idx" ON "cards" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "competitions_created_at_idx" ON "competitions" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "competitions_updated_at_idx" ON "competitions" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "lineups_competition_idx" ON "lineups" USING btree ("competition_id" int4_ops);--> statement-breakpoint
CREATE INDEX "lineups_created_at_idx" ON "lineups" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "lineups_gambler_idx" ON "lineups" USING btree ("gambler_id" int4_ops);--> statement-breakpoint
CREATE INDEX "lineups_updated_at_idx" ON "lineups" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "lineup_cards_card_idx" ON "lineup_cards" USING btree ("card_id" int4_ops);--> statement-breakpoint
CREATE INDEX "lineup_cards_created_at_idx" ON "lineup_cards" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "lineup_cards_lineup_idx" ON "lineup_cards" USING btree ("lineup_id" int4_ops);--> statement-breakpoint
CREATE INDEX "lineup_cards_updated_at_idx" ON "lineup_cards" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "runners_created_at_idx" ON "runners" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "runners_updated_at_idx" ON "runners" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "runners_user_idx" ON "runners" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "runner_results_competition_idx" ON "runner_results" USING btree ("competition_id" int4_ops);--> statement-breakpoint
CREATE INDEX "runner_results_created_at_idx" ON "runner_results" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "runner_results_runner_idx" ON "runner_results" USING btree ("runner_id" int4_ops);--> statement-breakpoint
CREATE INDEX "runner_results_session_idx" ON "runner_results" USING btree ("session_id" int4_ops);--> statement-breakpoint
CREATE INDEX "runner_results_updated_at_idx" ON "runner_results" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "gambler_results_created_at_idx" ON "gambler_results" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "gambler_results_lineup_idx" ON "gambler_results" USING btree ("lineup_id" int4_ops);--> statement-breakpoint
CREATE INDEX "gambler_results_updated_at_idx" ON "gambler_results" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "transactions_card_idx" ON "transactions" USING btree ("card_id" int4_ops);--> statement-breakpoint
CREATE INDEX "transactions_competition_idx" ON "transactions" USING btree ("competition_id" int4_ops);--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "transactions_from_user_idx" ON "transactions" USING btree ("from_user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "transactions_to_user_idx" ON "transactions" USING btree ("to_user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "pack_purchases_card_ids_card_idx" ON "pack_purchases_card_ids" USING btree ("card_id" int4_ops);--> statement-breakpoint
CREATE INDEX "pack_purchases_card_ids_order_idx" ON "pack_purchases_card_ids" USING btree ("_order" int4_ops);--> statement-breakpoint
CREATE INDEX "pack_purchases_card_ids_parent_id_idx" ON "pack_purchases_card_ids" USING btree ("_parent_id" int4_ops);--> statement-breakpoint
CREATE INDEX "pack_purchases_buyer_idx" ON "pack_purchases" USING btree ("buyer_id" int4_ops);--> statement-breakpoint
CREATE INDEX "pack_purchases_created_at_idx" ON "pack_purchases" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "pack_purchases_updated_at_idx" ON "pack_purchases" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "listings_card_idx" ON "listings" USING btree ("card_id" int4_ops);--> statement-breakpoint
CREATE INDEX "listings_created_at_idx" ON "listings" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "listings_seller_idx" ON "listings" USING btree ("seller_id" int4_ops);--> statement-breakpoint
CREATE INDEX "listings_updated_at_idx" ON "listings" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "user_device_authorizations_created_at_idx" ON "user_device_authorizations" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "user_device_authorizations_updated_at_idx" ON "user_device_authorizations" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "user_device_authorizations_user_idx" ON "user_device_authorizations" USING btree ("user_id" int4_ops);
*/