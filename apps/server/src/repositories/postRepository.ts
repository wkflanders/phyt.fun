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
    create(user_id: UUIDv7, run_id: UUIDv7): Promise<Post>;
    updateStatus(post_id: UUIDv7, status: Post['status']): Promise<Post>;
    delete(post_id: UUIDv7): Promise<Post>;
    getByUserId(
        user_id: UUIDv7,
        params: PostQueryParams
    ): Promise<PostResponse>;
    getById(post_id: UUIDv7): Promise<PostResponse>;
    list(user_id: UUIDv7, params: PostQueryParams): Promise<PostResponse>;
}

export const makePostRepository = () => {
    const postRepository: PostRepository = {
        create: async (user_id, run_id) => {
            const [post] = await db
                .insert(posts)
                .values({ user_id: user_id, run_id: run_id })
                .returning();
            // Cast id, user_id, and run_id to UUIDv7
            return {
                ...post,
                id: post.id as UUIDv7,
                user_id: post.user_id as UUIDv7,
                run_id: post.run_id as UUIDv7
            };
        },

        updateStatus: async (post_id, status) => {
            const [updated] = await db
                .update(posts)
                .set({ status, updated_at: new Date() })
                .where(eq(posts.id, post_id))
                .returning();
            // Cast id, user_id, and run_id to UUIDv7
            return {
                ...updated,
                id: updated.id as UUIDv7,
                user_id: updated.user_id as UUIDv7,
                run_id: updated.run_id as UUIDv7
            };
        },

        delete: async (post_id) => {
            const [deleted] = await db
                .delete(posts)
                .where(eq(posts.id, post_id))
                .returning();
            // Cast id, user_id, and run_id to UUIDv7
            return {
                ...deleted,
                id: deleted.id as UUIDv7,
                user_id: deleted.user_id as UUIDv7,
                run_id: deleted.run_id as UUIDv7
            };
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
                posts: rows.map((row) => ({
                    ...row,
                    post: {
                        ...row.post,
                        id: row.post.id as UUIDv7,
                        user_id: row.post.user_id as UUIDv7,
                        run_id: row.post.run_id as UUIDv7
                    },
                    user: {
                        ...row.user,
                        avatar_url: row.user.avatar_url
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
                posts: [
                    {
                        ...result,
                        post: {
                            ...result.post,
                            id: result.post.id as UUIDv7,
                            user_id: result.post.user_id as UUIDv7,
                            run_id: result.post.run_id as UUIDv7
                        },
                        user: {
                            ...result.user,
                            avatar_url: result.user.avatar_url
                        }
                    }
                ]
            };
        },

        list: async (user_id, params): Promise<PostResponse> => {
            const { page = 1, limit = 10, filter } = params;
            const offset = (page - 1) * limit;
            // Base query: join posts → users, runs, runners; aggregate comment/reaction counts :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
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

            // Apply “following” filter :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
            if (filter === 'following') {
                const following = await db
                    .select({ id: follows.follow_target_id })
                    .from(follows)
                    .where(eq(follows.follower_id, user_id));
                const ids = following.map((row) => row.id);
                allPosts = allPosts
                    .filter((p) => ids.includes(p.post.user_id))
                    .sort(
                        (a, b) =>
                            b.post.created_at.getTime() -
                            a.post.created_at.getTime()
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
                        b.post.created_at.getTime() -
                        a.post.created_at.getTime()
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
                        user_id: row.post.user_id as UUIDv7,
                        run_id: row.post.run_id as UUIDv7
                    },
                    user: {
                        ...row.user,
                        avatar_url: row.user.avatar_url
                    }
                })),
                pagination: { page, limit, total, totalPages, nextPage }
            };
        }
    };
    return Object.freeze(postRepository);
};
