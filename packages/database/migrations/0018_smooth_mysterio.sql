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
	"reward_amount_p_h_y_t" double precision,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gambler_leaderboard" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gambler_results" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "gambler_leaderboard" CASCADE;--> statement-breakpoint
DROP TABLE "gambler_results" CASCADE;--> statement-breakpoint
ALTER TABLE "lineups" DROP CONSTRAINT "lineups_gambler_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "lineups_gambler_idx";--> statement-breakpoint
ALTER TABLE "lineups" ADD COLUMN "manager_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "manager_leaderboard" ADD CONSTRAINT "manager_leaderboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_results" ADD CONSTRAINT "manager_results_lineup_id_lineups_id_fk" FOREIGN KEY ("lineup_id") REFERENCES "public"."lineups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "manager_leaderboard_user_idx" ON "manager_leaderboard" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "manager_leaderboard_ranking_idx" ON "manager_leaderboard" USING btree ("ranking");--> statement-breakpoint
CREATE INDEX "manager_results_lineup_idx" ON "manager_results" USING btree ("lineup_id");--> statement-breakpoint
CREATE INDEX "manager_results_created_at_idx" ON "manager_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "manager_results_updated_at_idx" ON "manager_results" USING btree ("updated_at");--> statement-breakpoint
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lineups_manager_idx" ON "lineups" USING btree ("manager_id");--> statement-breakpoint
ALTER TABLE "lineups" DROP COLUMN "gambler_id";