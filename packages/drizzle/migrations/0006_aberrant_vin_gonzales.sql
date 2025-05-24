ALTER TABLE "bids" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "lineups" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "runners" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "deletedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletedAt" timestamp (3);