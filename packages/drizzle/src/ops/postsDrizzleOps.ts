import { eq, desc, count } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

import { NotFoundError } from '@phyt/models';

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

const toData = (postRow: typeof posts.$inferSelect): Post => ({
    id: postRow.id as UUIDv7,
    userId: postRow.userId as UUIDv7,
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
    ...toData(post),
    username: user?.username ?? '',
    avatarUrl: user?.avatarUrl ?? ''
});

export type PostsDrizzleOps = ReturnType<typeof makePostsDrizzleOps>;

export const makePostsDrizzleOps = (db: DrizzleDB) => {
    const create = async (input: PostInsert) => {
        const [row] = await db
            .insert(posts)
            .values({
                id: uuidv7(),
                userId: input.userId,
                title: input.title,
                content: input.content,
                status: input.status ?? 'visible'
            })
            .returning();
        return toData(row);
    };

    const findById = async (postId: UUIDv7) => {
        const [row] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, postId))
            .limit(1);
        if (!row) {
            throw new NotFoundError('Post not found');
        }
        return toData(row);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | null,
        params: PostQueryParams
    ): Promise<PaginatedPosts> => {
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

    const list = (params: PostQueryParams) =>
        paginate(eq(posts.status, 'visible'), params);

    const listByUser = (userId: UUIDv7, params: PostQueryParams) =>
        paginate(eq(posts.userId, userId), params);

    const update = async (postId: UUIDv7, input: PostUpdate) => {
        const [row] = await db
            .update(posts)
            .set({
                ...(input.title && { title: input.title }),
                ...(input.content && { content: input.content }),
                ...(input.status && { status: input.status }),
                updatedAt: new Date()
            })
            .where(eq(posts.id, postId))
            .returning();
        if (!row) {
            throw new NotFoundError('Post not found');
        }
        return toData(row);
    };

    const remove = async (postId: UUIDv7) => {
        const [row] = await db
            .delete(posts)
            .where(eq(posts.id, postId))
            .returning();
        if (!row) {
            throw new NotFoundError('Post not found');
        }
        return toData(row);
    };

    return { create, findById, list, listByUser, update, remove };
};
