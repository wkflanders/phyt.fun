import { CommentsVO } from '@phyt/models';

import type { CommentsDrizzleOps } from '@phyt/drizzle';
import type {
    Comment,
    UUIDv7,
    CommentInsert,
    CommentUpdate,
    CommentQueryParams,
    PaginatedComments
} from '@phyt/types';

export type CommentsRepository = ReturnType<typeof makeCommentsRepository>;

export const makeCommentsRepository = (ops: CommentsDrizzleOps) => {
    function mapRecord(data: Comment): CommentsVO {
        return CommentsVO.fromRecord(data);
    }

    const create = async (input: CommentInsert): Promise<CommentsVO> => {
        const data = await ops.create(input);
        return mapRecord(data);
    };

    const findById = async (commentId: UUIDv7): Promise<CommentsVO> => {
        const data = await ops.findById(commentId);
        return mapRecord(data);
    };

    const listForPost = async (
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments<CommentsVO>> => {
        const paginatedData = await ops.listForPost(postId, params);

        return {
            comments: paginatedData.comments.map((c) =>
                CommentsVO.fromWithUser(c)
            ),
            pagination: paginatedData.pagination
        };
    };

    const listReplies = async (
        parentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<PaginatedComments<CommentsVO>> => {
        const paginatedData = await ops.listReplies(parentId, params);

        return {
            comments: paginatedData.comments.map((c) =>
                CommentsVO.fromWithUser(c)
            ),
            pagination: paginatedData.pagination
        };
    };

    const update = async (
        commentId: UUIDv7,
        input: CommentUpdate
    ): Promise<CommentsVO> => {
        const data = await ops.update(commentId, input);
        return mapRecord(data);
    };

    const remove = async (commentId: UUIDv7): Promise<CommentsVO> => {
        const data = await ops.remove(commentId);
        return mapRecord(data);
    };

    return {
        create,
        findById,
        listForPost,
        listReplies,
        update,
        remove
    };
};
