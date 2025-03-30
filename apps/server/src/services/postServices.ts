import {
    db,
    eq,
    and,
    desc,
    asc,
    or,
    not,
    like,
    sql,
    count as countFn,
    posts,
    users,
    runners,
    runs,
    comments,
    reactions,
    follows
} from '@phyt/database';
import { NotFoundError, DatabaseError } from '@phyt/types';

export const postService = {
    createPost: async (runId: number) => {
        try {
            const run = await db
                .select()
                .from(runs)
                .where(eq(runs.id, runId))
                .limit(1);
            if (!run.length) {
                throw new NotFoundError(`Run with ID ${runId} not found`);
            }

            const runner = await db
                .select()
                .from(runners)
                .where(eq(runners.id, run[0].runner_id))
                .limit(1);
            if (!runner.length) {
                throw new NotFoundError(`Runner for run ID ${runId} not found`);
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
            console.error('Error creating post:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to create post');
        }
    },

    getPostById: async (postId: number) => {
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
                        elevation_gain_m: runs.elevation_gain_m,
                        start_time: runs.start_time,
                        end_time: runs.end_time
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.user_id, users.id))
                .innerJoin(runs, eq(posts.run_id, runs.id))
                .innerJoin(runners, eq(posts.user_id, runners.user_id))
                .leftJoin(comments, eq(comments.post_id, posts.id))
                .where(eq(posts.id, postId))
                .groupBy(posts.id, users.id, runs.id, runners.id);

            const [post] = await query;
            if (!post) {
                throw new NotFoundError(`Post with ID ${postId} not found`);
            }
            return post;
        } catch (error) {
            console.error('Error getting post by ID:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get post');
        }
    },

    getPosts: async ({
        pageParam = 1,
        limit = 10,
        userId,
        filter
    }: {
        pageParam?: number;
        limit?: number;
        userId?: number;
        filter?: 'following' | 'trending' | 'all';
    }) => {
        try {
            const offset = (pageParam - 1) * limit;

            let query = db
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
                        elevation_gain_m: runs.elevation_gain_m,
                        start_time: runs.start_time,
                        end_time: runs.end_time
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments')
                    }
                })
                .from(posts)
                .innerJoin(users, eq(posts.user_id, users.id))
                .innerJoin(runs, eq(posts.run_id, runs.id))
                .innerJoin(runners, eq(posts.user_id, runners.user_id))
                .leftJoin(comments, eq(comments.post_id, posts.id))
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .where(eq(posts.status, 'visible'));

            // Apply filter if specified
            let orderByClause;
            if (filter === 'following' && userId) {
                query = query.innerJoin(
                    follows,
                    and(
                        eq(posts.user_id, follows.following_id),
                        eq(posts.status, 'visible'),
                        eq(follows.follower_id, userId)
                    )
                );
                orderByClause = desc(posts.created_at);
            } else if (filter === 'trending') {
                // For trending, order by most reactions/comments in the last 7 days
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                orderByClause = desc(
                    sql`(
                SELECT COUNT(*) FROM reactions WHERE reactions.post_id = posts.id AND reactions.created_at > ${sevenDaysAgo.toISOString()}
              ) + (
                SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id AND comments.created_at > ${sevenDaysAgo.toISOString()}
              )`
                );
            } else {
                // Default sorting by most recent
                orderByClause = desc(posts.created_at);
            }
            query = (query as any).orderBy(orderByClause);

            const results = await query.limit(limit).offset(offset);

            const [{ count }] = await db
                .select({ count: countFn(posts.id) })
                .from(posts)
                .where(eq(posts.status, 'visible'));

            const total = Number(count);
            const totalPages = Math.ceil(total / limit);
            const nextPage = pageParam < totalPages ? pageParam + 1 : undefined;

            return {
                posts: results,
                pagination: {
                    page: pageParam,
                    limit,
                    total,
                    totalPages,
                    nextPage
                }
            };
        } catch (error) {
            console.error('Error getting posts:', error);
            throw new DatabaseError('Failed to get posts');
        }
    },

    getUserPosts: async (
        userId: number,
        { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
    ) => {
        try {
            const offset = (page - 1) * limit;

            const results = await db
                .select({
                    post: posts,
                    run: {
                        distance_m: runs.distance_m,
                        duration_seconds: runs.duration_seconds,
                        average_pace_sec: runs.average_pace_sec,
                        elevation_gain_m: runs.elevation_gain_m,
                        start_time: runs.start_time,
                        end_time: runs.end_time
                    },
                    stats: {
                        comments: countFn(comments.id).as('comments')
                    }
                })
                .from(posts)
                .innerJoin(runs, eq(posts.run_id, runs.id))
                .leftJoin(comments, eq(comments.post_id, posts.id))
                .where(
                    and(eq(posts.user_id, userId), eq(posts.status, 'visible'))
                )
                .orderBy(desc(posts.created_at))
                .limit(limit)
                .offset(offset);

            // Get total count for pagination
            const [{ count }] = await db
                .select({ count: countFn(posts.id) })
                .from(posts)
                .where(
                    and(eq(posts.user_id, userId), eq(posts.status, 'visible'))
                );

            return {
                posts: results,
                pagination: {
                    page,
                    limit,
                    total: Number(count),
                    totalPages: Math.ceil(Number(count) / limit)
                }
            };
        } catch (error) {
            console.error('Error getting user posts:', error);
            throw new DatabaseError('Failed to get user posts');
        }
    },

    updatePostStatus: async (
        postId: number,
        status: 'visible' | 'hidden' | 'deleted'
    ) => {
        try {
            const [post] = await db
                .update(posts)
                .set({ status })
                .where(eq(posts.id, postId))
                .returning();

            if (!post) {
                throw new NotFoundError(`Post with ID ${postId} not found`);
            }

            return post;
        } catch (error) {
            console.error('Error updating post status:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to update post status');
        }
    },

    deletePost: async (postId: number) => {
        try {
            // This will cascade delete due to foreign key constraints
            const [deletedPost] = await db
                .delete(posts)
                .where(eq(posts.id, postId))
                .returning();

            if (!deletedPost) {
                throw new NotFoundError(`Post with ID ${postId} not found`);
            }

            return deletedPost;
        } catch (error) {
            console.error('Error deleting post:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to delete post');
        }
    }
};
