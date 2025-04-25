import {
    db,
    eq,
    and,
    desc,
    count as countFn,
    posts,
    users,
    runners,
    runs,
    comments,
    reactions,
    follows
} from '@phyt/database';
import {
    UUIDv7,
    NotFoundError,
    DatabaseError,
    Post,
    PostQueryParams,
    UpdatePostRequest,
    PostResponse
} from '@phyt/types';

import { calculateTrendingScore } from '@/lib/utils.js';
import { userService } from '@/services/userServices.js';

export const postService = {
    createPost: async (runId: UUIDv7): Promise<Post> => {
        try {
            const run = await db
                .select()
                .from(runs)
                .where(eq(runs.id, runId))
                .limit(1);
            if (!run.length) {
                throw new NotFoundError(
                    `Run with ID ${String(runId)} not found`
                );
            }

            const runner = await db
                .select()
                .from(runners)
                .where(eq(runners.id, run[0].runnerId))
                .limit(1);
            if (!runner.length) {
                throw new NotFoundError(
                    `Runner for run ID ${String(runId)} not found`
                );
            }

            const userId = runner[0].userId;

            const [post] = await db
                .insert(posts)
                .values({
                    userId: userId,
                    runId: runId
                })
                .returning();

            return {
                ...post,
                id: post.id as UUIDv7,
                userId: post.userId as UUIDv7,
                runId: post.runId as UUIDv7
            };
        } catch (error) {
            console.error('Error with createPost: ', error);
            throw new DatabaseError('Failed to create post');
        }
    },

    getPostById: async (postId: UUIDv7): Promise<PostResponse> => {
        try {
            const query = db
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
                .where(eq(posts.id, postId))
                .groupBy(posts.id, users.id, runs.id, runners.id);

            const post = await query;
            if (!post.length) {
                throw new NotFoundError(
                    `Post with ID ${String(postId)} not found`
                );
            }
            return {
                posts: [
                    {
                        ...post[0],
                        post: {
                            ...post[0].post,
                            id: post[0].post.id as UUIDv7,
                            userId: post[0].post.userId as UUIDv7,
                            runId: post[0].post.runId as UUIDv7
                        }
                    }
                ],
                pagination: {
                    page: 1,
                    limit: 1,
                    total: 1,
                    totalPages: 1
                }
            };
        } catch (error) {
            console.error('Error getting post by ID:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get post');
        }
    },

    getPosts: async (
        privyId: string,
        { limit = 10, page = 1, filter }: PostQueryParams
    ): Promise<PostResponse> => {
        try {
            const offset = (page - 1) * limit;

            const user = await userService.getUserByPrivyId(privyId);
            const userId = user.id;

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

            if (filter === 'following' && userId) {
                const followingResults = await db
                    .select({ followingId: follows.followTargetId })
                    .from(follows)
                    .where(eq(follows.followerId, userId));

                const followingIds = followingResults.map(
                    (row) => row.followingId
                );

                allPosts = allPosts.filter((post) =>
                    followingIds.includes(post.post.userId)
                );

                allPosts.sort(
                    (a, b) =>
                        b.post.createdAt.getTime() - a.post.createdAt.getTime()
                );
            } else if (filter === 'trending') {
                const trendingResults = await Promise.all(
                    allPosts.map(async (post) => {
                        const trendingScore = await calculateTrendingScore(
                            post.post.id as UUIDv7,
                            1
                        );
                        return { post, trendingScore };
                    })
                );

                allPosts = trendingResults
                    .sort((a, b) => b.trendingScore - a.trendingScore)
                    .map((item) => item.post);
            } else {
                allPosts.sort(
                    (a, b) =>
                        b.post.createdAt.getTime() - a.post.createdAt.getTime()
                );
            }

            const total = allPosts.length;
            const totalPages = Math.ceil(total / limit);
            const nextPage = page < totalPages ? page + 1 : undefined;

            const paginatedPosts = allPosts.slice(offset, offset + limit);

            return {
                posts: paginatedPosts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    nextPage
                }
            } as PostResponse;
        } catch (error) {
            console.error('Error with getPosts: ', error);
            throw new DatabaseError('Failed to get posts');
        }
    },

    getUserPostsById: async (
        userId: UUIDv7,
        { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
    ): Promise<PostResponse[]> => {
        try {
            const offset = (page - 1) * limit;

            const queryResults = await db
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
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .where(
                    and(eq(posts.userId, userId), eq(posts.status, 'visible'))
                )
                .orderBy(desc(posts.createdAt))
                .limit(limit)
                .offset(offset);

            const postResponses: PostResponse[] = queryResults.map((result) => {
                return {
                    posts: [
                        {
                            ...result,
                            post: {
                                ...result.post,
                                id: result.post.id as UUIDv7,
                                userId: result.post.userId as UUIDv7,
                                runId: result.post.runId as UUIDv7
                            }
                        }
                    ],
                    pagination: undefined
                };
            });

            return postResponses;
        } catch (error) {
            console.error('Error with getUserPosts: ', error);
            throw new DatabaseError('Failed to get user posts');
        }
    },

    getUserPostsByWalletAddress: async (
        walletAddress: string,
        { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
    ): Promise<PostResponse[]> => {
        try {
            const offset = (page - 1) * limit;

            const user =
                await userService.getUserByWalletAddress(walletAddress);
            const userId = user.id;

            const queryResults = await db
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
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .where(
                    and(eq(posts.userId, userId), eq(posts.status, 'visible'))
                )
                .orderBy(desc(posts.createdAt))
                .limit(limit)
                .offset(offset);

            const postResponses: PostResponse[] = queryResults.map(
                (result) => ({
                    posts: [
                        {
                            ...result,
                            post: {
                                ...result.post,
                                id: result.post.id as UUIDv7,
                                userId: result.post.userId as UUIDv7,
                                runId: result.post.runId as UUIDv7
                            }
                        }
                    ],
                    pagination: undefined
                })
            );

            return postResponses;
        } catch (error) {
            console.error('Error with getUserPosts: ', error);
            throw new DatabaseError('Failed to get user posts');
        }
    },

    updatePostStatus: async ({
        postId,
        status
    }: UpdatePostRequest): Promise<Post> => {
        try {
            const postResults = await db
                .update(posts)
                .set({ status })
                .where(eq(posts.id, postId))
                .returning();

            if (!postResults.length) {
                throw new NotFoundError(
                    `Post with ID ${String(postId)} not found`
                );
            }

            return {
                ...postResults[0],
                id: postResults[0].id as UUIDv7,
                userId: postResults[0].userId as UUIDv7,
                runId: postResults[0].runId as UUIDv7
            };
        } catch (error) {
            console.error('Error with updatePostStatus: ', error);
            throw new DatabaseError('Failed to update post status');
        }
    },

    deletePost: async (postId: UUIDv7): Promise<Post> => {
        try {
            // This will cascade delete due to foreign key constraints
            const postResults = await db
                .delete(posts)
                .where(eq(posts.id, postId))
                .returning();

            if (!postResults.length) {
                throw new NotFoundError(
                    `Post with ID ${String(postId)} not found`
                );
            }

            return {
                ...postResults[0],
                id: postResults[0].id as UUIDv7,
                userId: postResults[0].userId as UUIDv7,
                runId: postResults[0].runId as UUIDv7
            };
        } catch (error) {
            console.error('Error with deletePost: ', error);
            throw new DatabaseError('Failed to delete post');
        }
    }
};
