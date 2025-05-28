ALTER TABLE "cardMetadata" RENAME COLUMN "runner_name" TO "runnerName";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "pack_purchase_id" TO "packPurchaseId";--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" RENAME COLUMN "last_syncedAt" TO "lastSyncedAt";--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_pack_purchase_id_packPurchases_id_fk";
--> statement-breakpoint
DROP INDEX "lineupsCreated_atIdx";--> statement-breakpoint
DROP INDEX "lineupsUpdated_atIdx";--> statement-breakpoint
DROP INDEX "runnerResultsCreated_atIdx";--> statement-breakpoint
DROP INDEX "runnerResultsUpdated_atIdx";--> statement-breakpoint
DROP INDEX "cardsPackPurchaseIdx";--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_packPurchaseId_packPurchases_id_fk" FOREIGN KEY ("packPurchaseId") REFERENCES "public"."packPurchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lineupsCreatedAtIdx" ON "lineups" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "lineupsUpdatedAtIdx" ON "lineups" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "runnerResultsCreatedAtIdx" ON "runnerResults" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "runnerResultsUpdatedAtIdx" ON "runnerResults" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "cardsPackPurchaseIdx" ON "cards" USING btree ("packPurchaseId");