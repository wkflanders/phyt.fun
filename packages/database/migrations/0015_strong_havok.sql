CREATE TYPE "public"."enum_seasons" AS ENUM('season_0');--> statement-breakpoint
ALTER TABLE "card_metadata" ADD COLUMN "seasons" "enum_seasons" NOT NULL;