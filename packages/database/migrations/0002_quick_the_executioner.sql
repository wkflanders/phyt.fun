CREATE TYPE "public"."enum_acquisition_type" AS ENUM('mint', 'transfer', 'marketplace');--> statement-breakpoint
CREATE TABLE "card_metadata" (
	"token_id" integer PRIMARY KEY NOT NULL,
	"runner_id" integer NOT NULL,
	"runner_name" varchar NOT NULL,
	"rarity" "enum_cards_rarity" NOT NULL,
	"multiplier" numeric NOT NULL,
	"image_url" varchar NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pack_purchases_card_ids" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "pack_purchases_card_ids" CASCADE;--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_runner_id_runners_id_fk";
--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_current_owner_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "cards_created_at_idx";--> statement-breakpoint
DROP INDEX "cards_current_owner_idx";--> statement-breakpoint
DROP INDEX "cards_runner_idx";--> statement-breakpoint
DROP INDEX "cards_updated_at_idx";--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "owner_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "pack_purchase_id" integer;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "acquisition_type" "enum_acquisition_type" DEFAULT 'mint' NOT NULL;--> statement-breakpoint
ALTER TABLE "card_metadata" ADD CONSTRAINT "card_metadata_token_id_cards_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_metadata" ADD CONSTRAINT "card_metadata_runner_id_runners_id_fk" FOREIGN KEY ("runner_id") REFERENCES "public"."runners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_card_metadata_runner_id" ON "card_metadata" USING btree ("runner_id");--> statement-breakpoint
CREATE INDEX "idx_card_metadata_created_at" ON "card_metadata" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_pack_purchase_id_pack_purchases_id_fk" FOREIGN KEY ("pack_purchase_id") REFERENCES "public"."pack_purchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cards_owner_id" ON "cards" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_cards_created_at" ON "cards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_cards_updated_at" ON "cards" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_cards_pack_purchase_id" ON "cards" USING btree ("pack_purchase_id");--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "runner_id";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "current_owner_id";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "rarity";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "multiplier";--> statement-breakpoint
ALTER TABLE "public"."card_metadata" ALTER COLUMN "rarity" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."enum_cards_rarity";--> statement-breakpoint
CREATE TYPE "public"."enum_cards_rarity" AS ENUM('bronze', 'silver', 'gold', 'sapphire', 'ruby', 'opal');--> statement-breakpoint
ALTER TABLE "public"."card_metadata" ALTER COLUMN "rarity" SET DATA TYPE "public"."enum_cards_rarity" USING "rarity"::"public"."enum_cards_rarity";