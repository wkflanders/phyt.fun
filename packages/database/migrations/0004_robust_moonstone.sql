CREATE TYPE "public"."enum_runner_status" AS ENUM('pending', 'active', 'inactive');--> statement-breakpoint
ALTER TABLE "runners" ADD COLUMN "status" "enum_runner_status" DEFAULT 'pending';