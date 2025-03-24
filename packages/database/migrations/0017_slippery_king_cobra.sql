CREATE TABLE "runner_leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"runner_id" integer NOT NULL,
	"ranking" integer NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leaderboard" RENAME TO "gambler_leaderboard";--> statement-breakpoint
ALTER TABLE "gambler_leaderboard" DROP CONSTRAINT "leaderboard_runner_id_runners_id_fk";
--> statement-breakpoint
DROP INDEX "leaderboard_runner_idx";--> statement-breakpoint
DROP INDEX "leaderboard_ranking_idx";--> statement-breakpoint
DROP INDEX "leaderboard_season_points_idx";--> statement-breakpoint
DROP INDEX "leaderboard_weekly_points_idx";--> statement-breakpoint
DROP INDEX "leaderboard_competition_points_idx";--> statement-breakpoint
DROP INDEX "leaderboard_created_at_idx";--> statement-breakpoint
DROP INDEX "leaderboard_updated_at_idx";--> statement-breakpoint
ALTER TABLE "gambler_leaderboard" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "runner_leaderboard" ADD CONSTRAINT "runner_leaderboard_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "runner_leaderboard_runner_idx" ON "runner_leaderboard" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "runner_leaderboard_ranking_idx" ON "runner_leaderboard" USING btree ("ranking");--> statement-breakpoint
ALTER TABLE "gambler_leaderboard" ADD CONSTRAINT "gambler_leaderboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gambler_leaderboard_user_idx" ON "gambler_leaderboard" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gambler_leaderboard_ranking_idx" ON "gambler_leaderboard" USING btree ("ranking");--> statement-breakpoint
ALTER TABLE "gambler_leaderboard" DROP COLUMN "runner_id";--> statement-breakpoint
ALTER TABLE "gambler_leaderboard" DROP COLUMN "season_points";--> statement-breakpoint
ALTER TABLE "gambler_leaderboard" DROP COLUMN "weekly_points";--> statement-breakpoint
ALTER TABLE "gambler_leaderboard" DROP COLUMN "competition_points";