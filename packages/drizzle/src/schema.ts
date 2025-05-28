import {
    pgTable,
    index,
    uniqueIndex,
    timestamp,
    varchar,
    foreignKey,
    integer,
    jsonb,
    boolean,
    pgEnum,
    serial,
    uuid,
    // bigint
    doublePrecision,
    decimal,
    text
} from 'drizzle-orm/pg-core';

export const ethValuePrecision = 78;

export const enumCardsRarity = pgEnum('enumCardsRarity', [
    'bronze',
    'silver',
    'gold',
    'sapphire',
    'ruby',
    'opal'
]);

export const enumAcquisitionType = pgEnum('enumAcquisitionType', [
    'mint',
    'transfer',
    'marketplace'
]);

export const enumRunsVerificationStatus = pgEnum('enumRunsVerificationStatus', [
    'pending',
    'verified',
    'flagged'
]);

export const enumTransactionsTransactionType = pgEnum(
    'enumTransactionsTransactionType',
    [
        'packPurchase',
        'marketplaceSale',
        'marketplaceOffer',
        'marketplaceListing',
        'rewardPayout'
    ]
);

export const enumTransactionStatus = pgEnum('enumTransactionStatus', [
    'pending',
    'completed',
    'failed'
]);

export const enumBidType = pgEnum('enumBidType', ['listing', 'open']);

export const enumBidStatus = pgEnum('enumBidStatus', [
    'active',
    'filled',
    'topbid',
    'outbid',
    'withdrawn'
]);

export const enumListingStatus = pgEnum('enumListingStatus', [
    'active',
    'expiring',
    'starting',
    'expired',
    'inactive',
    'fulfilled'
]);

export const enumUsersRole = pgEnum('enumUsersRole', [
    'admin',
    'user',
    'runner'
]);
export const enumRunnerStatus = pgEnum('enumRunnerStatus', [
    'pending',
    'active',
    'inactive'
]);

export const enumPostsStatus = pgEnum('enumPostsStatus', [
    'visible',
    'hidden',
    'deleted'
]);

export const enumReactionType = pgEnum('enumReactionType', [
    'like',
    'funny',
    'insightful',
    'fire'
]);

export const enumReportStatus = pgEnum('enumReportStatus', [
    'pending',
    'reviewed',
    'dismissed'
]);

export const enumReportReason = pgEnum('enumReportReason', [
    'spam',
    'harassment',
    'inappropriate',
    'other'
]);

export const enumPackType = pgEnum('enumPackType', [
    'scrawny',
    'toned',
    'swole',
    'phyt'
]);

export const enumSeasons = pgEnum('enumSeasons', ['season_0']);

