ALTER TABLE "transactions" ALTER COLUMN "fromUserId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "toUserId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "cardId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "price" SET NOT NULL;