import {
    PostIdDTO,
    CommentIdDTO,
    ReactionCountDTO,
    ReactionDTO,
    ReactionToggleDTO,
    ReactionIdDTO,
    CreateReactionDTO,
    ReactionUpdateDTO
} from '@phyt/dto';

import { api } from '@/lib/api';

export const REACTION_QUERY_KEYS = {
    all: ['reactions'] as const,
    posts: {
        all: () => [...REACTION_QUERY_KEYS.all, 'posts'] as const,
        byPost: (postId: PostIdDTO) =>
            [...REACTION_QUERY_KEYS.posts.all(), postId] as const,
        byUser: (postId: PostIdDTO) =>
            [...REACTION_QUERY_KEYS.posts.all(), 'user', postId] as const
    },
    comments: {
        all: () => [...REACTION_QUERY_KEYS.all, 'comments'] as const,
        byComment: (commentId: CommentIdDTO) =>
            [...REACTION_QUERY_KEYS.comments.all(), commentId] as const,
        byUser: (commentId: CommentIdDTO) =>
            [...REACTION_QUERY_KEYS.comments.all(), 'user', commentId] as const
    },
    postReactions: (postId: PostIdDTO) =>
        [...REACTION_QUERY_KEYS.all, 'postReactions', postId] as const,
    commentReactions: (commentId: CommentIdDTO) =>
        [...REACTION_QUERY_KEYS.all, 'commentReactions', commentId] as const,
    detail: (id: ReactionIdDTO) =>
        [...REACTION_QUERY_KEYS.all, 'detail', id] as const
};

export async function fetchPostReactions(
    postId: PostIdDTO
): Promise<ReactionCountDTO> {
    const response = await api.get<ReactionCountDTO>(
        `/reactions/post/${String(postId)}`
    );
    return response.data;
}

export async function fetchCommentReactions(
    commentId: CommentIdDTO
): Promise<ReactionCountDTO> {
    const response = await api.get<ReactionCountDTO>(
        `/reactions/comment/${String(commentId)}`
    );
    return response.data;
}

export async function fetchUserPostReactions(
    postId: PostIdDTO
): Promise<ReactionDTO[]> {
    const response = await api.get<ReactionDTO[]>(
        `/reactions/post/${String(postId)}/user`
    );
    return response.data;
}

export async function fetchUserCommentReactions(
    commentId: CommentIdDTO
): Promise<ReactionDTO[]> {
    const response = await api.get<ReactionDTO[]>(
        `/reactions/comment/${String(commentId)}/user`
    );
    return response.data;
}

export async function toggleReaction(
    reactionData: ReactionToggleDTO
): Promise<ReactionDTO> {
    const response = await api.post<ReactionDTO>(
        '/reactions/toggle',
        reactionData
    );
    return response.data;
}

export async function createReaction(
    reactionData: CreateReactionDTO
): Promise<ReactionDTO> {
    const response = await api.post<ReactionDTO>('/reactions', reactionData);
    return response.data;
}

export async function updateReaction(
    reactionId: ReactionIdDTO,
    updateData: ReactionUpdateDTO
): Promise<ReactionDTO> {
    const response = await api.patch<ReactionDTO>(
        `/reactions/${String(reactionId)}`,
        updateData
    );
    return response.data;
}

export async function deleteReaction(
    reactionId: ReactionIdDTO
): Promise<ReactionDTO> {
    const response = await api.delete<ReactionDTO>(
        `/reactions/${String(reactionId)}`
    );
    return response.data;
}
