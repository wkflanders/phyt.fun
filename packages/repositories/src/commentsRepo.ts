import { CommentsVO } from '@phyt/models';

import type { CommentsDrizzleOps } from '@phyt/drizzle';
import type {
    UUIDv7,
    CommentInsert,
    CommentQueryParams,
    PaginatedComments
} from '@phyt/types';

export type CommentsRepository = ReturnType<typeof makeCommentsRepository>;

export const makeCommentsRepository = (ops: CommentsDrizzleOps) => {
    const save = async (input: CommentInsert): Promise<CommentsVO> => {
        const data = await ops.create(input);
        return CommentsVO.from(data);
    };

    const findById = async (commentId: UUIDv7): Promise<CommentsVO> => {
        const data = await ops.findById(commentId);
        return CommentsVO.from(data);
    };

    const findByPost = async (
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments<CommentsVO>> => {
        const paginatedData = await ops.listForPost(postId, params);

        return {
            comments: paginatedData.comments.map((c) =>
                CommentsVO.from(c, {
                    username: c.username,
                    avatarUrl: c.avatarUrl
                })
            ),
            pagination: paginatedData.pagination
        };
    };

    const findReplies = async (
        parentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments<CommentsVO>> => {
        const paginatedData = await ops.listReplies(parentId, params);

        return {
            comments: paginatedData.comments.map((c) =>
                CommentsVO.from(c, {
                    username: c.username,
                    avatarUrl: c.avatarUrl
                })
            ),
            pagination: paginatedData.pagination
        };
    };

    const deleteById = async (commentId: UUIDv7): Promise<CommentsVO> => {
        const data = await ops.remove(commentId);
        return CommentsVO.from(data);
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
        deleteById
        // update
    };
};
