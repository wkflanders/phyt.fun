ALTER TABLE "transactions" RENAME COLUMN "packPurchasesId" TO "packPurchaseId";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_packPurchasesId_packPurchases_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_packPurchaseId_packPurchases_id_fk" FOREIGN KEY ("packPurchaseId") REFERENCES "public"."packPurchases"("id") ON DELETE set null ON UPDATE no action;