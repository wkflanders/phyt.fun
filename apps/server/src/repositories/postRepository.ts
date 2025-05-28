import {
    db,
    eq,
    and,
    posts,
    users,
    runs,
    runners,
    comments,
    reactions,
    desc,
    count as countFn
} from '@phyt/database';

import type { Post, PostResponse, UserRole } from '@phyt/types';

interface PostRow {
    post: Post;
    user: {
        username: string;
        avatar_url: string | null;
        role: UserRole;
        is_pooled: boolean;
    };
    run: {
        distance_m: number;
        duration_seconds: number;
        average_pace_sec: number | null;
        gps_route_data: string | null;
        elevation_gain_m: number | null;
        start_time: Date;
        end_time: Date;
    };
    stats: { comments: number; reactions: number };
}

export const postRepository = {
    create: async (runId: number): Promise<Post> => {
        const [post] = await db
            .insert(posts)
            .values({ run_id: runId } as any)
            .returning();
        return post;
    },

    findById: async (postId: number): Promise<PostResponse> => {
        const rows = (await db
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
            .groupBy(posts.id, users.id, runs.id, runners.id)
            .execute()) as PostRow[];
        return {
            posts: rows,
            pagination: { page: 1, limit: 1, total: rows.length, totalPages: 1 }
        };
    },

    findAll: async (): Promise<PostRow[]> => {
        return (await db
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
            .groupBy(posts.id, users.id, runs.id, runners.id)
            .execute()) as PostRow[];
    },

    findByUser: async (
        userId: number,
        page: number,
        limit: number
    ): Promise<{ rows: PostRow[]; total: number }> => {
        const offset = (page - 1) * limit;
        const rows = (await db
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
            .where(and(eq(posts.user_id, userId), eq(posts.status, 'visible')))
            .groupBy(posts.id, users.id, runs.id, runners.id)
            .orderBy(desc(posts.created_at))
            .offset(offset)
            .limit(limit)
            .execute()) as PostRow[];
        const [{ total }] = (await db
            .select({ total: countFn(posts.id).as('total') })
            .from(posts)
            .where(eq(posts.user_id, userId))
            .execute()) as { total: number }[];
        return { rows, total };
    },

    updateStatus: async (
        postId: number,
        status: PostRow['user']['role'] /* workaround */
    ): Promise<Post> => {
        const [post] = await db
            .update(posts)
            .set({ status } as any)
            .where(eq(posts.id, postId))
            .returning();
        return post;
    },

    delete: async (postId: number): Promise<Post> => {
        const [post] = await db
            .delete(posts)
            .where(eq(posts.id, postId))
            .returning();
        return post;
    }
};
