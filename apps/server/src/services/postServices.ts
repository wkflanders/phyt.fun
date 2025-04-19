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
    NotFoundError,
    DatabaseError,
    Post,
    PostQueryParams,
    PostUpdateRequest,
    PostResponse,
    HttpError
} from '@phyt/types';

import { calculateTrendingScore } from '@/lib/utils.js';
import { userService } from '@/services/userServices.js';

export const postService = {
    createPost: async (runId: number): Promise<Post> => {
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
                .where(eq(runners.id, run[0].runner_id))
                .limit(1);
            if (!runner.length) {
                throw new NotFoundError(
                    `Runner for run ID ${String(runId)} not found`
                );
            }

            const userId = runner[0].user_id;

            const [post] = await db
                .insert(posts)
                .values({
                    user_id: userId,
                    run_id: runId
                })
                .returning();

            return post;
        } catch (error) {
            console.error('Error with createPost: ', error);
            throw new HttpError('Failed to create post');
        }
    },

    getPostById: async (postId: number): Promise<PostResponse> => {
        try {
            const query = db
                .select({
                    post: posts,
                    user: {
                        username: users.username,
                        avatar_url: users.avatar_url,
                        role: users.role,
                        is_pooled: runners.is_pooled
                    },
                    run: {
                        distance_m: runs.distance_m,
                        duration_seconds: runs.duration_seconds,
                        average_pace_sec: runs.average_pace_sec,
                        gps_route_data: runs.gps_route_data,
                        elevation_gain_m: runs.elevation_gain_m,
                        start_time: runs.start_time,
                        end_time: runs.end_time
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments'),
                        reactions: countFn(reactions.id).as('reactions')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.user_id, users.id))
                .innerJoin(runs, eq(posts.run_id, runs.id))
                .innerJoin(runners, eq(posts.user_id, runners.user_id))
                .leftJoin(comments, eq(comments.post_id, posts.id))
                .where(eq(posts.id, postId))
                .groupBy(posts.id, users.id, runs.id, runners.id);

            const post = await query;
            if (!post.length) {
                throw new NotFoundError(
                    `Post with ID ${String(postId)} not found`
                );
            }
            return {
                posts: [post[0]],
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
                        avatar_url: users.avatar_url,
                        role: users.role,
                        is_pooled: runners.is_pooled
                    },
                    run: {
                        distance_m: runs.distance_m,
                        duration_seconds: runs.duration_seconds,
                        average_pace_sec: runs.average_pace_sec,
                        gps_route_data: runs.gps_route_data,
                        elevation_gain_m: runs.elevation_gain_m,
                        start_time: runs.start_time,
                        end_time: runs.end_time
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments'),
                        reactions: countFn(reactions.id).as('reactions')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.user_id, users.id))
                .innerJoin(runs, eq(posts.run_id, runs.id))
                .innerJoin(runners, eq(posts.user_id, runners.user_id))
                .leftJoin(comments, eq(comments.post_id, posts.id))
                .leftJoin(reactions, eq(reactions.post_id, posts.id))
                .where(eq(posts.status, 'visible'))
                .groupBy(posts.id, users.id, runs.id, runners.id);

            let allPosts = await baseQuery;

            if (filter === 'following' && userId) {
                const followingResults = await db
                    .select({ followingId: follows.follow_target_id })
                    .from(follows)
                    .where(eq(follows.follower_id, userId));

                const followingIds = followingResults.map(
                    (row) => row.followingId
                );

                allPosts = allPosts.filter((post) =>
                    followingIds.includes(post.post.user_id)
                );

                allPosts.sort(
                    (a, b) =>
                        b.post.created_at.getTime() -
                        a.post.created_at.getTime()
                );
            } else if (filter === 'trending') {
                const trendingResults = await Promise.all(
                    allPosts.map(async (post) => {
                        const trendingScore = await calculateTrendingScore(
                            post.post.id,
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
                        b.post.created_at.getTime() -
                        a.post.created_at.getTime()
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
            };
        } catch (error) {
            console.error('Error with getPosts: ', error);
            throw new HttpError('Failed to get posts');
        }
    },

    getUserPostsById: async (
        userId: number,
        { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
    ): Promise<PostResponse[]> => {
        try {
            const offset = (page - 1) * limit;

            const queryResults = await db
                .select({
                    post: posts,
                    user: {
                        username: users.username,
                        avatar_url: users.avatar_url,
                        role: users.role,
                        is_pooled: runners.is_pooled
                    },
                    run: {
                        distance_m: runs.distance_m,
                        duration_seconds: runs.duration_seconds,
                        average_pace_sec: runs.average_pace_sec,
                        gps_route_data: runs.gps_route_data,
                        elevation_gain_m: runs.elevation_gain_m,
                        start_time: runs.start_time,
                        end_time: runs.end_time
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments'),
                        reactions: countFn(reactions.id).as('reactions')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.user_id, users.id))
                .innerJoin(runners, eq(posts.user_id, runners.user_id))
                .innerJoin(runs, eq(posts.run_id, runs.id))
                .leftJoin(comments, eq(comments.post_id, posts.id))
                .leftJoin(reactions, eq(reactions.post_id, posts.id))
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .where(
                    and(eq(posts.user_id, userId), eq(posts.status, 'visible'))
                )
                .orderBy(desc(posts.created_at))
                .limit(limit)
                .offset(offset);

            const postResponses: PostResponse[] = queryResults.map((result) => {
                return {
                    posts: [result],
                    pagination: undefined
                };
            });

            return postResponses;
        } catch (error) {
            console.error('Error with getUserPosts: ', error);
            throw new HttpError('Failed to get user posts');
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
                        avatar_url: users.avatar_url,
                        role: users.role,
                        is_pooled: runners.is_pooled
                    },
                    run: {
                        distance_m: runs.distance_m,
                        duration_seconds: runs.duration_seconds,
                        average_pace_sec: runs.average_pace_sec,
                        gps_route_data: runs.gps_route_data,
                        elevation_gain_m: runs.elevation_gain_m,
                        start_time: runs.start_time,
                        end_time: runs.end_time
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments'),
                        reactions: countFn(reactions.id).as('reactions')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.user_id, users.id))
                .innerJoin(runners, eq(posts.user_id, runners.user_id))
                .innerJoin(runs, eq(posts.run_id, runs.id))
                .leftJoin(comments, eq(comments.post_id, posts.id))
                .leftJoin(reactions, eq(reactions.post_id, posts.id))
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .where(
                    and(eq(posts.user_id, userId), eq(posts.status, 'visible'))
                )
                .orderBy(desc(posts.created_at))
                .limit(limit)
                .offset(offset);

            const postResponses: PostResponse[] = queryResults.map((result) => {
                return {
                    posts: [result],
                    pagination: undefined
                };
            });

            return postResponses;
        } catch (error) {
            console.error('Error with getUserPosts: ', error);
            throw new HttpError('Failed to get user posts');
        }
    },

    updatePostStatus: async ({
        postId,
        status
    }: PostUpdateRequest): Promise<Post> => {
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

            return postResults[0];
        } catch (error) {
            console.error('Error with updatePostStatus: ', error);
            throw new HttpError('Failed to update post status');
        }
    },

    deletePost: async (postId: number): Promise<Post> => {
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

            return postResults[0];
        } catch (error) {
            console.error('Error with deletePost: ', error);
            throw new HttpError('Failed to delete post');
        }
    }
};
