import type {
    Comment,
    CommentQueryParams,
    CreateCommentRequest,
    UpdateCommentContent,
    CommentResponse,
    UUIDv7
} from '@phyt/models';

export interface CommentRepository {
    create(createCommentData: CreateCommentRequest): Promise<Comment>;
    findById(id: UUIDv7): Promise<Comment | null>;
    listForPost(
        postId: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentResponse>;
    listReplies(
        parentId: UUIDv7,
        params: CommentQueryParams
    ): Promise<CommentResponse>;
    update(
        commentId: UUIDv7,
        updateCommentData: UpdateCommentContent
    ): Promise<Comment>;
    remove(commentId: UUIDv7): Promise<Comment>;
}
