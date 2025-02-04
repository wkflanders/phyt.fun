ALTER TABLE "offers" RENAME TO "bids";--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "offers_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "offers_buyer_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "listings_active_idx";--> statement-breakpoint
DROP INDEX "offers_card_idx";--> statement-breakpoint
DROP INDEX "offers_buyer_idx";--> statement-breakpoint
DROP INDEX "offers_active_idx";--> statement-breakpoint
DROP INDEX "offers_created_at_idx";--> statement-breakpoint
DROP INDEX "offers_updated_at_idx";--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "price" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "price" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "buyer_id" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "order_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "order_data" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "status" varchar DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "transaction_hash" varchar(66);--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "highest_bid" varchar;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "highest_bidder_id" integer;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "listing_id" integer;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "bidder_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "order_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "order_data" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "bid_type" varchar DEFAULT 'listing' NOT NULL;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "status" varchar DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "accepted_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_highest_bidder_id_users_id_fk" FOREIGN KEY ("highest_bidder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_users_id_fk" FOREIGN KEY ("bidder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listings_buyer_idx" ON "listings" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "listings_status_idx" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bids_listing_idx" ON "bids" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "bids_card_idx" ON "bids" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "bids_bidder_idx" ON "bids" USING btree ("bidder_id");--> statement-breakpoint
CREATE INDEX "bids_status_idx" ON "bids" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bids_type_idx" ON "bids" USING btree ("bid_type");--> statement-breakpoint
CREATE INDEX "bids_created_at_idx" ON "bids" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bids_updated_at_idx" ON "bids" USING btree ("updated_at");--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "payment_token";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "salt";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "active";--> statement-breakpoint
ALTER TABLE "bids" DROP COLUMN "buyer_id";--> statement-breakpoint
ALTER TABLE "bids" DROP COLUMN "payment_token";--> statement-breakpoint
ALTER TABLE "bids" DROP COLUMN "salt";--> statement-breakpoint
ALTER TABLE "bids" DROP COLUMN "active";--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_order_hash_unique" UNIQUE("order_hash");--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_order_hash_unique" UNIQUE("order_hash");