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

import type { Post, PostQueryParams, PostResponse } from '@phyt/types';

export interface PostRepository {
    create(user_id: number, run_id: number): Promise<Post>;
    updateStatus(post_id: number, status: Post['status']): Promise<Post>;
    delete(post_id: number): Promise<Post>;
    getByUserId(
        user_id: number,
        params: PostQueryParams
    ): Promise<PostResponse>;
    getById(post_id: number): Promise<PostResponse>;
    list(user_id: number, params: PostQueryParams): Promise<PostResponse>;
}

export const makePostRepository = () => {
    const postRepository: PostRepository = {
        create: async (user_id, run_id) => {
            const [post] = await db
                .insert(posts)
                .values({ user_id: user_id, run_id: run_id })
                .returning();
            return post;
        },

        updateStatus: async (post_id, status) => {
            const [updated] = await db
                .update(posts)
                .set({ status, updated_at: new Date() })
                .where(eq(posts.id, post_id))
                .returning();
            return updated;
        },

        delete: async (post_id) => {
            const [deleted] = await db
                .delete(posts)
                .where(eq(posts.id, post_id))
                .returning();
            return deleted;
        },

        getByUserId: async (user_id, params) => {
            const { page = 1, limit = 10 } = params;
            const offset = (page - 1) * limit;
            const rows = await db
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
                .where(
                    and(eq(posts.user_id, user_id), eq(posts.status, 'visible'))
                )
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .orderBy(desc(posts.created_at))
                .limit(limit)
                .offset(offset);

            const [{ value: total }] = await db
                .select({ value: countFn() })
                .from(posts)
                .where(eq(posts.user_id, user_id));

            return {
                posts: rows,
                pagination: {
                    page,
                    limit,
                    total: Number(total),
                    totalPages: Math.ceil(Number(total) / limit)
                }
            };
        },

        getById: async (post_id) => {
            const [result] = await db
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
                .where(eq(posts.id, post_id))
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .limit(1);

            if (!result) {
                throw new Error(`Post with ID ${String(post_id)} not found`);
            }
            return {
                posts: [result]
            };
        },

        list: async (user_id, params) => {
            const { page = 1, limit = 10, filter } = params;
            const offset = (page - 1) * limit;
            const base = eq(posts.status, 'visible');
            const where =
                filter === 'following'
                    ? and(base, eq(follows.follower_id, user_id))
                    : base;

            const rows = await db
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
                .where(where)
                .groupBy(posts.id, users.id, runs.id, runners.id)
                .orderBy(desc(posts.created_at))
                .limit(limit)
                .offset(offset);

            const [{ value: total }] = await db
                .select({ value: countFn() })
                .from(posts)
                .where(where);

            return {
                posts: rows,
                pagination: {
                    page,
                    limit,
                    total: Number(total),
                    totalPages: Math.ceil(Number(total) / limit)
                }
            };
        }
    };
    return Object.freeze(postRepository);
};
