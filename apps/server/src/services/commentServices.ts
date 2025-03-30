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
import { NotFoundError, DatabaseError, Comment } from '@phyt/types';

export const commentService = {
    createComment: async ({
        postId,
        userId,
        content,
        parentCommentId
    }: {
        postId: number;
        userId: number;
        content: string;
        parentCommentId?: number;
    }) => {
        try {
            // First, verify the post exists
            const post = await db
                .select()
                .from(posts)
                .where(and(eq(posts.id, postId), eq(posts.status, 'visible')))
                .limit(1);

            if (!post.length) {
                throw new NotFoundError(
                    `Post with ID ${postId} not found or is not visible`
                );
            }

            // If there's a parent comment, verify it exists
            if (parentCommentId) {
                const parentComment = await db
                    .select()
                    .from(comments)
                    .where(eq(comments.id, parentCommentId))
                    .limit(1);

                if (!parentComment.length) {
                    throw new NotFoundError(
                        `Parent comment with ID ${parentCommentId} not found`
                    );
                }
            }

            // Create the comment
            const [comment] = await db
                .insert(comments)
                .values({
                    post_id: postId,
                    user_id: userId,
                    content,
                    parent_comment_id: parentCommentId ?? null
                })
                .returning();

            return comment;
        } catch (error) {
            console.error('Error creating comment:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to create comment');
        }
    },

    getPostComments: async (
        postId: number,
        {
            page = 1,
            limit = 20,
            parentOnly = false
        }: {
            page?: number;
            limit?: number;
            parentOnly?: boolean;
        } = {}
    ) => {
        try {
            const offset = (page - 1) * limit;

            // Construct the base conditions for the where clause
            const baseCondition = eq(comments.post_id, postId);

            // Add parent-only filter if needed
            const whereConditions = parentOnly
                ? and(baseCondition, isNull(comments.parent_comment_id))
                : baseCondition;

            // Execute the query with pagination
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

            // Get total count for pagination
            const countResults = await db
                .select({ value: count() })
                .from(comments)
                .where(whereConditions);

            const total = Number(countResults[0]?.value || 0);

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
            console.error('Error getting post comments:', error);
            throw new DatabaseError('Failed to get post comments');
        }
    },

    getCommentReplies: async (
        commentId: number,
        {
            page = 1,
            limit = 20
        }: {
            page?: number;
            limit?: number;
        } = {}
    ) => {
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
                .where(eq(comments.parent_comment_id, commentId))
                .orderBy(desc(comments.created_at))
                .limit(limit)
                .offset(offset);

            // Get total count for pagination
            const countResults = await db
                .select({ value: count() })
                .from(comments)
                .where(eq(comments.parent_comment_id, commentId));

            const total = Number(countResults[0]?.value || 0);

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
            console.error('Error getting comment replies:', error);
            throw new DatabaseError('Failed to get comment replies');
        }
    },

    updateComment: async (
        commentId: number,
        { content }: { content: string }
    ) => {
        try {
            const [comment] = await db
                .update(comments)
                .set({ content, updated_at: new Date() })
                .where(eq(comments.id, commentId))
                .returning();

            if (!comment) {
                throw new NotFoundError(
                    `Comment with ID ${String(commentId)} not found`
                );
            }

            return comment;
        } catch (error) {
            console.error('Error updating comment:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to update comment');
        }
    },

    deleteComment: async (commentId: number) => {
        try {
            const [deletedComment] = await db
                .delete(comments)
                .where(eq(comments.id, commentId))
                .returning();

            if (!deletedComment) {
                throw new NotFoundError(
                    `Comment with ID ${commentId} not found`
                );
            }

            return deletedComment;
        } catch (error) {
            console.error('Error deleting comment:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to delete comment');
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
            console.error('Error getting comment by ID:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get comment');
        }
    }
};
