CREATE TABLE "leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"runner_id" integer NOT NULL,
	"ranking" integer NOT NULL,
	"season_points" integer NOT NULL,
	"weekly_points" integer NOT NULL,
	"competition_points" integer NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leaderboard_runner_idx" ON "leaderboard" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "leaderboard_ranking_idx" ON "leaderboard" USING btree ("ranking");--> statement-breakpoint
CREATE INDEX "leaderboard_season_points_idx" ON "leaderboard" USING btree ("season_points");--> statement-breakpoint
CREATE INDEX "leaderboard_weekly_points_idx" ON "leaderboard" USING btree ("weekly_points");--> statement-breakpoint
CREATE INDEX "leaderboard_competition_points_idx" ON "leaderboard" USING btree ("competition_points");--> statement-breakpoint
CREATE INDEX "leaderboard_created_at_idx" ON "leaderboard" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leaderboard_updated_at_idx" ON "leaderboard" USING btree ("updated_at");