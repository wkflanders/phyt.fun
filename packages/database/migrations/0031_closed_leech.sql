ALTER TABLE "bids" ALTER COLUMN "price" SET DATA TYPE numeric(78, 0) USING "price"::numeric;
--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "jackpot" SET DATA TYPE numeric(78, 0) USING "jackpot"::numeric;
--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "jackpot" SET DEFAULT '0'; -- This line is okay, sets the default *after* type change
--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "price" SET DATA TYPE numeric(78, 0) USING "price"::numeric;
--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "highest_bid" SET DATA TYPE numeric(78, 0) USING "highest_bid"::numeric;
--> statement-breakpoint
ALTER TABLE "pack_purchases" ALTER COLUMN "purchase_price" SET DATA TYPE numeric(78, 0) USING "purchase_price"::numeric;
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "price" SET DATA TYPE numeric(78, 0) USING "price"::numeric;