import {
    db,
    posts,
    users,
    runners,
    runs,
    comments,
    reactions,
    follows,
    eq,
    and,
    desc,
    count as countFn
} from '@phyt/database';

import { calculateTrendingScore } from '@/lib/utils.js';

import type { UUIDv7, Post, PostQueryParams, PostResponse } from '@phyt/types';

export interface PostRepository {
    create(userId: UUIDv7, runId: UUIDv7): Promise<Post>;
    updateStatus(postId: UUIDv7, status: Post['status']): Promise<Post>;
    delete(postId: UUIDv7): Promise<Post>;
    getByUserId(userId: UUIDv7, params: PostQueryParams): Promise<PostResponse>;
    getByUserWalletAddress(
        walletAddress: `0x${string}`,
        params: PostQueryParams
    ): Promise<PostResponse>;
    getById(postId: UUIDv7): Promise<PostResponse>;
    list(userId: UUIDv7, params: PostQueryParams): Promise<PostResponse>;
}

export const makePostRepository = () => {
    const postRepository: PostRepository = {
        create: async (userId, runId) => {
            const [post] = await db
                .insert(posts)
                .values({ userId: userId, runId: runId })
                .returning();
            return {
                ...post,
                id: post.id as UUIDv7,
                userId: post.userId as UUIDv7,
                runId: post.runId as UUIDv7
            };
        },

        updateStatus: async (postId, status) => {
            const [updated] = await db
                .update(posts)
                .set({ status, updatedAt: new Date() })
                .where(eq(posts.id, postId))
                .returning();
            return {
                ...updated,
                id: updated.id as UUIDv7,
                userId: updated.userId as UUIDv7,
                runId: updated.runId as UUIDv7
            };
        },

        delete: async (postId) => {
            const [deleted] = await db
                .delete(posts)
                .where(eq(posts.id, postId))
                .returning();
            return {
                ...deleted,
                id: deleted.id as UUIDv7,
                userId: deleted.userId as UUIDv7,
                runId: deleted.runId as UUIDv7
            };
        },

        getByUserId: async (userId, params) => {
            const { page = 1, limit = 10 } = params;
            const offset = (page - 1) * limit;
            const rows = await db
                .select({
                    post: posts,
                    user: {
                        username: users.username,
                        avatarUrl: users.avatarUrl,
                        role: users.role,
                        isPooled: runners.isPooled
                    },
                    run: {
                        distance: runs.distance,
                        durationSeconds: runs.durationSeconds,
                        averagePaceSec: runs.averagePaceSec,
                        gpsRouteData: runs.gpsRouteData,
                        elevationGain: runs.elevationGain,
                        startTime: runs.startTime,
                        endTime: runs.endTime
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments'),
                        reactions: countFn(reactions.id).as('reactions')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.userId, users.id))
                .innerJoin(runners, eq(posts.userId, runners.userId))
                .innerJoin(runs, eq(posts.runId, runs.id))
                .leftJoin(comments, eq(comments.postId, posts.id))
                .leftJoin(reactions, eq(reactions.postId, posts.id))
                .where(
                    and(eq(posts.userId, userId), eq(posts.status, 'visible'))
                )
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .orderBy(desc(posts.createdAt))
                .limit(limit)
                .offset(offset);

            const [{ value: total }] = await db
                .select({ value: countFn() })
                .from(posts)
                .where(eq(posts.userId, userId));

            return {
                posts: rows.map((row) => ({
                    ...row,
                    post: {
                        ...row.post,
                        id: row.post.id as UUIDv7,
                        userId: row.post.userId as UUIDv7,
                        runId: row.post.runId as UUIDv7
                    },
                    user: {
                        ...row.user,
                        avatarUrl: row.user.avatarUrl
                    }
                })),
                pagination: {
                    page,
                    limit,
                    total: Number(total),
                    totalPages: Math.ceil(Number(total) / limit)
                }
            };
        },

        getByUserWalletAddress: async (walletAddress, params) => {
            const { page = 1, limit = 10 } = params;
            const offset = (page - 1) * limit;

            // Find user by wallet address
            const [user] = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.walletAddress, walletAddress))
                .limit(1);

            if (!user) {
                return {
                    posts: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0
                    }
                };
            }

            const rows = await db
                .select({
                    post: posts,
                    user: {
                        username: users.username,
                        avatarUrl: users.avatarUrl,
                        role: users.role,
                        isPooled: runners.isPooled
                    },
                    run: {
                        distance: runs.distance,
                        durationSeconds: runs.durationSeconds,
                        averagePaceSec: runs.averagePaceSec,
                        gpsRouteData: runs.gpsRouteData,
                        elevationGain: runs.elevationGain,
                        startTime: runs.startTime,
                        endTime: runs.endTime
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments'),
                        reactions: countFn(reactions.id).as('reactions')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.userId, users.id))
                .innerJoin(runners, eq(posts.userId, runners.userId))
                .innerJoin(runs, eq(posts.runId, runs.id))
                .leftJoin(comments, eq(comments.postId, posts.id))
                .leftJoin(reactions, eq(reactions.postId, posts.id))
                .where(
                    and(eq(posts.userId, user.id), eq(posts.status, 'visible'))
                )
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .orderBy(desc(posts.createdAt))
                .limit(limit)
                .offset(offset);

            const [{ value: total }] = await db
                .select({ value: countFn() })
                .from(posts)
                .where(eq(posts.userId, user.id));

            return {
                posts: rows.map((row) => ({
                    ...row,
                    post: {
                        ...row.post,
                        id: row.post.id as UUIDv7,
                        userId: row.post.userId as UUIDv7,
                        runId: row.post.runId as UUIDv7
                    },
                    user: {
                        ...row.user,
                        avatarUrl: row.user.avatarUrl
                    }
                })),
                pagination: {
                    page,
                    limit,
                    total: Number(total),
                    totalPages: Math.ceil(Number(total) / limit)
                }
            };
        },

        getById: async (postId) => {
            const [result] = await db
                .select({
                    post: posts,
                    user: {
                        username: users.username,
                        avatarUrl: users.avatarUrl,
                        role: users.role,
                        isPooled: runners.isPooled
                    },
                    run: {
                        distance: runs.distance,
                        durationSeconds: runs.durationSeconds,
                        averagePaceSec: runs.averagePaceSec,
                        gpsRouteData: runs.gpsRouteData,
                        elevationGain: runs.elevationGain,
                        startTime: runs.startTime,
                        endTime: runs.endTime
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments'),
                        reactions: countFn(reactions.id).as('reactions')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.userId, users.id))
                .innerJoin(runners, eq(posts.userId, runners.userId))
                .innerJoin(runs, eq(posts.runId, runs.id))
                .leftJoin(comments, eq(comments.postId, posts.id))
                .leftJoin(reactions, eq(reactions.postId, posts.id))
                .where(eq(posts.id, postId))
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .limit(1);

            return {
                posts: [
                    {
                        ...result,
                        post: {
                            ...result.post,
                            id: result.post.id as UUIDv7,
                            userId: result.post.userId as UUIDv7,
                            runId: result.post.runId as UUIDv7
                        },
                        user: {
                            ...result.user,
                            avatarUrl: result.user.avatarUrl
                        }
                    }
                ]
            };
        },

        list: async (userId, params): Promise<PostResponse> => {
            const { page = 1, limit = 10, filter } = params;
            const offset = (page - 1) * limit;
            // Base query: join posts → users, runs, runners; aggregate comment/reaction counts :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
            const baseQuery = db
                .select({
                    post: posts,
                    user: {
                        username: users.username,
                        avatarUrl: users.avatarUrl,
                        role: users.role,
                        isPooled: runners.isPooled
                    },
                    run: {
                        distance: runs.distance,
                        durationSeconds: runs.durationSeconds,
                        averagePaceSec: runs.averagePaceSec,
                        gpsRouteData: runs.gpsRouteData,
                        elevationGain: runs.elevationGain,
                        startTime: runs.startTime,
                        endTime: runs.endTime
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments'),
                        reactions: countFn(reactions.id).as('reactions')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.userId, users.id))
                .innerJoin(runs, eq(posts.runId, runs.id))
                .innerJoin(runners, eq(posts.userId, runners.userId))
                .leftJoin(comments, eq(comments.postId, posts.id))
                .leftJoin(reactions, eq(reactions.postId, posts.id))
                .where(eq(posts.status, 'visible'))
                .groupBy(posts.id, users.id, runs.id, runners.id);

            let allPosts = await baseQuery;

            // Apply “following” filter :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
            if (filter === 'following') {
                const following = await db
                    .select({ id: follows.followTargetId })
                    .from(follows)
                    .where(eq(follows.followerId, userId));
                const ids = following.map((row) => row.id);
                allPosts = allPosts
                    .filter((p) => ids.includes(p.post.userId))
                    .sort(
                        (a, b) =>
                            b.post.createdAt.getTime() -
                            a.post.createdAt.getTime()
                    );
            }
            // Apply “trending” filter :contentReference[oaicite:4]{index=4}&#8203;:contentReference[oaicite:5]{index=5}
            else if (filter === 'trending') {
                const scored = await Promise.all(
                    allPosts.map(async (p) => ({
                        p,
                        score: await calculateTrendingScore(
                            p.post.id as UUIDv7,
                            1
                        )
                    }))
                );
                allPosts = scored
                    .sort((a, b) => b.score - a.score)
                    .map((item) => item.p);
            }
            // Default: newest first
            else {
                allPosts.sort(
                    (a, b) =>
                        b.post.createdAt.getTime() - a.post.createdAt.getTime()
                );
            }
            const total = allPosts.length;
            const totalPages = Math.ceil(total / limit);
            const nextPage = page < totalPages ? page + 1 : undefined;
            const postsPage = allPosts.slice(offset, offset + limit);

            return {
                posts: postsPage.map((row) => ({
                    ...row,
                    post: {
                        ...row.post,
                        id: row.post.id as UUIDv7,
                        userId: row.post.userId as UUIDv7,
                        runId: row.post.runId as UUIDv7
                    },
                    user: {
                        ...row.user,
                        avatarUrl: row.user.avatarUrl
                    }
                })),
                pagination: { page, limit, total, totalPages, nextPage }
            };
        }
    };
    return Object.freeze(postRepository);
};
