import {
    db,
    comments,
    users,
    and,
    desc,
    eq,
    isNull,
    count
} from '@phyt/database';

import type { CommentRepository } from '@phyt/types';

export const commentRepository: CommentRepository = {
    async create(data) {
        const [row] = await db.insert(comments).values(data).returning();
        return row;
    },

    async findById(id) {
        const [row] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, id))
            .limit(1);
        return row ?? null;
    },

    async listForPost(postId, params) {
        const { page = 1, limit = 20, parent_only = false } = params;

        const offset = (page - 1) * limit;
        const base = eq(comments.post_id, postId);
        const where = parent_only
            ? and(base, isNull(comments.parent_comment_id))
            : base;

        const rows = await db
            .select({
                comment: comments,
                user: { username: users.username, avatar_url: users.avatar_url }
            })
            .from(comments)
            .innerJoin(users, eq(comments.user_id, users.id))
            .where(where)
            .orderBy(desc(comments.created_at))
            .limit(limit)
            .offset(offset);

        const [{ value: total }] = await db
            .select({ value: count() })
            .from(comments)
            .where(where);
        return { rows, total: Number(total) };
    },

    async listReplies(commentId, params) {
        const { page = 1, limit = 20 } = params;

        const offset = (page - 1) * limit;
        const rows = await db
            .select({
                comment: comments,
                user: { username: users.username, avatar_url: users.avatar_url }
            })
            .from(comments)
            .innerJoin(users, eq(comments.user_id, users.id))
            .where(eq(comments.parent_comment_id, commentId))
            .orderBy(desc(comments.created_at))
            .limit(limit)
            .offset(offset);

        const [{ value: total }] = await db
            .select({ value: count() })
            .from(comments)
            .where(eq(comments.parent_comment_id, commentId));

        return { rows, total: Number(total) };
    },

    async update(data) {
        const [row] = await db
            .update(comments)
            .set({ content: data.content, updated_at: new Date() })
            .where(eq(comments.id, data.comment_id))
            .returning();
        return row;
    },

    async remove(id) {
        const [row] = await db
            .delete(comments)
            .where(eq(comments.id, id))
            .returning();
        return row;
    }
};
