import { db, eq, and, count, reactions, posts, comments } from '@phyt/database';
import {
    UUIDv7,
    NotFoundError,
    DatabaseError,
    ReactionToggleRequest,
    ReactionToggleResponse,
    ReactionCount,
    Reaction
} from '@phyt/types';

export const reactionService = {
    toggleReaction: async ({
        userId,
        postId,
        commentId,
        type
    }: ReactionToggleRequest): Promise<ReactionToggleResponse> => {
        try {
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
                        `Post with ID ${String(postId)} not found or is not visible`
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
                        `Comment with ID ${String(commentId)} not found`
                    );
                }
            }

            // Check if the reaction already exists
            const existingReaction = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.userId, userId),
                        postId
                            ? eq(reactions.postId, postId)
                            : eq(reactions.commentId, commentId),
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
                    userId,
                    postId,
                    commentId,
                    type
                })
                .returning();

            return {
                action: 'added' as const,
                reaction: newReaction.type
            };
        } catch (error) {
            console.error('Error with toggleReaction: ', error);
            throw new DatabaseError('Failed to toggle reaction');
        }
    },

    getPostReactions: async (postId: UUIDv7): Promise<ReactionCount> => {
        try {
            const reactionCounts = await db
                .select({
                    type: reactions.type,
                    value: count()
                })
                .from(reactions)
                .where(eq(reactions.postId, postId))
                .groupBy(reactions.type);

            return reactionCounts.reduce<ReactionCount>(
                (acc, { type, value }) => {
                    acc[type] = Number(value);
                    return acc;
                },
                { like: 0, funny: 0, insightful: 0, fire: 0 }
            );
        } catch (error) {
            console.error('Error with getPostReactions: ', error);
            throw new DatabaseError('Failed to get post reactions');
        }
    },

    getCommentReactions: async (commentId: UUIDv7): Promise<ReactionCount> => {
        try {
            const reactionCounts = await db
                .select({
                    type: reactions.type,
                    value: count()
                })
                .from(reactions)
                .where(eq(reactions.commentId, commentId))
                .groupBy(reactions.type);

            return reactionCounts.reduce<ReactionCount>(
                (acc, { type, value }) => {
                    acc[type] = Number(value);
                    return acc;
                },
                { like: 0, funny: 0, insightful: 0, fire: 0 }
            );
        } catch (error) {
            console.error('Error with getCommentReactions:', error);
            throw new DatabaseError('Failed to get comment reactions');
        }
    },

    getUserPostReactions: async (
        userId: UUIDv7,
        postId: UUIDv7
    ): Promise<Reaction[]> => {
        try {
            const userReactions = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.userId, userId),
                        eq(reactions.postId, postId)
                    )
                );

            return userReactions.map((reaction) => reaction.type);
        } catch (error) {
            console.error('Error with getUserPostReactins: ', error);
            throw new DatabaseError('Failed to get user post reactions');
        }
    },

    getUserCommentReactions: async (
        userId: UUIDv7,
        commentId: UUIDv7
    ): Promise<Reaction[]> => {
        try {
            const userReactions = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.userId, userId),
                        eq(reactions.commentId, commentId)
                    )
                );

            return userReactions.map((reaction) => reaction.type);
        } catch (error) {
            console.error('Error with getUserCommentReactions:', error);
            throw new DatabaseError('Failed to get user comment reactions');
        }
    }
};
