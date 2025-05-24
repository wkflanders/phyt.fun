import { eq, desc, count, isNull, and } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { posts, users } from '../schema.js';

import type {
    UUIDv7,
    PostInsert,
    PostUpdate,
    PostQueryParams,
    Post,
    PaginatedPosts,
    PostWithUser,
    PostStatus
} from '@phyt/types';

const toPost = (postRow: typeof posts.$inferSelect): Post => ({
    id: postRow.id as UUIDv7,
    userId: postRow.userId as UUIDv7,
    runId: postRow.runId as UUIDv7 | null,
    title: postRow.title,
    content: postRow.content,
    status: postRow.status as PostStatus,
    createdAt: postRow.createdAt,
    updatedAt: postRow.updatedAt
});

const toPostWithUser = (
    post: typeof posts.$inferSelect,
    user: typeof users.$inferSelect | null
): PostWithUser => ({
    ...toPost(post),
    username: user?.username ?? '',
    avatarUrl: user?.avatarUrl ?? ''
});

export type PostsDrizzleOps = ReturnType<typeof makePostsDrizzleOps>;

export const makePostsDrizzleOps = (db: DrizzleDB) => {
    const create = async (data: PostInsert): Promise<Post> => {
        const [row] = await db
            .insert(posts)
            .values({
                ...data,
                id: uuidv7()
            })
            .returning();

        return toPost(row);
    };

    const findById = async (postId: UUIDv7): Promise<Post> => {
        const [row] = await db
            .select()
            .from(posts)
            .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
            .limit(1);

        return toPost(row);
    };

    const list = (
        params: PostQueryParams
    ): Promise<PaginatedPosts<PostWithUser>> =>
        paginate(
            and(eq(posts.status, 'visible'), isNull(posts.deletedAt)),
            params
        );

    const listByUser = (
        userId: UUIDv7,
        params: PostQueryParams
    ): Promise<PaginatedPosts<PostWithUser>> =>
        paginate(
            and(eq(posts.userId, userId), isNull(posts.deletedAt)),
            params
        );

    const update = async (postId: UUIDv7, data: PostUpdate): Promise<Post> => {
        const [row] = await db
            .update(posts)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(posts.id, postId))
            .returning();

        return toPost(row);
    };

    const remove = async (postId: UUIDv7): Promise<Post> => {
        const [row] = await db
            .update(posts)
            .set({
                deletedAt: new Date()
            })
            .where(eq(posts.id, postId))
            .returning();

        return toPost(row);
    };

    const unsafeRemove = async (postId: UUIDv7): Promise<Post> => {
        const [row] = await db
            .delete(posts)
            .where(eq(posts.id, postId))
            .returning();

        return toPost(row);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof and>,
        params: PostQueryParams
    ): Promise<PaginatedPosts<PostWithUser>> => {
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        // Get total count
        const [{ total }] = await db
            .select({ total: count() })
            .from(posts)
            .where(cond ?? undefined);

        // Query rows with joins
        const rows = await db
            .select({ post: posts, user: users })
            .from(posts)
            .leftJoin(users, eq(posts.userId, users.id))
            .where(cond ?? undefined)
            .orderBy(desc(posts.createdAt), desc(posts.id))
            .limit(limit)
            .offset(offset);

        return {
            posts: rows.map(({ post, user }) => toPostWithUser(post, user)),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    return {
        create,
        findById,
        list,
        listByUser,
        update,
        remove,
        unsafeRemove
    };
};
