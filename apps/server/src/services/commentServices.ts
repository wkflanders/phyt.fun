import {
    db,
    eq,
    and,
    desc,
    isNull,
    count,
    comments,
    posts,
    users
} from '@phyt/database';
import {
    NotFoundError,
    Comment,
    CreateCommentRequest,
    CommentQueryParams,
    CommentResponse,
    HttpError,
    CommentService
} from '@phyt/types';

export const commentService: CommentService = {
    createComment: async ({
        user_id,
        post_id,
        content,
        parent_comment_id
    }: CreateCommentRequest): Promise<Comment> => {
        try {
            // First, verify the post exists
            const post = await db
                .select()
                .from(posts)
                .where(and(eq(posts.id, post_id), eq(posts.status, 'visible')))
                .limit(1);

            if (!post.length) {
                throw new NotFoundError(
                    `Post with ID ${String(post_id)} not found or is not visible`
                );
            }

            // If there's a parent comment, verify it exists
            if (parent_comment_id) {
                const parentComment = await db
                    .select()
                    .from(comments)
                    .where(eq(comments.id, parent_comment_id))
                    .limit(1);

                if (!parentComment.length) {
                    throw new NotFoundError(
                        `Parent comment with ID ${String(parent_comment_id)} not found`
                    );
                }
            }

            // Create the comment
            const [comment] = await db
                .insert(comments)
                .values({
                    post_id: post_id,
                    user_id: user_id,
                    content,
                    parent_comment_id: parent_comment_id ?? null
                })
                .returning();

            return comment;
        } catch (error) {
            console.error('Error with createComment ', error);
            throw new HttpError('Error with creating a new comment');
        }
    },

    getPostComments: async (
        post_id: number,
        { page = 1, limit = 20, parent_only = false }: CommentQueryParams
    ): Promise<CommentResponse> => {
        // updated return type
        try {
            const offset = (page - 1) * limit;
            const baseCondition = eq(comments.post_id, post_id);
            const whereConditions = parent_only
                ? and(baseCondition, isNull(comments.parent_comment_id))
                : baseCondition;

            const results = await db
                .select({
                    comment: comments,
                    user: {
                        username: users.username,
                        avatar_url: users.avatar_url
                    }
                })
                .from(comments)
                .innerJoin(users, eq(comments.user_id, users.id))
                .where(whereConditions)
                .orderBy(desc(comments.created_at))
                .limit(limit)
                .offset(offset);

            const countResults = await db
                .select({ value: count() })
                .from(comments)
                .where(whereConditions);

            const total = Number(countResults[0]?.value ?? 0);

            return {
                comments: results,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error with getPostComments ', error);
            throw new HttpError('Failed to get post comments');
        }
    },

    getCommentReplies: async (
        comment_id: number,
        { page = 1, limit = 20 }: CommentQueryParams
    ): Promise<CommentResponse> => {
        try {
            const offset = (page - 1) * limit;

            const results = await db
                .select({
                    comment: comments,
                    user: {
                        username: users.username,
                        avatar_url: users.avatar_url
                    }
                })
                .from(comments)
                .innerJoin(users, eq(comments.user_id, users.id))
                .where(eq(comments.parent_comment_id, comment_id))
                .orderBy(desc(comments.created_at))
                .limit(limit)
                .offset(offset);

            // Get total count for pagination
            const countResults = await db
                .select({ value: count() })
                .from(comments)
                .where(eq(comments.parent_comment_id, comment_id));

            const total = Number(countResults[0]?.value ?? 0);

            return {
                comments: results,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error with getCommentReplies ', error);
            throw new HttpError('Failed to get comment replies');
        }
    },

    updateComment: async (
        comment_id: number,
        { content }: { content: string }
    ): Promise<Comment> => {
        try {
            const commentResults = await db
                .update(comments)
                .set({ content, updated_at: new Date() })
                .where(eq(comments.id, comment_id))
                .returning();

            if (commentResults.length === 0) {
                throw new NotFoundError(
                    `Comment with ID ${String(comment_id)} not found`
                );
            }
            return commentResults[0];
        } catch (error) {
            console.error('Error with updateComment ', error);
            throw new HttpError('Failed to update comment');
        }
    },

    deleteComment: async (comment_id: number): Promise<Comment> => {
        try {
            const deletedCommentResults = await db
                .delete(comments)
                .where(eq(comments.id, comment_id))
                .returning();

            if (deletedCommentResults.length === 0) {
                throw new NotFoundError(
                    `Comment with ID ${String(comment_id)} not found`
                );
            }
            return deletedCommentResults[0];
        } catch (error) {
            console.error('Error with deleteComment ', error);
            throw new HttpError('Failed to delete comment');
        }
    },

    getCommentById: async (commentId: number): Promise<Comment> => {
        try {
            const commentsResults = await db
                .select({
                    id: comments.id,
                    post_id: comments.post_id,
                    user_id: comments.user_id,
                    content: comments.content,
                    parent_comment_id: comments.parent_comment_id,
                    updated_at: comments.updated_at,
                    created_at: comments.created_at
                })
                .from(comments)
                .innerJoin(users, eq(comments.user_id, users.id))
                .where(eq(comments.id, commentId))
                .limit(1);

            if (commentsResults.length === 0) {
                throw new NotFoundError(
                    `Comment with ID ${String(commentId)} not found`
                );
            }

            return commentsResults[0];
        } catch (error) {
            console.error('Error with getCommentById ', error);
            throw new HttpError('Failed to get comment');
        }
    }
};
