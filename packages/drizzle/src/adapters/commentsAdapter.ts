import {
    UUIDv7,
    assertUUIDv7,
    Comment,
    CommentQueryParams,
    CommentResponse,
    CreateCommentRequest,
    UpdateCommentContent,
    NotFoundError,
    RequestError
} from '@phyt/models';
import { CommentRepository } from '@phyt/repositories';
import {
    eq,
    and,
    isNull,
    desc,
    count,
    InferSelectModel,
    InferInsertModel
} from 'drizzle-orm';

import { db } from '@/drizzle';
import { comments, users } from '@/schema';

type CommentRow = InferSelectModel<typeof comments>;
type CommentInsert = InferInsertModel<typeof comments>;

const mapCommentRow = (row: CommentRow): Comment => {
    assertUUIDv7(row.id);
    assertUUIDv7(row.postId);
    assertUUIDv7(row.userId);
    if (row.parentCommentId !== null) {
        assertUUIDv7(row.parentCommentId);
    }
    if (typeof row.content !== 'string') {
        throw new RequestError(`Invalid content: ${String(row.content)}`);
    }
    if (!(row.createdAt instanceof Date)) {
        throw new RequestError(`Invalid createdAt: ${String(row.createdAt)}`);
    }
    if (!(row.updatedAt instanceof Date)) {
        throw new RequestError(`Invalid updatedAt: ${String(row.updatedAt)}`);
    }

    return {
        id: row.id,
        postId: row.postId,
        userId: row.userId,
        parentCommentId: row.parentCommentId,
        content: row.content,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
};

export const makeCommentRepositoryDrizzle = (): CommentRepository => {
    const paginate = async (
        filterCondition: ReturnType<typeof eq> | ReturnType<typeof and>,
        { page = 1, limit = 20 }: CommentQueryParams
    ): Promise<CommentResponse> => {
        const offset = (page - 1) * limit;
        // total count
        const [{ total }] = await db
            .select({ total: count() })
            .from(comments)
            .where(filterCondition);
        // fetch paginated rows with user relation
        const rows = await db
            .select({
                comment: comments,
                username: users.username,
                avatarUrl: users.avatarUrl
            })
            .from(comments)
            .leftJoin(users, eq(comments.userId, users.id))
            .where(filterCondition)
            .orderBy(desc(comments.createdAt))
            .limit(limit)
            .offset(offset);
        const items = rows.map(({ comment, username, avatarUrl }) => {
            if (username === null || avatarUrl === null) {
                throw new NotFoundError('User data missing');
            }
            return {
                comment: mapCommentRow(comment),
                user: { username, avatarUrl }
            };
        });
        const totalPages = Math.ceil(Number(total) / limit);
        return {
            comments: items,
            pagination: { page, limit, total: Number(total), totalPages }
        };
    };

    const create = async (createCommentData: CreateCommentRequest) => {
        const now = new Date();
        const insertData: CommentInsert = {
            ...createCommentData,
            createdAt: now,
            updatedAt: now
        };

        const [row] = await db.insert(comments).values(insertData).returning();

        return mapCommentRow(row);
    };

    const findById = async (commentId: UUIDv7) => {
        const row = await db.query.comments.findFirst({
            where: eq(comments.id, commentId)
        });
        return row ? mapCommentRow(row) : null;
    };

    const listForPost = (postId: UUIDv7, params: CommentQueryParams) => {
        const filter = params.parentOnly
            ? and(eq(comments.postId, postId), isNull(comments.parentCommentId))
            : eq(comments.postId, postId);
        return paginate(filter, params);
    };

    const listReplies = (
        parentCommentId: UUIDv7,
        params: CommentQueryParams
    ) => {
        const filter = eq(comments.parentCommentId, parentCommentId);
        return paginate(filter, params);
    };

    const update = async (
        commentId: UUIDv7,
        updateContent: UpdateCommentContent
    ) => {
        const [row] = await db
            .update(comments)
            .set({ content: updateContent.content, updatedAt: new Date() })
            .where(eq(comments.id, commentId))
            .returning();
        return mapCommentRow(row);
    };

    const remove = async (commentId: UUIDv7) => {
        const [row] = await db
            .delete(comments)
            .where(eq(comments.id, commentId))
            .returning();
        return mapCommentRow(row);
    };

    return { create, findById, listForPost, listReplies, update, remove };
};
