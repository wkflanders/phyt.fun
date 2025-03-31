ALTER TABLE "runners" ALTER COLUMN "total_runs" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "runners" ALTER COLUMN "runner_wallet" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "verification_status" SET NOT NULL;