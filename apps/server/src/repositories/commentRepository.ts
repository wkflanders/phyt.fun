import {
    db,
    comments,
    users,
    eq,
    and,
    isNull,
    desc,
    count
} from '@phyt/database';
import {
    UUIDv7,
    Comment,
    CommentQueryParams,
    CommentResponse,
    DatabaseError,
    NotFoundError
} from '@phyt/types';

export interface CommentRepository {
    create(
        comment_data: Omit<Comment, 'id' | 'created_at' | 'updated_at'>
    ): Promise<Comment>;
    findById(comment_id: UUIDv7): Promise<Comment | null>;
    listForPost(
        post_id: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentResponse>;
    listReplies(
        parent_comment_id: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentResponse>;
    update(comment_id: UUIDv7, content: string): Promise<Comment>;
    remove(comment_id: UUIDv7): Promise<Comment>;
}

export const makeCommentRepository = () => {
    const commentRepository: CommentRepository = {
        create: async (comment_data) => {
            const [row] = await db
                .insert(comments)
                .values(comment_data)
                .returning();
            return {
                ...row,
                id: row.id as UUIDv7,
                user_id: row.user_id as UUIDv7,
                post_id: row.post_id as UUIDv7,
                parent_comment_id: row.parent_comment_id as UUIDv7 | null
            };
        },

        findById: async (comment_id) => {
            const [row] = await db
                .select()
                .from(comments)
                .where(eq(comments.id, comment_id))
                .limit(1);
            return {
                ...row,
                id: row.id as UUIDv7,
                user_id: row.user_id as UUIDv7,
                post_id: row.post_id as UUIDv7,
                parent_comment_id: row.parent_comment_id as UUIDv7 | null
            };
        },

        listForPost: async (
            post_id,
            { page = 1, limit = 20, parent_only = false }
        ) => {
            const offset = (page - 1) * limit;
            const base = eq(comments.post_id, post_id);
            const where = parent_only
                ? and(base, isNull(comments.parent_comment_id))
                : base;

            const rows = await db
                .select({
                    comment: comments,
                    user: {
                        username: users.username,
                        avatar_url: users.avatar_url
                    }
                })
                .from(comments)
                .innerJoin(users, eq(comments.user_id, users.id))
                .where(where)
                .orderBy(desc(comments.created_at))
                .limit(limit)
                .offset(offset);

            const total = Number(
                (
                    await db
                        .select({ value: count() })
                        .from(comments)
                        .where(where)
                )[0]?.value ?? 0
            );

            return {
                comments: rows.map(({ comment, user }) => ({
                    comment: {
                        ...comment,
                        id: comment.id as UUIDv7,
                        user_id: comment.user_id as UUIDv7,
                        post_id: comment.post_id as UUIDv7,
                        parent_comment_id:
                            comment.parent_comment_id as UUIDv7 | null
                    },
                    user: {
                        username: user.username,
                        avatar_url: user.avatar_url
                    }
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        },

        listReplies: async (parent_id, params) => {
            return commentRepository.listForPost(parent_id, {
                ...params,
                parent_only: false
            });
        },

        update: async (comment_id, content) => {
            const [row] = await db
                .update(comments)
                .set({ content, updated_at: new Date() })
                .where(eq(comments.id, comment_id))
                .returning();
            return {
                ...row,
                id: row.id as UUIDv7,
                user_id: row.user_id as UUIDv7,
                post_id: row.post_id as UUIDv7,
                parent_comment_id: row.parent_comment_id as UUIDv7 | null
            };
        },

        remove: async (comment_id) => {
            const [row] = await db
                .delete(comments)
                .where(eq(comments.id, comment_id))
                .returning();
            if (!row)
                throw new NotFoundError(
                    `Error with comment ${String(comment_id)}`
                );
            return {
                ...row,
                id: row.id as UUIDv7,
                user_id: row.user_id as UUIDv7,
                post_id: row.post_id as UUIDv7,
                parent_comment_id: row.parent_comment_id as UUIDv7 | null
            };
        }
    };

    return Object.freeze(commentRepository);
};
