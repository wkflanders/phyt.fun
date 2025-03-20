CREATE TYPE "public"."enum_pack_type" AS ENUM('scrawny', 'toned', 'swole', 'phyt');--> statement-breakpoint
ALTER TABLE "pack_purchases" ADD COLUMN "pack_type" "enum_pack_type" NOT NULL;