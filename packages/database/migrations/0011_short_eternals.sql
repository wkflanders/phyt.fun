ALTER TYPE "public"."enum_acquisition_type" RENAME TO "enumAcquisitionType";--> statement-breakpoint
ALTER TYPE "public"."enum_bid_status" RENAME TO "enumBidStatus";--> statement-breakpoint
ALTER TYPE "public"."enum_bid_type" RENAME TO "enumBidType";--> statement-breakpoint
ALTER TYPE "public"."enum_cards_rarity" RENAME TO "enumCardsRarity";--> statement-breakpoint
ALTER TYPE "public"."enum_listing_status" RENAME TO "enumListingStatus";--> statement-breakpoint
ALTER TYPE "public"."enum_pack_type" RENAME TO "enumPackType";--> statement-breakpoint
ALTER TYPE "public"."enum_posts_status" RENAME TO "enumPostsStatus";--> statement-breakpoint
ALTER TYPE "public"."enum_reaction_type" RENAME TO "enumReactionType";--> statement-breakpoint
ALTER TYPE "public"."enum_report_reason" RENAME TO "enumReportReason";--> statement-breakpoint
ALTER TYPE "public"."enum_report_status" RENAME TO "enumReportStatus";--> statement-breakpoint
ALTER TYPE "public"."enum_runner_status" RENAME TO "enumRunnerStatus";--> statement-breakpoint
ALTER TYPE "public"."enum_runs_verification_status" RENAME TO "enumRunsVerificationStatus";--> statement-breakpoint
ALTER TYPE "public"."enum_seasons" RENAME TO "enumSeasons";--> statement-breakpoint
ALTER TYPE "public"."enum_transactions_transaction_type" RENAME TO "enumTransactionsTransactionType";--> statement-breakpoint
ALTER TYPE "public"."enum_users_role" RENAME TO "enumUsersRole";--> statement-breakpoint
ALTER TABLE "card_metadata" RENAME TO "cardMetadata";--> statement-breakpoint
ALTER TABLE "lineup_cards" RENAME TO "lineupCards";--> statement-breakpoint
ALTER TABLE "manager_leaderboard" RENAME TO "managerLeaderboard";--> statement-breakpoint
ALTER TABLE "manager_results" RENAME TO "managerResults";--> statement-breakpoint
ALTER TABLE "pack_purchases" RENAME TO "packPurchases";--> statement-breakpoint
ALTER TABLE "profile_views" RENAME TO "profileViews";--> statement-breakpoint
ALTER TABLE "runner_leaderboard" RENAME TO "runnerLeaderboard";--> statement-breakpoint
ALTER TABLE "runner_results" RENAME TO "runnerResults";--> statement-breakpoint
ALTER TABLE "user_device_authorizations" RENAME TO "userDeviceAuthorizations";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "listing_id" TO "listingId";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "card_id" TO "cardId";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "bidder_id" TO "bidderId";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "bid_amount" TO "bidAmount";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "order_hash" TO "orderHash";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "order_data" TO "orderData";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "bid_type" TO "bidType";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "expiration_time" TO "expirationTime";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "accepted_at" TO "acceptedAt";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "bids" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "cardMetadata" RENAME COLUMN "token_id" TO "tokenId";--> statement-breakpoint
ALTER TABLE "cardMetadata" RENAME COLUMN "runner_id" TO "runnerId";--> statement-breakpoint
ALTER TABLE "cardMetadata" RENAME COLUMN "image_url" TO "imageUrl";--> statement-breakpoint
ALTER TABLE "cardMetadata" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "owner_id" TO "ownerId";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "token_id" TO "tokenId";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "acquisition_type" TO "acquisitionType";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "is_burned" TO "isBurned";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "comments" RENAME COLUMN "post_id" TO "postId";--> statement-breakpoint
ALTER TABLE "comments" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "comments" RENAME COLUMN "parent_comment_id" TO "parentCommentId";--> statement-breakpoint
ALTER TABLE "comments" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "comments" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "event_name" TO "eventName";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "start_time" TO "startTime";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "end_time" TO "endTime";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "distance_m" TO "distance";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "event_type" TO "eventType";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "follows" RENAME COLUMN "follower_id" TO "followerId";--> statement-breakpoint
ALTER TABLE "follows" RENAME COLUMN "follow_target_id" TO "followTargetId";--> statement-breakpoint
ALTER TABLE "follows" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "lineupCards" RENAME COLUMN "lineup_id" TO "lineupId";--> statement-breakpoint
ALTER TABLE "lineupCards" RENAME COLUMN "card_id" TO "cardId";--> statement-breakpoint
ALTER TABLE "lineupCards" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "lineupCards" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "lineups" RENAME COLUMN "manager_id" TO "managerId";--> statement-breakpoint
ALTER TABLE "lineups" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "lineups" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "buyer_id" TO "buyerId";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "seller_id" TO "sellerId";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "card_id" TO "cardId";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "highest_bid" TO "highestBid";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "highest_bidder_id" TO "highestBidderId";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "expiration_time" TO "expirationTime";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "order_hash" TO "orderHash";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "order_data" TO "orderData";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "transaction_hash" TO "transactionHash";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "managerLeaderboard" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "managerLeaderboard" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "managerLeaderboard" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "managerResults" RENAME COLUMN "lineup_id" TO "lineupId";--> statement-breakpoint
ALTER TABLE "managerResults" RENAME COLUMN "total_score" TO "totalScore";--> statement-breakpoint
ALTER TABLE "managerResults" RENAME COLUMN "final_placement" TO "finalPlacement";--> statement-breakpoint
ALTER TABLE "managerResults" RENAME COLUMN "reward_amount_phyt" TO "rewardAmountPhyt";--> statement-breakpoint
ALTER TABLE "managerResults" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "managerResults" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "packPurchases" RENAME COLUMN "buyer_id" TO "buyerId";--> statement-breakpoint
ALTER TABLE "packPurchases" RENAME COLUMN "purchase_price" TO "purchasePrice";--> statement-breakpoint
ALTER TABLE "packPurchases" RENAME COLUMN "pack_type" TO "packType";--> statement-breakpoint
ALTER TABLE "packPurchases" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "packPurchases" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "run_id" TO "runId";--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "profileViews" RENAME COLUMN "profile_id" TO "profileId";--> statement-breakpoint
ALTER TABLE "profileViews" RENAME COLUMN "viewer_id" TO "viewerId";--> statement-breakpoint
ALTER TABLE "profileViews" RENAME COLUMN "ip_address" TO "ipAddress";--> statement-breakpoint
ALTER TABLE "profileViews" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "reactions" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "reactions" RENAME COLUMN "post_id" TO "postId";--> statement-breakpoint
ALTER TABLE "reactions" RENAME COLUMN "comment_id" TO "commentId";--> statement-breakpoint
ALTER TABLE "reactions" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "reporter_id" TO "reporterId";--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "post_id" TO "postId";--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "comment_id" TO "commentId";--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "reviewed_by" TO "reviewedBy";--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "reviewed_at" TO "reviewedAt";--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "runnerLeaderboard" RENAME COLUMN "runner_id" TO "runnerId";--> statement-breakpoint
ALTER TABLE "runnerLeaderboard" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "runnerLeaderboard" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "runnerResults" RENAME COLUMN "competition_id" TO "competitionId";--> statement-breakpoint
ALTER TABLE "runnerResults" RENAME COLUMN "runner_id" TO "runnerId";--> statement-breakpoint
ALTER TABLE "runnerResults" RENAME COLUMN "session_id" TO "sessionId";--> statement-breakpoint
ALTER TABLE "runnerResults" RENAME COLUMN "best_time_sec" TO "bestTimeSec";--> statement-breakpoint
ALTER TABLE "runnerResults" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "runnerResults" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "average_pace" TO "averagePace";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "total_distance_m" TO "totalDistance";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "total_runs" TO "totalRuns";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "best_mile_time" TO "bestMileTime";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "is_pooled" TO "isPooled";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "runner_wallet" TO "runnerWallet";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "runners" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "runner_id" TO "runnerId";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "start_time" TO "startTime";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "end_time" TO "endTime";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "duration_seconds" TO "durationSeconds";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "distance_m" TO "distance";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "average_pace_sec" TO "averagePaceSec";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "calories_burned" TO "caloriesBurned";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "step_count" TO "stepCount";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "elevation_gain_m" TO "elevationGain";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "average_heart_rate" TO "averageHeartRate";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "max_heart_rate" TO "maxHeartRate";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "device_id" TO "deviceId";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "gps_route_data" TO "gpsRouteData";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "is_posted" TO "isPosted";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "verification_status" TO "verificationSatus";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "raw_data_json" TO "rawDataJson";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "runs" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "from_user_id" TO "fromUserId";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "to_user_id" TO "toUserId";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "card_id" TO "cardId";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "competition_id" TO "competitionId";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "transaction_type" TO "transactionType";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "pack_purchases_id" TO "packPurchasesId";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" RENAME COLUMN "device_type" TO "deviceType";--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" RENAME COLUMN "access_token" TO "accessToken";--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" RENAME COLUMN "refresh_token" TO "refreshToken";--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" RENAME COLUMN "last_synced_at" TO "last_syncedAt";--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "privy_id" TO "privyId";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "wallet_address" TO "walletAddress";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "twitter_handle" TO "twitterHandle";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "strava_handle" TO "stravaHandle";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "avatar_url" TO "avatarUrl";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "phytness_points" TO "phytnessPoints";--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "bids_order_hash_unique";--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_token_id_unique";--> statement-breakpoint
ALTER TABLE "listings" DROP CONSTRAINT "listings_order_hash_unique";--> statement-breakpoint
ALTER TABLE "runners" DROP CONSTRAINT "runners_runner_wallet_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_wallet_address_unique";--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "bids_listing_id_listings_id_fk";
--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "bids_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "bids_bidder_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cardMetadata" DROP CONSTRAINT "card_metadata_token_id_cards_token_id_fk";
--> statement-breakpoint
ALTER TABLE "cardMetadata" DROP CONSTRAINT "card_metadata_runner_id_runners_id_fk";
--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_pack_purchase_id_pack_purchases_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_comment_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_follow_target_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "lineupCards" DROP CONSTRAINT "lineup_cards_lineup_id_lineups_id_fk";
--> statement-breakpoint
ALTER TABLE "lineupCards" DROP CONSTRAINT "lineup_cards_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "lineups" DROP CONSTRAINT "lineups_competition_id_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "lineups" DROP CONSTRAINT "lineups_manager_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "listings" DROP CONSTRAINT "listings_buyer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "listings" DROP CONSTRAINT "listings_seller_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "listings" DROP CONSTRAINT "listings_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "listings" DROP CONSTRAINT "listings_highest_bidder_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "managerLeaderboard" DROP CONSTRAINT "manager_leaderboard_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "managerResults" DROP CONSTRAINT "manager_results_lineup_id_lineups_id_fk";
--> statement-breakpoint
ALTER TABLE "packPurchases" DROP CONSTRAINT "pack_purchases_buyer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_run_id_runs_id_fk";
--> statement-breakpoint
ALTER TABLE "profileViews" DROP CONSTRAINT "profile_views_profile_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profileViews" DROP CONSTRAINT "profile_views_viewer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_comment_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_reporter_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_comment_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_reviewed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "runnerLeaderboard" DROP CONSTRAINT "runner_leaderboard_runner_id_runners_id_fk";
--> statement-breakpoint
ALTER TABLE "runnerResults" DROP CONSTRAINT "runner_results_competition_id_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "runnerResults" DROP CONSTRAINT "runner_results_runner_id_runners_id_fk";
--> statement-breakpoint
ALTER TABLE "runnerResults" DROP CONSTRAINT "runner_results_session_id_runs_id_fk";
--> statement-breakpoint
ALTER TABLE "runners" DROP CONSTRAINT "runners_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "runners" DROP CONSTRAINT "runners_runner_wallet_users_wallet_address_fk";
--> statement-breakpoint
ALTER TABLE "runs" DROP CONSTRAINT "runs_runner_id_runners_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_from_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_to_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_competition_id_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pack_purchases_id_pack_purchases_id_fk";
--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" DROP CONSTRAINT "user_device_authorizations_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "bids_listing_idx";--> statement-breakpoint
DROP INDEX "bids_card_idx";--> statement-breakpoint
DROP INDEX "bids_bidder_idx";--> statement-breakpoint
DROP INDEX "bids_status_idx";--> statement-breakpoint
DROP INDEX "bids_type_idx";--> statement-breakpoint
DROP INDEX "bids_created_at_idx";--> statement-breakpoint
DROP INDEX "bids_updated_at_idx";--> statement-breakpoint
DROP INDEX "idx_cards_token_id";--> statement-breakpoint
DROP INDEX "idx_card_metadata_runner_id";--> statement-breakpoint
DROP INDEX "idx_card_metadata_created_at";--> statement-breakpoint
DROP INDEX "idx_cards_owner_id";--> statement-breakpoint
DROP INDEX "idx_cards_pack_purchase_id";--> statement-breakpoint
DROP INDEX "idx_cards_created_at";--> statement-breakpoint
DROP INDEX "idx_cards_updated_at";--> statement-breakpoint
DROP INDEX "comments_post_idx";--> statement-breakpoint
DROP INDEX "comments_user_idx";--> statement-breakpoint
DROP INDEX "comments_parent_idx";--> statement-breakpoint
DROP INDEX "comments_created_at_idx";--> statement-breakpoint
DROP INDEX "competitions_created_at_idx";--> statement-breakpoint
DROP INDEX "competitions_updated_at_idx";--> statement-breakpoint
DROP INDEX "follows_follower_idx";--> statement-breakpoint
DROP INDEX "follows_following_idx";--> statement-breakpoint
DROP INDEX "follows_unique_idx";--> statement-breakpoint
DROP INDEX "lineup_cards_lineup_idx";--> statement-breakpoint
DROP INDEX "lineup_cards_card_idx";--> statement-breakpoint
DROP INDEX "lineup_cards_created_at_idx";--> statement-breakpoint
DROP INDEX "lineup_cards_updated_at_idx";--> statement-breakpoint
DROP INDEX "lineups_competition_idx";--> statement-breakpoint
DROP INDEX "lineups_manager_idx";--> statement-breakpoint
DROP INDEX "lineups_created_at_idx";--> statement-breakpoint
DROP INDEX "lineups_updated_at_idx";--> statement-breakpoint
DROP INDEX "listings_card_idx";--> statement-breakpoint
DROP INDEX "listings_seller_idx";--> statement-breakpoint
DROP INDEX "listings_buyer_idx";--> statement-breakpoint
DROP INDEX "listings_status_idx";--> statement-breakpoint
DROP INDEX "listings_created_at_idx";--> statement-breakpoint
DROP INDEX "listings_updated_at_idx";--> statement-breakpoint
DROP INDEX "manager_leaderboard_user_idx";--> statement-breakpoint
DROP INDEX "manager_leaderboard_ranking_idx";--> statement-breakpoint
DROP INDEX "manager_results_lineup_idx";--> statement-breakpoint
DROP INDEX "manager_results_created_at_idx";--> statement-breakpoint
DROP INDEX "manager_results_updated_at_idx";--> statement-breakpoint
DROP INDEX "pack_purchases_buyer_idx";--> statement-breakpoint
DROP INDEX "pack_purchases_created_at_idx";--> statement-breakpoint
DROP INDEX "pack_purchases_updated_at_idx";--> statement-breakpoint
DROP INDEX "posts_user_idx";--> statement-breakpoint
DROP INDEX "posts_run_idx";--> statement-breakpoint
DROP INDEX "posts_created_at_idx";--> statement-breakpoint
DROP INDEX "posts_updated_at_idx";--> statement-breakpoint
DROP INDEX "profile_views_profile_idx";--> statement-breakpoint
DROP INDEX "profile_views_created_at_idx";--> statement-breakpoint
DROP INDEX "profile_views_ip_recent_idx";--> statement-breakpoint
DROP INDEX "reactions_post_idx";--> statement-breakpoint
DROP INDEX "reactions_comment_idx";--> statement-breakpoint
DROP INDEX "reactions_user_idx";--> statement-breakpoint
DROP INDEX "reactions_post_unique_idx";--> statement-breakpoint
DROP INDEX "reactions_comment_unique_idx";--> statement-breakpoint
DROP INDEX "reports_reporter_idx";--> statement-breakpoint
DROP INDEX "reports_post_idx";--> statement-breakpoint
DROP INDEX "reports_comment_idx";--> statement-breakpoint
DROP INDEX "reports_status_idx";--> statement-breakpoint
DROP INDEX "runner_leaderboard_runner_idx";--> statement-breakpoint
DROP INDEX "runner_leaderboard_ranking_idx";--> statement-breakpoint
DROP INDEX "runner_results_competition_idx";--> statement-breakpoint
DROP INDEX "runner_results_runner_idx";--> statement-breakpoint
DROP INDEX "runner_results_session_idx";--> statement-breakpoint
DROP INDEX "runner_results_created_at_idx";--> statement-breakpoint
DROP INDEX "runner_results_updated_at_idx";--> statement-breakpoint
DROP INDEX "runners_user_idx";--> statement-breakpoint
DROP INDEX "runners_created_at_idx";--> statement-breakpoint
DROP INDEX "runners_updated_at_idx";--> statement-breakpoint
DROP INDEX "runs_runner_idx";--> statement-breakpoint
DROP INDEX "runs_created_at_idx";--> statement-breakpoint
DROP INDEX "runs_updated_at_idx";--> statement-breakpoint
DROP INDEX "transactions_from_user_idx";--> statement-breakpoint
DROP INDEX "transactions_to_user_idx";--> statement-breakpoint
DROP INDEX "transactions_card_idx";--> statement-breakpoint
DROP INDEX "transactions_competition_idx";--> statement-breakpoint
DROP INDEX "transactions_hash_idx";--> statement-breakpoint
DROP INDEX "transactions_created_at_idx";--> statement-breakpoint
DROP INDEX "transactions_updated_at_idx";--> statement-breakpoint
DROP INDEX "user_device_authorizations_user_idx";--> statement-breakpoint
DROP INDEX "user_device_authorizations_created_at_idx";--> statement-breakpoint
DROP INDEX "user_device_authorizations_updated_at_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
DROP INDEX "users_username_idx";--> statement-breakpoint
DROP INDEX "users_wallet_address_idx";--> statement-breakpoint
DROP INDEX "users_created_at_idx";--> statement-breakpoint
DROP INDEX "users_updated_at_idx";--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "pack_purchase_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "follows" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lineupCards" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lineups" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "managerLeaderboard" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "managerResults" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "packPurchases" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profileViews" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "runnerLeaderboard" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "runnerResults" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "runners" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "userDeviceAuthorizations" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lineups" ADD COLUMN "competitionId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_listingId_listings_id_fk" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_cardId_cards_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidderId_users_id_fk" FOREIGN KEY ("bidderId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardMetadata" ADD CONSTRAINT "cardMetadata_tokenId_cards_tokenId_fk" FOREIGN KEY ("tokenId") REFERENCES "public"."cards"("tokenId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardMetadata" ADD CONSTRAINT "cardMetadata_runnerId_runners_id_fk" FOREIGN KEY ("runnerId") REFERENCES "public"."runners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_pack_purchase_id_packPurchases_id_fk" FOREIGN KEY ("pack_purchase_id") REFERENCES "public"."packPurchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_packPurchasesId_packPurchases_id_fk" FOREIGN KEY ("packPurchasesId") REFERENCES "public"."packPurchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "cardsPackPurchaseIdx" ON "cards" USING btree ("pack_purchase_id");--> statement-breakpoint
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
CREATE INDEX "lineupsCreated_atIdx" ON "lineups" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "lineupsUpdated_atIdx" ON "lineups" USING btree ("updatedAt");--> statement-breakpoint
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
CREATE INDEX "runnerResultsCreated_atIdx" ON "runnerResults" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "runnerResultsUpdated_atIdx" ON "runnerResults" USING btree ("updatedAt");--> statement-breakpoint
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
CREATE INDEX "usersUpdatedAtIdx" ON "users" USING btree ("updatedAt");--> statement-breakpoint
ALTER TABLE "lineups" DROP COLUMN "competition_id";--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_orderHash_unique" UNIQUE("orderHash");--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_tokenId_unique" UNIQUE("tokenId");--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_orderHash_unique" UNIQUE("orderHash");--> statement-breakpoint
ALTER TABLE "runners" ADD CONSTRAINT "runners_runnerWallet_unique" UNIQUE("runnerWallet");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_walletAddress_unique" UNIQUE("walletAddress");