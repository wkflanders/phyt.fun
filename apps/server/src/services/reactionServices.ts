import {
    db,
    eq,
    and,
    or,
    count,
    reactions,
    posts,
    comments,
    users
} from '@phyt/database';
import { NotFoundError, DatabaseError } from '@phyt/types';

export const reactionService = {
    toggleReaction: async ({
        userId,
        postId,
        commentId,
        type
    }: {
        userId: number;
        postId?: number;
        commentId?: number;
        type: 'like' | 'funny' | 'insightful' | 'fire';
    }) => {
        if (!postId && !commentId) {
            throw new Error('Either postId or commentId must be provided');
        }

        try {
            // Check if the target (post or comment) exists
            if (postId) {
                const post = await db
                    .select()
                    .from(posts)
                    .where(
                        and(eq(posts.id, postId), eq(posts.status, 'visible'))
                    )
                    .limit(1);

                if (!post.length) {
                    throw new NotFoundError(
                        `Post with ID ${postId} not found or is not visible`
                    );
                }
            } else if (commentId) {
                const comment = await db
                    .select()
                    .from(comments)
                    .where(eq(comments.id, commentId))
                    .limit(1);

                if (!comment.length) {
                    throw new NotFoundError(
                        `Comment with ID ${commentId} not found`
                    );
                }
            }

            // Check if the reaction already exists
            const existingReaction = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.user_id, userId),
                        postId
                            ? eq(reactions.post_id, postId)
                            : eq(reactions.comment_id, commentId!),
                        eq(reactions.type, type)
                    )
                )
                .limit(1);

            if (existingReaction.length) {
                const [deletedReaction] = await db
                    .delete(reactions)
                    .where(eq(reactions.id, existingReaction[0].id))
                    .returning();

                return {
                    action: 'removed' as const,
                    reaction: deletedReaction.type
                };
            }

            const [newReaction] = await db
                .insert(reactions)
                .values({
                    user_id: userId,
                    post_id: postId || null,
                    comment_id: commentId || null,
                    type
                })
                .returning();

            return {
                action: 'added' as const,
                reaction: newReaction.type
            };
        } catch (error) {
            console.error('Error toggling reaction:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to toggle reaction');
        }
    },

    getPostReactions: async (postId: number) => {
        try {
            const reactionCounts = await db
                .select({
                    type: reactions.type,
                    value: count()
                })
                .from(reactions)
                .where(eq(reactions.post_id, postId))
                .groupBy(reactions.type);

            return reactionCounts.reduce<Record<string, number>>(
                (acc, { type, value }) => {
                    acc[type] = Number(value);
                    return acc;
                },
                {}
            );
        } catch (error) {
            console.error('Error getting post reactions:', error);
            throw new DatabaseError('Failed to get post reactions');
        }
    },

    getCommentReactions: async (commentId: number) => {
        try {
            const reactionCounts = await db
                .select({
                    type: reactions.type,
                    value: count()
                })
                .from(reactions)
                .where(eq(reactions.comment_id, commentId))
                .groupBy(reactions.type);

            return reactionCounts.reduce<Record<string, number>>(
                (acc, { type, value }) => {
                    acc[type] = Number(value);
                    return acc;
                },
                {}
            );
        } catch (error) {
            console.error('Error getting comment reactions:', error);
            throw new DatabaseError('Failed to get comment reactions');
        }
    },

    getUserPostReactions: async (userId: number, postId: number) => {
        try {
            const userReactions = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.user_id, userId),
                        eq(reactions.post_id, postId)
                    )
                );

            return userReactions.map((reaction) => reaction.type);
        } catch (error) {
            console.error('Error getting user post reactions:', error);
            throw new DatabaseError('Failed to get user post reactions');
        }
    },

    getUserCommentReactions: async (userId: number, commentId: number) => {
        try {
            const userReactions = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.user_id, userId),
                        eq(reactions.comment_id, commentId)
                    )
                );

            return userReactions.map((reaction) => reaction.type);
        } catch (error) {
            console.error('Error getting user comment reactions:', error);
            throw new DatabaseError('Failed to get user comment reactions');
        }
    }
};
