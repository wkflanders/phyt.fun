ALTER TABLE "transactions" RENAME COLUMN "token_amount" TO "price";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "pack_purchases_id" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_pack_purchases_id_pack_purchases_id_fk" FOREIGN KEY ("pack_purchases_id") REFERENCES "public"."pack_purchases"("id") ON DELETE set null ON UPDATE no action;