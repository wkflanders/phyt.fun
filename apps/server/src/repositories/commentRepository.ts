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
        commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Comment>;
    findById(commentId: UUIDv7): Promise<Comment | null>;
    listForPost(
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentResponse>;
    listReplies(
        parentCommentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentResponse>;
    update(commentId: UUIDv7, content: string): Promise<Comment>;
    remove(commentId: UUIDv7): Promise<Comment>;
}

export const makeCommentRepository = () => {
    const commentRepository: CommentRepository = {
        create: async (commentData) => {
            const [row] = await db
                .insert(comments)
                .values(commentData)
                .returning();
            return {
                ...row,
                id: row.id as UUIDv7,
                userId: row.userId as UUIDv7,
                postId: row.postId as UUIDv7,
                parentCommentId: row.parentCommentId as UUIDv7 | null
            };
        },

        findById: async (commentId) => {
            const [row] = await db
                .select()
                .from(comments)
                .where(eq(comments.id, commentId))
                .limit(1);

            if (!row) throw new NotFoundError(`Comment ${commentId} not found`);

            return {
                ...row,
                id: row.id as UUIDv7,
                userId: row.userId as UUIDv7,
                postId: row.postId as UUIDv7,
                parentCommentId: row.parentCommentId as UUIDv7 | null
            };
        },

        listForPost: async (
            postId,
            { page = 1, limit = 20, parentOnly = false }
        ) => {
            const offset = (page - 1) * limit;
            const base = eq(comments.postId, postId);
            const where = parentOnly
                ? and(base, isNull(comments.parentCommentId))
                : base;

            const rows = await db
                .select({
                    comment: comments,
                    user: {
                        username: users.username,
                        avatarUrl: users.avatarUrl
                    }
                })
                .from(comments)
                .innerJoin(users, eq(comments.userId, users.id))
                .where(where)
                .orderBy(desc(comments.createdAt))
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
                        userId: comment.userId as UUIDv7,
                        postId: comment.postId as UUIDv7,
                        parentCommentId:
                            comment.parentCommentId as UUIDv7 | null
                    },
                    user: {
                        username: user.username,
                        avatarUrl: user.avatarUrl
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

        listReplies: async (parentId, params) => {
            return commentRepository.listForPost(parentId, {
                ...params,
                parentOnly: false
            });
        },

        update: async (commentId, content) => {
            const [row] = await db
                .update(comments)
                .set({ content, updatedAt: new Date() })
                .where(eq(comments.id, commentId))
                .returning();
            return {
                ...row,
                id: row.id as UUIDv7,
                userId: row.userId as UUIDv7,
                postId: row.postId as UUIDv7,
                parentCommentId: row.parentCommentId as UUIDv7 | null
            };
        },

        remove: async (commentId) => {
            const [row] = await db
                .delete(comments)
                .where(eq(comments.id, commentId))
                .returning();
            if (!row)
                throw new NotFoundError(
                    `Error with comment ${String(commentId)}`
                );
            return {
                ...row,
                id: row.id as UUIDv7,
                userId: row.userId as UUIDv7,
                postId: row.postId as UUIDv7,
                parentCommentId: row.parentCommentId as UUIDv7 | null
            };
        }
    };

    return Object.freeze(commentRepository);
};
