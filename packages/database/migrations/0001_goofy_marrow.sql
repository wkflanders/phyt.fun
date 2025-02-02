ALTER TYPE "public"."enum_transactions_transaction_type" ADD VALUE 'marketplaceOffer' BEFORE 'rewardPayout';--> statement-breakpoint
ALTER TYPE "public"."enum_transactions_transaction_type" ADD VALUE 'marketplaceListing' BEFORE 'rewardPayout';--> statement-breakpoint
CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"price" double precision NOT NULL,
	"payment_token" varchar(42) NOT NULL,
	"expiration_time" timestamp (3) NOT NULL,
	"signature" varchar NOT NULL,
	"salt" varchar NOT NULL,
	"active" boolean DEFAULT true,
	"updated_at" timestamp (3) DEFAULT now(),
	"created_at" timestamp (3) DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "listed_price" TO "price";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "is_active" TO "active";--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "payment_token" varchar(42) NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "expiration_time" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "signature" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "salt" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "offers_card_idx" ON "offers" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "offers_buyer_idx" ON "offers" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "offers_active_idx" ON "offers" USING btree ("active");--> statement-breakpoint
CREATE INDEX "offers_created_at_idx" ON "offers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "offers_updated_at_idx" ON "offers" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "listings_active_idx" ON "listings" USING btree ("active");