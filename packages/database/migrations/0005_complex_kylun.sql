ALTER TABLE "card_metadata" DROP CONSTRAINT "card_metadata_token_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "token_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "card_metadata" ADD CONSTRAINT "card_metadata_token_id_cards_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."cards"("token_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_token_id_unique" UNIQUE("token_id");