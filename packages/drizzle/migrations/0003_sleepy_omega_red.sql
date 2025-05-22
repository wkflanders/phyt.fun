CREATE TYPE "public"."enumTransactionStatus" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "status" "enumTransactionStatus" NOT NULL;