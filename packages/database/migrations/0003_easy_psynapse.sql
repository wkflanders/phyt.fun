ALTER TABLE "runs" DROP CONSTRAINT "runs_runner_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "competitions_created_at_idx";--> statement-breakpoint
DROP INDEX "competitions_updated_at_idx";--> statement-breakpoint
DROP INDEX "gambler_results_created_at_idx";--> statement-breakpoint
DROP INDEX "gambler_results_lineup_idx";--> statement-breakpoint
DROP INDEX "gambler_results_updated_at_idx";--> statement-breakpoint
DROP INDEX "lineup_cards_card_idx";--> statement-breakpoint
DROP INDEX "lineup_cards_created_at_idx";--> statement-breakpoint
DROP INDEX "lineup_cards_lineup_idx";--> statement-breakpoint
DROP INDEX "lineup_cards_updated_at_idx";--> statement-breakpoint
DROP INDEX "lineups_competition_idx";--> statement-breakpoint
DROP INDEX "lineups_created_at_idx";--> statement-breakpoint
DROP INDEX "lineups_gambler_idx";--> statement-breakpoint
DROP INDEX "lineups_updated_at_idx";--> statement-breakpoint
DROP INDEX "listings_card_idx";--> statement-breakpoint
DROP INDEX "listings_created_at_idx";--> statement-breakpoint
DROP INDEX "listings_seller_idx";--> statement-breakpoint
DROP INDEX "listings_updated_at_idx";--> statement-breakpoint
DROP INDEX "pack_purchases_buyer_idx";--> statement-breakpoint
DROP INDEX "pack_purchases_created_at_idx";--> statement-breakpoint
DROP INDEX "pack_purchases_updated_at_idx";--> statement-breakpoint
DROP INDEX "runner_results_competition_idx";--> statement-breakpoint
DROP INDEX "runner_results_created_at_idx";--> statement-breakpoint
DROP INDEX "runner_results_runner_idx";--> statement-breakpoint
DROP INDEX "runner_results_session_idx";--> statement-breakpoint
DROP INDEX "runner_results_updated_at_idx";--> statement-breakpoint
DROP INDEX "runners_created_at_idx";--> statement-breakpoint
DROP INDEX "runners_updated_at_idx";--> statement-breakpoint
DROP INDEX "runners_user_idx";--> statement-breakpoint
DROP INDEX "runs_created_at_idx";--> statement-breakpoint
DROP INDEX "runs_runner_idx";--> statement-breakpoint
DROP INDEX "runs_updated_at_idx";--> statement-breakpoint
DROP INDEX "transactions_card_idx";--> statement-breakpoint
DROP INDEX "transactions_competition_idx";--> statement-breakpoint
DROP INDEX "transactions_created_at_idx";--> statement-breakpoint
DROP INDEX "transactions_from_user_idx";--> statement-breakpoint
DROP INDEX "transactions_to_user_idx";--> statement-breakpoint
DROP INDEX "transactions_updated_at_idx";--> statement-breakpoint
DROP INDEX "user_device_authorizations_created_at_idx";--> statement-breakpoint
DROP INDEX "user_device_authorizations_updated_at_idx";--> statement-breakpoint
DROP INDEX "user_device_authorizations_user_idx";--> statement-breakpoint
DROP INDEX "users_created_at_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
DROP INDEX "users_updated_at_idx";--> statement-breakpoint
DROP INDEX "users_username_idx";--> statement-breakpoint
ALTER TABLE "card_metadata" ALTER COLUMN "multiplier" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "distance_m" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "gambler_results" ALTER COLUMN "total_score" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "gambler_results" ALTER COLUMN "final_placement" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "gambler_results" ALTER COLUMN "reward_amount_p_h_y_t" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "lineup_cards" ALTER COLUMN "position" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "listed_price" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "pack_purchases" ALTER COLUMN "purchase_price" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runner_results" ALTER COLUMN "best_time_sec" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runner_results" ALTER COLUMN "ranking" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "runners" ALTER COLUMN "average_pace" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runners" ALTER COLUMN "total_distance_m" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runners" ALTER COLUMN "total_distance_m" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "runners" ALTER COLUMN "total_runs" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "runners" ALTER COLUMN "total_runs" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "runners" ALTER COLUMN "best_mile_time" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "duration_seconds" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "distance_m" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "average_pace_sec" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "calories_burned" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "step_count" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "elevation_gain_m" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "average_heart_rate" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "max_heart_rate" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "token_amount" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "raw_data_json" jsonb;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "competitions_created_at_idx" ON "competitions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "competitions_updated_at_idx" ON "competitions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "gambler_results_created_at_idx" ON "gambler_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "gambler_results_lineup_idx" ON "gambler_results" USING btree ("lineup_id");--> statement-breakpoint
CREATE INDEX "gambler_results_updated_at_idx" ON "gambler_results" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "lineup_cards_card_idx" ON "lineup_cards" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "lineup_cards_created_at_idx" ON "lineup_cards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lineup_cards_lineup_idx" ON "lineup_cards" USING btree ("lineup_id");--> statement-breakpoint
CREATE INDEX "lineup_cards_updated_at_idx" ON "lineup_cards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "lineups_competition_idx" ON "lineups" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "lineups_created_at_idx" ON "lineups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lineups_gambler_idx" ON "lineups" USING btree ("gambler_id");--> statement-breakpoint
CREATE INDEX "lineups_updated_at_idx" ON "lineups" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "listings_card_idx" ON "listings" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "listings_created_at_idx" ON "listings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listings_seller_idx" ON "listings" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "listings_updated_at_idx" ON "listings" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "pack_purchases_buyer_idx" ON "pack_purchases" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "pack_purchases_created_at_idx" ON "pack_purchases" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pack_purchases_updated_at_idx" ON "pack_purchases" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "runner_results_competition_idx" ON "runner_results" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "runner_results_created_at_idx" ON "runner_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "runner_results_runner_idx" ON "runner_results" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "runner_results_session_idx" ON "runner_results" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "runner_results_updated_at_idx" ON "runner_results" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "runners_created_at_idx" ON "runners" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "runners_updated_at_idx" ON "runners" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "runners_user_idx" ON "runners" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "runs_created_at_idx" ON "runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "runs_runner_idx" ON "runs" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "runs_updated_at_idx" ON "runs" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "transactions_card_idx" ON "transactions" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "transactions_competition_idx" ON "transactions" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_from_user_idx" ON "transactions" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "transactions_to_user_idx" ON "transactions" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "user_device_authorizations_created_at_idx" ON "user_device_authorizations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_device_authorizations_updated_at_idx" ON "user_device_authorizations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "user_device_authorizations_user_idx" ON "user_device_authorizations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
ALTER TABLE "runs" DROP COLUMN "raw_data_j_s_o_n";