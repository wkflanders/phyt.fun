CREATE TYPE "public"."enumAcquisitionType" AS ENUM('mint', 'transfer', 'marketplace');--> statement-breakpoint
CREATE TYPE "public"."enumBidStatus" AS ENUM('active', 'filled', 'topbid', 'outbid', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."enumBidType" AS ENUM('listing', 'open');--> statement-breakpoint
CREATE TYPE "public"."enumCardsRarity" AS ENUM('bronze', 'silver', 'gold', 'sapphire', 'ruby', 'opal');--> statement-breakpoint
CREATE TYPE "public"."enumListingStatus" AS ENUM('active', 'expiring', 'starting', 'expired', 'inactive', 'fulfilled');--> statement-breakpoint
CREATE TYPE "public"."enumPackType" AS ENUM('scrawny', 'toned', 'swole', 'phyt');--> statement-breakpoint
CREATE TYPE "public"."enumPostsStatus" AS ENUM('visible', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."enumReactionType" AS ENUM('like', 'funny', 'insightful', 'fire');--> statement-breakpoint
CREATE TYPE "public"."enumReportReason" AS ENUM('spam', 'harassment', 'inappropriate', 'other');--> statement-breakpoint
CREATE TYPE "public"."enumReportStatus" AS ENUM('pending', 'reviewed', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."enumRunnerStatus" AS ENUM('pending', 'active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."enumRunsVerificationStatus" AS ENUM('pending', 'verified', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."enumSeasons" AS ENUM('season_0');--> statement-breakpoint
CREATE TYPE "public"."enumTransactionStatus" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."enumTransactionsTransactionType" AS ENUM('packPurchase', 'marketplaceSale', 'marketplaceOffer', 'marketplaceListing', 'rewardPayout');--> statement-breakpoint
CREATE TYPE "public"."enumUsersRole" AS ENUM('admin', 'user', 'runner');--> statement-breakpoint
CREATE TABLE "bids" (
	"id" uuid PRIMARY KEY NOT NULL,
	"listingId" uuid,
	"cardId" uuid NOT NULL,
	"bidderId" uuid NOT NULL,
	"price" numeric(78, 0) NOT NULL,
	"bidAmount" numeric(78, 0) NOT NULL,
	"signature" varchar NOT NULL,
	"orderHash" varchar NOT NULL,
	"orderData" jsonb NOT NULL,
	"bidType" "enumBidType" DEFAULT 'listing' NOT NULL,
	"status" "enumBidStatus" DEFAULT 'active' NOT NULL,
	"expirationTime" timestamp (3) NOT NULL,
	"acceptedAt" timestamp (3),
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3),
	CONSTRAINT "bids_orderHash_unique" UNIQUE("orderHash")
);
--> statement-breakpoint
CREATE TABLE "cardMetadata" (
	"tokenId" serial PRIMARY KEY NOT NULL,
	"runnerId" uuid NOT NULL,
	"runnerName" varchar NOT NULL,
	"rarity" "enumCardsRarity" NOT NULL,
	"multiplier" double precision NOT NULL,
	"seasons" "enumSeasons" NOT NULL,
	"imageUrl" varchar NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"ownerId" uuid NOT NULL,
	"packPurchaseId" uuid NOT NULL,
	"tokenId" integer NOT NULL,
	"acquisitionType" "enumAcquisitionType" DEFAULT 'mint' NOT NULL,
	"isBurned" boolean DEFAULT false NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "cards_tokenId_unique" UNIQUE("tokenId")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"content" varchar NOT NULL,
	"parentCommentId" uuid,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"eventName" varchar NOT NULL,
	"startTime" timestamp (3) NOT NULL,
	"endTime" timestamp (3) NOT NULL,
	"distance" double precision,
	"eventType" varchar,
	"jackpot" numeric(78, 0) DEFAULT '0',
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" uuid PRIMARY KEY NOT NULL,
	"followerId" uuid NOT NULL,
	"followTargetId" uuid NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "lineupCards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lineupId" uuid NOT NULL,
	"cardId" uuid NOT NULL,
	"position" integer NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lineups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"competitionId" uuid NOT NULL,
	"managerId" uuid NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"buyerId" uuid,
	"sellerId" uuid NOT NULL,
	"cardId" uuid NOT NULL,
	"price" numeric(78, 0) NOT NULL,
	"highestBid" numeric(78, 0),
	"highestBidderId" uuid,
	"expirationTime" timestamp (3) NOT NULL,
	"signature" varchar NOT NULL,
	"orderHash" varchar NOT NULL,
	"orderData" jsonb NOT NULL,
	"transactionHash" varchar(66) NOT NULL,
	"status" "enumListingStatus" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3),
	CONSTRAINT "listings_orderHash_unique" UNIQUE("orderHash")
);
--> statement-breakpoint
CREATE TABLE "managerLeaderboard" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"ranking" integer NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "managerResults" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lineupId" uuid NOT NULL,
	"totalScore" double precision NOT NULL,
	"finalPlacement" integer,
	"rewardAmountPhyt" double precision,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packPurchases" (
	"id" uuid PRIMARY KEY NOT NULL,
	"buyerId" uuid NOT NULL,
	"purchasePrice" numeric(78, 0) NOT NULL,
	"packType" "enumPackType" NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"runId" uuid,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"status" "enumPostsStatus" DEFAULT 'visible' NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "profileViews" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profileId" uuid NOT NULL,
	"viewerId" uuid,
	"ipAddress" varchar,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"postId" uuid,
	"commentId" uuid,
	"type" "enumReactionType" NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reporterId" uuid NOT NULL,
	"postId" uuid,
	"commentId" uuid,
	"reason" "enumReportReason" NOT NULL,
	"details" varchar,
	"status" "enumReportStatus" DEFAULT 'pending',
	"reviewedBy" uuid,
	"reviewedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runnerLeaderboard" (
	"id" uuid PRIMARY KEY NOT NULL,
	"runnerId" uuid NOT NULL,
	"ranking" integer NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runnerResults" (
	"id" uuid PRIMARY KEY NOT NULL,
	"competitionId" uuid NOT NULL,
	"runnerId" uuid NOT NULL,
	"sessionId" uuid NOT NULL,
	"bestTimeSec" double precision NOT NULL,
	"ranking" integer,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runners" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"averagePace" double precision,
	"totalDistance" double precision DEFAULT 0 NOT NULL,
	"totalRuns" integer DEFAULT 0 NOT NULL,
	"bestMileTime" double precision,
	"status" "enumRunnerStatus" DEFAULT 'pending' NOT NULL,
	"isPooled" boolean DEFAULT false NOT NULL,
	"runnerWallet" varchar NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3),
	CONSTRAINT "runners_runnerWallet_unique" UNIQUE("runnerWallet")
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"runnerId" uuid NOT NULL,
	"startTime" timestamp (3) NOT NULL,
	"endTime" timestamp (3) NOT NULL,
	"durationSeconds" integer NOT NULL,
	"distance" double precision NOT NULL,
	"averagePaceSec" double precision,
	"caloriesBurned" integer,
	"stepCount" integer,
	"elevationGain" double precision,
	"averageHeartRate" integer,
	"maxHeartRate" integer,
	"deviceId" varchar,
	"gpsRouteData" varchar,
	"isPosted" boolean DEFAULT false,
	"verificationStatus" "enumRunsVerificationStatus" DEFAULT 'pending' NOT NULL,
	"rawDataJson" jsonb,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"fromUserId" uuid NOT NULL,
	"toUserId" uuid NOT NULL,
	"cardId" uuid NOT NULL,
	"competitionId" uuid,
	"price" numeric(78, 0) NOT NULL,
	"transactionType" "enumTransactionsTransactionType" NOT NULL,
	"packPurchaseId" uuid,
	"status" "enumTransactionStatus" NOT NULL,
	"hash" varchar(66) NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userDeviceAuthorizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"deviceType" varchar NOT NULL,
	"accessToken" varchar,
	"refreshToken" varchar,
	"scopes" varchar,
	"lastSyncedAt" timestamp (3),
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3),
	"email" varchar NOT NULL,
	"username" varchar NOT NULL,
	"role" "enumUsersRole" DEFAULT 'user' NOT NULL,
	"privyId" varchar NOT NULL,
	"walletAddress" varchar NOT NULL,
	"twitterHandle" varchar,
	"stravaHandle" varchar,
	"avatarUrl" varchar DEFAULT 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut' NOT NULL,
	"phytnessPoints" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_walletAddress_unique" UNIQUE("walletAddress")
);
--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_listingId_listings_id_fk" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_cardId_cards_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidderId_users_id_fk" FOREIGN KEY ("bidderId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardMetadata" ADD CONSTRAINT "cardMetadata_tokenId_cards_tokenId_fk" FOREIGN KEY ("tokenId") REFERENCES "public"."cards"("tokenId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardMetadata" ADD CONSTRAINT "cardMetadata_runnerId_runners_id_fk" FOREIGN KEY ("runnerId") REFERENCES "public"."runners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_packPurchaseId_packPurchases_id_fk" FOREIGN KEY ("packPurchaseId") REFERENCES "public"."packPurchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_comments_id_fk" FOREIGN KEY ("parentCommentId") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_users_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followTargetId_users_id_fk" FOREIGN KEY ("followTargetId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineupCards" ADD CONSTRAINT "lineupCards_lineupId_lineups_id_fk" FOREIGN KEY ("lineupId") REFERENCES "public"."lineups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineupCards" ADD CONSTRAINT "lineupCards_cardId_cards_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_competitionId_competitions_id_fk" FOREIGN KEY ("competitionId") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_managerId_users_id_fk" FOREIGN KEY ("managerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_buyerId_users_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_sellerId_users_id_fk" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_cardId_cards_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_highestBidderId_users_id_fk" FOREIGN KEY ("highestBidderId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "managerLeaderboard" ADD CONSTRAINT "managerLeaderboard_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "managerResults" ADD CONSTRAINT "managerResults_lineupId_lineups_id_fk" FOREIGN KEY ("lineupId") REFERENCES "public"."lineups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packPurchases" ADD CONSTRAINT "packPurchases_buyerId_users_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_runId_runs_id_fk" FOREIGN KEY ("runId") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profileViews" ADD CONSTRAINT "profileViews_profileId_users_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profileViews" ADD CONSTRAINT "profileViews_viewerId_users_id_fk" FOREIGN KEY ("viewerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_commentId_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_users_id_fk" FOREIGN KEY ("reporterId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_commentId_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewedBy_users_id_fk" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runnerLeaderboard" ADD CONSTRAINT "runnerLeaderboard_runnerId_runners_id_fk" FOREIGN KEY ("runnerId") REFERENCES "public"."runners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runnerResults" ADD CONSTRAINT "runnerResults_competitionId_competitions_id_fk" FOREIGN KEY ("competitionId") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runnerResults" ADD CONSTRAINT "runnerResults_runnerId_runners_id_fk" FOREIGN KEY ("runnerId") REFERENCES "public"."runners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runnerResults" ADD CONSTRAINT "runnerResults_sessionId_runs_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runners" ADD CONSTRAINT "runners_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runners" ADD CONSTRAINT "runners_runnerWallet_users_walletAddress_fk" FOREIGN KEY ("runnerWallet") REFERENCES "public"."users"("walletAddress") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_runnerId_runners_id_fk" FOREIGN KEY ("runnerId") REFERENCES "public"."runners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fromUserId_users_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_toUserId_users_id_fk" FOREIGN KEY ("toUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cardId_cards_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_competitionId_competitions_id_fk" FOREIGN KEY ("competitionId") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_packPurchaseId_packPurchases_id_fk" FOREIGN KEY ("packPurchaseId") REFERENCES "public"."packPurchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" ADD CONSTRAINT "userDeviceAuthorizations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bidsListingIdx" ON "bids" USING btree ("listingId");--> statement-breakpoint
CREATE INDEX "bidsCardIdx" ON "bids" USING btree ("cardId");--> statement-breakpoint
CREATE INDEX "bidsBidderIdx" ON "bids" USING btree ("bidderId");--> statement-breakpoint
CREATE INDEX "bidsStatusIdx" ON "bids" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bidsTypeIdx" ON "bids" USING btree ("bidType");--> statement-breakpoint
CREATE INDEX "bidsCreatedAtIdx" ON "bids" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "bidsUpdatedAtIdx" ON "bids" USING btree ("updatedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "cardsTokenIdx" ON "cardMetadata" USING btree ("tokenId");--> statement-breakpoint
CREATE INDEX "cardMetadataRunnerIdx" ON "cardMetadata" USING btree ("runnerId");--> statement-breakpoint
CREATE INDEX "cardMetadataCreatedAtIdx" ON "cardMetadata" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "cardsOwnerIdx" ON "cards" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "cardsPackPurchaseIdx" ON "cards" USING btree ("packPurchaseId");--> statement-breakpoint
CREATE INDEX "cardsCreatedAtIdx" ON "cards" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "cardsUpdatedAtIdx" ON "cards" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "commentsPostIdx" ON "comments" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "commentsUserIdx" ON "comments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "commentsParentIdx" ON "comments" USING btree ("parentCommentId");--> statement-breakpoint
CREATE INDEX "commentsCreatedAtIdx" ON "comments" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "competitionsCreatedAtIdx" ON "competitions" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "competitionsUpdatedAtIdx" ON "competitions" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "followsFollowerIdx" ON "follows" USING btree ("followerId");--> statement-breakpoint
CREATE INDEX "followsFollowingIdx" ON "follows" USING btree ("followTargetId");--> statement-breakpoint
CREATE UNIQUE INDEX "followsUniqueIdx" ON "follows" USING btree ("followerId","followTargetId");--> statement-breakpoint
CREATE INDEX "lineupCardsLineupIdx" ON "lineupCards" USING btree ("lineupId");--> statement-breakpoint
CREATE INDEX "lineupCardsCardIdx" ON "lineupCards" USING btree ("cardId");--> statement-breakpoint
CREATE INDEX "lineupCardsCreatedAtIdx" ON "lineupCards" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "lineupCardsUpdatedAtIdx" ON "lineupCards" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "lineupsCompetitionIdx" ON "lineups" USING btree ("competitionId");--> statement-breakpoint
CREATE INDEX "lineupsManagerIdx" ON "lineups" USING btree ("managerId");--> statement-breakpoint
CREATE INDEX "lineupsCreatedAtIdx" ON "lineups" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "lineupsUpdatedAtIdx" ON "lineups" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "listingsCardIdx" ON "listings" USING btree ("cardId");--> statement-breakpoint
CREATE INDEX "listingsSellerIdx" ON "listings" USING btree ("sellerId");--> statement-breakpoint
CREATE INDEX "listingsBuyerIdx" ON "listings" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "listingsStatusIdx" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "listingsCreatedAtIdx" ON "listings" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "listingsUpdatedAtIdx" ON "listings" USING btree ("updatedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "managerLeaderboardUserIdx" ON "managerLeaderboard" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "managerLeaderboardRankingIdx" ON "managerLeaderboard" USING btree ("ranking");--> statement-breakpoint
CREATE INDEX "managerResultsLineupIdx" ON "managerResults" USING btree ("lineupId");--> statement-breakpoint
CREATE INDEX "managerResultsCreatedAtIdx" ON "managerResults" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "managerResultsUpdatedAtIdx" ON "managerResults" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "packPurchasesBuyerIdx" ON "packPurchases" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "packPurchasesCreatedAtIdx" ON "packPurchases" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "packPurchasesUpdatedAtIdx" ON "packPurchases" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "postsUserIdx" ON "posts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "postsRunIdx" ON "posts" USING btree ("runId");--> statement-breakpoint
CREATE INDEX "postsCreatedAtIdx" ON "posts" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "postsUpdatedAtIdx" ON "posts" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "profileViewsProfileIdx" ON "profileViews" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "profileViewsCreatedAtIdx" ON "profileViews" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "profileViewsIpRecentIdx" ON "profileViews" USING btree ("ipAddress","createdAt");--> statement-breakpoint
CREATE INDEX "reactionsPostIdx" ON "reactions" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "reactionsCommentIdx" ON "reactions" USING btree ("commentId");--> statement-breakpoint
CREATE INDEX "reactionsUserIdx" ON "reactions" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "reactionsPostUniqueIdx" ON "reactions" USING btree ("userId","postId","type");--> statement-breakpoint
CREATE UNIQUE INDEX "reactionsCommentUniqueIdx" ON "reactions" USING btree ("userId","commentId","type");--> statement-breakpoint
CREATE INDEX "reportsReporterIdx" ON "reports" USING btree ("reporterId");--> statement-breakpoint
CREATE INDEX "reportsPostIdx" ON "reports" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "reportsCommentIdx" ON "reports" USING btree ("commentId");--> statement-breakpoint
CREATE INDEX "reportsStatusIdx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "runnerLeaderboardRunnerIdx" ON "runnerLeaderboard" USING btree ("runnerId");--> statement-breakpoint
CREATE INDEX "runnerLeaderboardRankingIdx" ON "runnerLeaderboard" USING btree ("ranking");--> statement-breakpoint
CREATE INDEX "runnerResultsCompetitionIdx" ON "runnerResults" USING btree ("competitionId");--> statement-breakpoint
CREATE INDEX "runnerResultsRunnerIdx" ON "runnerResults" USING btree ("runnerId");--> statement-breakpoint
CREATE INDEX "runnerResultsSessionIdx" ON "runnerResults" USING btree ("sessionId");--> statement-breakpoint
CREATE INDEX "runnerResultsCreatedAtIdx" ON "runnerResults" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "runnerResultsUpdatedAtIdx" ON "runnerResults" USING btree ("updatedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "runnersUserIdx" ON "runners" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "runnersCreatedAtIdx" ON "runners" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "runnersUpdatedAtIdx" ON "runners" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "runsRunnerIdx" ON "runs" USING btree ("runnerId");--> statement-breakpoint
CREATE INDEX "runsCreatedAtIdx" ON "runs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "runsUpdatedAtIdx" ON "runs" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "transactionsFromUserIdx" ON "transactions" USING btree ("fromUserId");--> statement-breakpoint
CREATE INDEX "transactionsToUserIdx" ON "transactions" USING btree ("toUserId");--> statement-breakpoint
CREATE INDEX "transactionsCardIdx" ON "transactions" USING btree ("cardId");--> statement-breakpoint
CREATE INDEX "transactionsCompetitionIdx" ON "transactions" USING btree ("competitionId");--> statement-breakpoint
CREATE INDEX "transactionsHashIdx" ON "transactions" USING btree ("hash");--> statement-breakpoint
CREATE INDEX "transactionsCreatedAtIdx" ON "transactions" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "transactionsUpdatedAtIdx" ON "transactions" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "userDeviceAuthorizationsUserIdx" ON "userDeviceAuthorizations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "userDeviceAuthorizationsCreatedAtIdx" ON "userDeviceAuthorizations" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "userDeviceAuthorizationsUpdatedAtIdx" ON "userDeviceAuthorizations" USING btree ("updatedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "usersEmailIdx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "usersUsernameIdx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "usersWalletAddressIdx" ON "users" USING btree ("walletAddress");--> statement-breakpoint
CREATE INDEX "usersCreatedAtIdx" ON "users" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "usersUpdatedAtIdx" ON "users" USING btree ("updatedAt");