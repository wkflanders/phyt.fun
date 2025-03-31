CREATE TYPE "public"."enum_listing_status" AS ENUM('active', 'expiring', 'starting', 'expired', 'innactive');--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "accepted_at" DROP NOT NULL;