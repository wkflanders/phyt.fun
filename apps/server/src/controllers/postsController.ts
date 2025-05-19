import {
    PostIdSchema,
    CreatePostSchema,
    UpdatePostSchema,
    PostQueryParamsSchema,
    UserIdSchema
} from '@phyt/dto';

import { validateAuth } from '@/middleware/auth.js';
import { ensureOwnership } from '@/middleware/owner.js';
import { validateSchema } from '@/middleware/validator.js';

import type {
    PostIdDTO,
    PostDTO,
    CreatePostDTO,
    UpdatePostDTO,
    PostQueryParamsDTO,
    PostsPageDTO,
    UserIdDTO
} from '@phyt/dto';
import type { PostsService } from '@phyt/services';
import type { Request, RequestHandler, Response } from 'express';

export interface PostsController {
    getPosts: RequestHandler[];
    getUserPosts: RequestHandler[];
    getPostById: RequestHandler[];
    createPost: RequestHandler[];
    updatePost: RequestHandler[];
    deletePost: RequestHandler[];
}

export const makePostsController = (svc: PostsService): PostsController => {
    const getPosts = [
        validateAuth,
        validateSchema(undefined, undefined, PostQueryParamsSchema),
        async (
            req: Request<
                Record<string, never>,
                PostsPageDTO,
                Record<string, never>,
                PostQueryParamsDTO
            >,
            res: Response<PostsPageDTO>
        ) => {
            const { page = 1, limit = 20 } = req.query;
            const data = await svc.getPosts({
                page,
                limit
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[];

    const getUserPosts = [
        validateAuth,
        validateSchema(UserIdSchema, undefined, PostQueryParamsSchema),
        async (
            req: Request<
                UserIdDTO,
                PostsPageDTO,
                Record<string, never>,
                PostQueryParamsDTO
            >,
            res: Response<PostsPageDTO>
        ) => {
            const { page = 1, limit = 20 } = req.query;
            const userId = req.params.userId;
            const data = await svc.getUserPosts(userId, {
                page,
                limit
            });
            res.status(200).json(data);
        }
    ] as RequestHandler[];

    const getPostById = [
        validateAuth,
        validateSchema(PostIdSchema),
        async (req: Request<PostIdDTO, PostDTO>, res: Response<PostDTO>) => {
            const post = await svc.getPostById(req.params.postId);
            res.status(200).json(post);
        }
    ] as RequestHandler[];

    const createPost = [
        validateAuth,
        validateSchema(undefined, CreatePostSchema),
        async (
            req: Request<Record<string, never>, PostDTO, CreatePostDTO>,
            res: Response<PostDTO>
        ) => {
            const postData = req.body;
            const post = await svc.createPost(postData);
            res.status(201).json(post);
        }
    ] as RequestHandler[];

    const updatePost = [
        validateAuth,
        ensureOwnership,
        validateSchema(PostIdSchema, UpdatePostSchema),
        async (
            req: Request<PostIdDTO, PostDTO, UpdatePostDTO>,
            res: Response<PostDTO>
        ) => {
            const postId = req.params.postId;
            const updatePostData = req.body;

            const post = await svc.updatePost(postId, updatePostData);
            res.status(200).json(post);
        }
    ] as RequestHandler[];

    const deletePost = [
        validateAuth,
        ensureOwnership,
        validateSchema(PostIdSchema),
        async (req: Request<PostIdDTO, PostDTO>, res: Response<PostDTO>) => {
            const postId = req.params.postId;
            const deleted = await svc.deletePost(postId);
            res.status(200).json(deleted);
        }
    ] as RequestHandler[];

    return {
        getPosts,
        getUserPosts,
        getPostById,
        createPost,
        updatePost,
        deletePost
    };
};
