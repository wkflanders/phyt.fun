CREATE UNIQUE INDEX "idx_cards_token_id" ON "card_metadata" USING btree ("token_id");--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_token_id_unique" UNIQUE("token_id");