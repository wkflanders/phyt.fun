import {
    db,
    eq,
    and,
    count as countFn,
    gt,
    comments,
    reactions
} from '@phyt/database';

export const toStringValue = (value: unknown): string | undefined => {
    if (value == null) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
        return value.toString();
    // For non-primitive objects, use JSON.stringify.
    return JSON.stringify(value);
};

export const calculateTrendingScore = async (
    postId: number,
    daysAgo: number
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    // Get count of recent reactions for this post
    const [reactionResult] = await db
        .select({ count: countFn() })
        .from(reactions)
        .where(
            and(
                eq(reactions.post_id, postId),
                gt(reactions.created_at, cutoffDate)
            )
        );

    // Get count of recent comments for this post
    const [commentResult] = await db
        .select({ count: countFn() })
        .from(comments)
        .where(
            and(
                eq(comments.post_id, postId),
                gt(comments.created_at, cutoffDate)
            )
        );

    // Return the sum of counts
    return Number(reactionResult.count) + Number(commentResult.count);
};
