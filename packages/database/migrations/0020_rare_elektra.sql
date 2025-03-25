DROP INDEX "manager_leaderboard_user_idx";--> statement-breakpoint
DROP INDEX "runner_leaderboard_runner_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "manager_leaderboard_user_idx" ON "manager_leaderboard" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "runner_leaderboard_runner_idx" ON "runner_leaderboard" USING btree ("runner_id");