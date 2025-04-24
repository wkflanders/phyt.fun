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
        user_id,
        post_id,
        comment_id,
        type
    }: ReactionToggleRequest): Promise<ReactionToggleResponse> => {
        try {
            if (post_id) {
                const post = await db
                    .select()
                    .from(posts)
                    .where(
                        and(eq(posts.id, post_id), eq(posts.status, 'visible'))
                    )
                    .limit(1);

                if (!post.length) {
                    throw new NotFoundError(
                        `Post with ID ${String(post_id)} not found or is not visible`
                    );
                }
            } else if (comment_id) {
                const comment = await db
                    .select()
                    .from(comments)
                    .where(eq(comments.id, comment_id))
                    .limit(1);

                if (!comment.length) {
                    throw new NotFoundError(
                        `Comment with ID ${String(comment_id)} not found`
                    );
                }
            }

            // Check if the reaction already exists
            const existingReaction = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.user_id, user_id),
                        post_id
                            ? eq(reactions.post_id, post_id)
                            : eq(reactions.comment_id, comment_id),
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
                    user_id,
                    post_id,
                    comment_id,
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

    getPostReactions: async (post_id: UUIDv7): Promise<ReactionCount> => {
        try {
            const reactionCounts = await db
                .select({
                    type: reactions.type,
                    value: count()
                })
                .from(reactions)
                .where(eq(reactions.post_id, post_id))
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

    getCommentReactions: async (comment_id: UUIDv7): Promise<ReactionCount> => {
        try {
            const reactionCounts = await db
                .select({
                    type: reactions.type,
                    value: count()
                })
                .from(reactions)
                .where(eq(reactions.comment_id, comment_id))
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
        user_id: UUIDv7,
        post_id: UUIDv7
    ): Promise<Reaction[]> => {
        try {
            const userReactions = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.user_id, user_id),
                        eq(reactions.post_id, post_id)
                    )
                );

            return userReactions.map((reaction) => reaction.type);
        } catch (error) {
            console.error('Error with getUserPostReactins: ', error);
            throw new DatabaseError('Failed to get user post reactions');
        }
    },

    getUserCommentReactions: async (
        user_id: UUIDv7,
        comment_id: UUIDv7
    ): Promise<Reaction[]> => {
        try {
            const userReactions = await db
                .select()
                .from(reactions)
                .where(
                    and(
                        eq(reactions.user_id, user_id),
                        eq(reactions.comment_id, comment_id)
                    )
                );

            return userReactions.map((reaction) => reaction.type);
        } catch (error) {
            console.error('Error with getUserCommentReactions:', error);
            throw new DatabaseError('Failed to get user comment reactions');
        }
    }
};