// Tables
export const users = pgTable(
    'users',
    {
        id: uuid('id').primaryKey().notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 }),
        email: varchar('email').notNull(),
        username: varchar('username').notNull(),
        role: enumUsersRole('role').default('user').notNull(),
        privyId: varchar('privyId').notNull(),
        walletAddress: varchar('walletAddress').unique().notNull(),
        twitterHandle: varchar('twitterHandle'),
        stravaHandle: varchar('stravaHandle'),
        avatarUrl: varchar('avatarUrl')
            .default(
                'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut'
            )
            .notNull(),
        phytnessPoints: integer('phytnessPoints').default(0).notNull()
    },
    (table) => [
        uniqueIndex('usersEmailIdx').on(table.email),
        uniqueIndex('usersUsernameIdx').on(table.username),
        uniqueIndex('usersWalletAddressIdx').on(table.walletAddress),
        index('usersCreatedAtIdx').on(table.createdAt),
        index('usersUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const runners = pgTable(
    'runners',
    {
        id: uuid('id').primaryKey().notNull(),
        userId: uuid('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        averagePace: doublePrecision('averagePace'),
        totalDistance: doublePrecision('totalDistance').default(0).notNull(),
        totalRuns: integer('totalRuns').default(0).notNull(),
        bestMileTime: doublePrecision('bestMileTime'),
        status: enumRunnerStatus('status').default('pending').notNull(),
        isPooled: boolean('isPooled').default(false).notNull(),
        runnerWallet: varchar('runnerWallet')
            .references(() => users.walletAddress)
            .unique()
            .notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        uniqueIndex('runnersUserIdx').on(table.userId),
        index('runnersCreatedAtIdx').on(table.createdAt),
        index('runnersUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const runs = pgTable(
    'runs',
    {
        id: uuid('id').primaryKey().notNull(),
        runnerId: uuid('runnerId')
            .notNull()
            .references(() => runners.id, { onDelete: 'set null' }),
        startTime: timestamp('startTime', { precision: 3 }).notNull(),
        endTime: timestamp('endTime', { precision: 3 }).notNull(),
        durationSeconds: integer('durationSeconds').notNull(),
        distance: doublePrecision('distance').notNull(),
        averagePaceSec: doublePrecision('averagePaceSec'),
        caloriesBurned: integer('caloriesBurned'),
        stepCount: integer('stepCount'),
        elevationGain: doublePrecision('elevationGain'),
        averageHeartRate: integer('averageHeartRate'),
        maxHeartRate: integer('maxHeartRate'),
        deviceId: varchar('deviceId'),
        gpsRouteData: varchar('gpsRouteData'),
        isPosted: boolean('isPosted').default(false),
        verificationStatus: enumRunsVerificationStatus('verificationStatus')
            .default('pending')
            .notNull(),
        rawDataJson: jsonb('rawDataJson'),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        index('runsRunnerIdx').on(table.runnerId),
        index('runsCreatedAtIdx').on(table.createdAt),
        index('runsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const packPurchases = pgTable(
    'packPurchases',
    {
        id: uuid('id').primaryKey().notNull(),
        buyerId: uuid('buyerId')
            .notNull()
            .references(() => users.id, { onDelete: 'set null' }),
        purchasePrice: decimal('purchasePrice', {
            precision: ethValuePrecision,
            scale: 0
        }).notNull(),
        packType: enumPackType('packType').notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('packPurchasesBuyerIdx').on(table.buyerId),
        index('packPurchasesCreatedAtIdx').on(table.createdAt),
        index('packPurchasesUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const cards = pgTable(
    'cards',
    {
        id: uuid('id').primaryKey().notNull(),
        ownerId: uuid('ownerId')
            .notNull()
            .references(() => users.id, { onDelete: 'set null' }),
        packPurchaseId: uuid('packPurchaseId')
            .notNull()
            .references(() => packPurchases.id, { onDelete: 'set null' }),
        tokenId: integer('tokenId').notNull().unique(),
        acquisitionType: enumAcquisitionType('acquisitionType')
            .notNull()
            .default('mint'),
        isBurned: boolean('isBurned').notNull().default(false),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('cardsOwnerIdx').on(table.ownerId),
        index('cardsPackPurchaseIdx').on(table.packPurchaseId),
        index('cardsCreatedAtIdx').on(table.createdAt),
        index('cardsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const cardMetadata = pgTable(
    'cardMetadata',
    {
        tokenId: serial('tokenId')
            .primaryKey()
            .references(() => cards.tokenId, { onDelete: 'cascade' }),
        runnerId: uuid('runnerId')
            .notNull()
            .references(() => runners.id, { onDelete: 'restrict' }),
        runnerName: varchar('runnerName').notNull(),
        rarity: enumCardsRarity('rarity').notNull(),
        multiplier: doublePrecision('multiplier').notNull(),
        season: enumSeasons('seasons').notNull(),
        imageUrl: varchar('imageUrl').notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        uniqueIndex('cardsTokenIdx').on(table.tokenId),
        index('cardMetadataRunnerIdx').on(table.runnerId),
        index('cardMetadataCreatedAtIdx').on(table.createdAt)
    ]
);

export const competitions = pgTable(
    'competitions',
    {
        id: uuid('id').primaryKey().notNull(),
        eventName: varchar('eventName').notNull(),
        startTime: timestamp('startTime', { precision: 3 }).notNull(),
        endTime: timestamp('endTime', { precision: 3 }).notNull(),
        distance: doublePrecision('distance'),
        eventType: varchar('eventType'),
        jackpot: decimal('jackpot', {
            precision: ethValuePrecision,
            scale: 0
        }).default('0'), // Default as string '0'
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        index('competitionsCreatedAtIdx').on(table.createdAt),
        index('competitionsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const lineups = pgTable(
    'lineups',
    {
        id: uuid('id').primaryKey().notNull(),
        competitionId: uuid('competitionId')
            .notNull()
            .references(() => competitions.id, { onDelete: 'set null' }),
        managerId: uuid('managerId')
            .notNull()
            .references(() => users.id, { onDelete: 'set null' }),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        index('lineupsCompetitionIdx').on(table.competitionId),
        index('lineupsManagerIdx').on(table.managerId),
        index('lineupsCreatedAtIdx').on(table.createdAt),
        index('lineupsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const lineupCards = pgTable(
    'lineupCards',
    {
        id: uuid('id').primaryKey().notNull(),
        lineupId: uuid('lineupId')
            .notNull()
            .references(() => lineups.id, { onDelete: 'set null' }),
        cardId: uuid('cardId')
            .notNull()
            .references(() => cards.id, { onDelete: 'set null' }),
        position: integer('position').notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('lineupCardsLineupIdx').on(table.lineupId),
        index('lineupCardsCardIdx').on(table.cardId),
        index('lineupCardsCreatedAtIdx').on(table.createdAt),
        index('lineupCardsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const runnerResults = pgTable(
    'runnerResults',
    {
        id: uuid('id').primaryKey().notNull(),
        competitionId: uuid('competitionId')
            .notNull()
            .references(() => competitions.id, { onDelete: 'set null' }),
        runnerId: uuid('runnerId')
            .notNull()
            .references(() => runners.id, { onDelete: 'set null' }),
        sessionId: uuid('sessionId')
            .notNull()
            .references(() => runs.id, { onDelete: 'set null' }),
        bestTimeSec: doublePrecision('bestTimeSec').notNull(),
        ranking: integer('ranking'),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('runnerResultsCompetitionIdx').on(table.competitionId),
        index('runnerResultsRunnerIdx').on(table.runnerId),
        index('runnerResultsSessionIdx').on(table.sessionId),
        index('runnerResultsCreatedAtIdx').on(table.createdAt),
        index('runnerResultsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const managerResults = pgTable(
    'managerResults',
    {
        id: uuid('id').primaryKey().notNull(),
        lineupId: uuid('lineupId')
            .notNull()
            .references(() => lineups.id, { onDelete: 'set null' }),
        totalScore: doublePrecision('totalScore').notNull(),
        finalPlacement: integer('finalPlacement'),
        rewardAmountPhyt: doublePrecision('rewardAmountPhyt'),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('managerResultsLineupIdx').on(table.lineupId),
        index('managerResultsCreatedAtIdx').on(table.createdAt),
        index('managerResultsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const listings = pgTable(
    'listings',
    {
        id: uuid('id').primaryKey().notNull(),
        buyerId: uuid('buyerId').references(() => users.id, {
            onDelete: 'set null'
        }),
        sellerId: uuid('sellerId')
            .notNull()
            .references(() => users.id, { onDelete: 'set null' }),
        cardId: uuid('cardId')
            .notNull()
            .references(() => cards.id, { onDelete: 'set null' }),
        price: decimal('price', {
            precision: ethValuePrecision,
            scale: 0
        }).notNull(),
        highestBid: decimal('highestBid', {
            precision: ethValuePrecision,
            scale: 0
        }),
        highestBidderId: uuid('highestBidderId').references(() => users.id, {
            onDelete: 'set null'
        }),
        expirationTime: timestamp('expirationTime', {
            precision: 3
        }).notNull(),
        signature: varchar('signature').notNull(),
        orderHash: varchar('orderHash').notNull().unique(),
        orderData: jsonb('orderData').notNull(),
        transactionHash: varchar('transactionHash', { length: 66 }).notNull(),
        status: enumListingStatus('status').notNull().default('active'),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        index('listingsCardIdx').on(table.cardId),
        index('listingsSellerIdx').on(table.sellerId),
        index('listingsBuyerIdx').on(table.buyerId),
        index('listingsStatusIdx').on(table.status),
        index('listingsCreatedAtIdx').on(table.createdAt),
        index('listingsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const bids = pgTable(
    'bids',
    {
        id: uuid('id').primaryKey().notNull(),
        listingId: uuid('listingId').references(() => listings.id, {
            onDelete: 'set null'
        }),
        cardId: uuid('cardId')
            .notNull()
            .references(() => cards.id, { onDelete: 'set null' }),
        bidderId: uuid('bidderId')
            .notNull()
            .references(() => users.id, { onDelete: 'set null' }),
        price: decimal('price', {
            precision: ethValuePrecision,
            scale: 0
        }).notNull(),
        bidAmount: decimal('bidAmount', {
            precision: ethValuePrecision,
            scale: 0
        }).notNull(),
        signature: varchar('signature').notNull(),
        orderHash: varchar('orderHash').notNull().unique(),
        orderData: jsonb('orderData').notNull(),
        bidType: enumBidType('bidType').default('listing').notNull(),
        status: enumBidStatus('status').default('active').notNull(),
        expirationTime: timestamp('expirationTime', {
            precision: 3
        }).notNull(),
        acceptedAt: timestamp('acceptedAt', { precision: 3 }),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        index('bidsListingIdx').on(table.listingId),
        index('bidsCardIdx').on(table.cardId),
        index('bidsBidderIdx').on(table.bidderId),
        index('bidsStatusIdx').on(table.status),
        index('bidsTypeIdx').on(table.bidType),
        index('bidsCreatedAtIdx').on(table.createdAt),
        index('bidsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const transactions = pgTable(
    'transactions',
    {
        id: uuid('id').primaryKey().notNull(),
        fromUserId: uuid('fromUserId')
            .references(() => users.id, {
                onDelete: 'set null'
            })
            .notNull(),
        toUserId: uuid('toUserId')
            .references(() => users.id, {
                onDelete: 'set null'
            })
            .notNull(),
        cardId: uuid('cardId')
            .references(() => cards.id, {
                onDelete: 'set null'
            })
            .notNull(),
        competitionId: uuid('competitionId').references(() => competitions.id, {
            onDelete: 'set null'
        }),
        price: decimal('price', {
            precision: ethValuePrecision,
            scale: 0
        }).notNull(),
        transactionType:
            enumTransactionsTransactionType('transactionType').notNull(),
        packPurchaseId: uuid('packPurchaseId').references(
            () => packPurchases.id,
            { onDelete: 'set null' }
        ),
        status: enumTransactionStatus('status').notNull(),
        hash: varchar('hash', { length: 66 }).notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('transactionsFromUserIdx').on(table.fromUserId),
        index('transactionsToUserIdx').on(table.toUserId),
        index('transactionsCardIdx').on(table.cardId),
        index('transactionsCompetitionIdx').on(table.competitionId),
        index('transactionsHashIdx').on(table.hash),
        index('transactionsCreatedAtIdx').on(table.createdAt),
        index('transactionsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const userDeviceAuthorizations = pgTable(
    'userDeviceAuthorizations',
    {
        id: uuid('id').primaryKey().notNull(),
        userId: uuid('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'set null' }),
        deviceType: varchar('deviceType').notNull(),
        accessToken: varchar('accessToken'),
        refreshToken: varchar('refreshToken'),
        scopes: varchar('scopes'),
        lastSyncedAt: timestamp('lastSyncedAt', { precision: 3 }),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('userDeviceAuthorizationsUserIdx').on(table.userId),
        index('userDeviceAuthorizationsCreatedAtIdx').on(table.createdAt),
        index('userDeviceAuthorizationsUpdatedAtIdx').on(table.updatedAt)
    ]
);

export const posts = pgTable(
    'posts',
    {
        id: uuid('id').primaryKey().notNull(),
        userId: uuid('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        runId: uuid('runId').references(() => runs.id, { onDelete: 'cascade' }),
        title: varchar('title').notNull(),
        content: text('content').notNull(),
        status: enumPostsStatus('status').default('visible').notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        index('postsUserIdx').on(table.userId),
        index('postsRunIdx').on(table.runId),
        index('postsCreatedAtIdx').on(table.createdAt),
        index('postsUpdatedAtIdx').on(table.updatedAt)
    ]
);

// NOTE POTENTIAL ERROR
export const comments = pgTable(
    'comments',
    {
        id: uuid('id').primaryKey().notNull(),
        postId: uuid('postId')
            .notNull()
            .references(() => posts.id, { onDelete: 'cascade' }),
        userId: uuid('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        content: varchar('content').notNull(),
        parentCommentId: uuid('parentCommentId'),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        // Self-referencing FK:
        foreignKey({
            columns: [table.parentCommentId],
            foreignColumns: [table.id]
        }),
        index('commentsPostIdx').on(table.postId),
        index('commentsUserIdx').on(table.userId),
        index('commentsParentIdx').on(table.parentCommentId),
        index('commentsCreatedAtIdx').on(table.createdAt)
    ]
);

export const reactions = pgTable(
    'reactions',
    {
        id: uuid('id').primaryKey().notNull(),
        userId: uuid('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        postId: uuid('postId').references(() => posts.id, {
            onDelete: 'cascade'
        }),
        commentId: uuid('commentId').references(() => comments.id, {
            onDelete: 'cascade'
        }),
        type: enumReactionType('type').notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('reactionsPostIdx').on(table.postId),
        index('reactionsCommentIdx').on(table.commentId),
        index('reactionsUserIdx').on(table.userId),
        uniqueIndex('reactionsPostUniqueIdx').on(
            table.userId,
            table.postId,
            table.type
        ),
        uniqueIndex('reactionsCommentUniqueIdx').on(
            table.userId,
            table.commentId,
            table.type
        )
    ]
);

export const follows = pgTable(
    'follows',
    {
        id: uuid('id').primaryKey().notNull(),
        followerId: uuid('followerId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        followTargetId: uuid('followTargetId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deletedAt', { precision: 3 })
    },
    (table) => [
        index('followsFollowerIdx').on(table.followerId),
        index('followsFollowingIdx').on(table.followTargetId),
        uniqueIndex('followsUniqueIdx').on(
            table.followerId,
            table.followTargetId
        )
    ]
);

export const profileViews = pgTable(
    'profileViews',
    {
        id: uuid('id').primaryKey().notNull(),
        profileId: uuid('profileId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        viewerId: uuid('viewerId').references(() => users.id, {
            onDelete: 'set null'
        }),
        ipAddress: varchar('ipAddress'),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('profileViewsProfileIdx').on(table.profileId),
        index('profileViewsCreatedAtIdx').on(table.createdAt),
        index('profileViewsIpRecentIdx').on(table.ipAddress, table.createdAt)
    ]
);

export const reports = pgTable(
    'reports',
    {
        id: uuid('id').primaryKey().notNull(),
        reporterId: uuid('reporterId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        postId: uuid('postId').references(() => posts.id, {
            onDelete: 'cascade'
        }),
        commentId: uuid('commentId').references(() => comments.id, {
            onDelete: 'cascade'
        }),
        reason: enumReportReason('reason').notNull(),
        details: varchar('details'),
        status: enumReportStatus('status').default('pending'),
        reviewedBy: uuid('reviewedBy').references(() => users.id, {
            onDelete: 'set null'
        }),
        reviewedAt: timestamp('reviewedAt', { precision: 3 }),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        index('reportsReporterIdx').on(table.reporterId),
        index('reportsPostIdx').on(table.postId),
        index('reportsCommentIdx').on(table.commentId),
        index('reportsStatusIdx').on(table.status)
    ]
);

export const runnerLeaderboard = pgTable(
    'runnerLeaderboard',
    {
        id: uuid('id').primaryKey().notNull(),
        runnerId: uuid('runnerId')
            .notNull()
            .references(() => runners.id, { onDelete: 'cascade' }),
        ranking: integer('ranking').notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        uniqueIndex('runnerLeaderboardRunnerIdx').on(table.runnerId),
        index('runnerLeaderboardRankingIdx').on(table.ranking)
    ]
);

export const managerLeaderboard = pgTable(
    'managerLeaderboard',
    {
        id: uuid('id').primaryKey().notNull(),
        userId: uuid('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        ranking: integer('ranking').notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3 })
            .defaultNow()
            .notNull(),
        createdAt: timestamp('createdAt', { precision: 3 })
            .defaultNow()
            .notNull()
    },
    (table) => [
        uniqueIndex('managerLeaderboardUserIdx').on(table.userId),
        index('managerLeaderboardRankingIdx').on(table.ranking)
    ]
);
