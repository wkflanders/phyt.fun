ALTER TABLE "follows" RENAME COLUMN "following_id" TO "follow_target_id";--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_following_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "follows_following_idx";--> statement-breakpoint
DROP INDEX "follows_unique_idx";--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follow_target_id_users_id_fk" FOREIGN KEY ("follow_target_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("follow_target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_unique_idx" ON "follows" USING btree ("follower_id","follow_target_id");