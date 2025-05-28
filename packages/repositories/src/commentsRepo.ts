import { CommentsVO } from '@phyt/models';

import type { CommentsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    CommentInsert,
    CommentQueryParams,
    PaginatedComments
} from '@phyt/types';

export type CommentsRepository = ReturnType<typeof makeCommentsRepository>;

export const makeCommentsRepository = ({
    drizzleOps
}: {
    drizzleOps: CommentsDrizzleOps;
}) => {
    const save = async ({
        input
    }: {
        input: CommentInsert;
    }): Promise<CommentsVO> => {
        const record = await drizzleOps.create({ input });
        return CommentsVO.from({ comment: record });
    };

    const findById = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<CommentsVO> => {
        const record = await drizzleOps.findById({ commentId });
        return CommentsVO.from({ comment: record });
    };

    const findByPost = async ({
        postId,
        params
    }: {
        postId: UUIDv7;
        params: CommentQueryParams;
    }): Promise<PaginatedComments<CommentsVO>> => {
        const paginatedRecords = await drizzleOps.listForPost({
            postId,
            params
        });

        return {
            comments: paginatedRecords.comments.map((record) =>
                CommentsVO.from({
                    comment: record,
                    options: {
                        username: record.username,
                        avatarUrl: record.avatarUrl
                    }
                })
            ),
            pagination: paginatedRecords.pagination
        };
    };

    const findReplies = async ({
        parentCommentId,
        params
    }: {
        parentCommentId: UUIDv7;
        params: CommentQueryParams;
    }): Promise<PaginatedComments<CommentsVO>> => {
        const paginatedRecords = await drizzleOps.listReplies({
            parentCommentId,
            params
        });

        return {
            comments: paginatedRecords.comments.map((record) =>
                CommentsVO.from({
                    comment: record,
                    options: {
                        username: record.username,
                        avatarUrl: record.avatarUrl
                    }
                })
            ),
            pagination: paginatedRecords.pagination
        };
    };

    const remove = async ({
        commentId
    }: {
        commentId: UUIDv7;
    }): Promise<CommentsVO> => {
        const record = await drizzleOps.remove({ commentId });
        return CommentsVO.from({ comment: record });
    };

    // Performance optimization: direct update without domain validation
    // const update = async (
    //     commentId: UUIDv7,
    //     update: CommentUpdate
    // ): Promise<CommentsVO> => {
    //     const data = await ops.update(commentId, update);
    //     return CommentsVO.from(data);
    // };

    return {
        save,
        findById,
        findByPost,
        findReplies,
        remove
        // update
    };
};
