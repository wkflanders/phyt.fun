import { CommentController } from '@phyt/types';

import { createCommentSchema, updateCommentSchema } from '@/lib/validation.js';
import { validateSchema } from '@/middleware/validator.js';
import { commentService } from '@/services/commentServices.js';

export const commentController: CommentController = {
    createComment: [
        validateSchema(createCommentSchema),
        async (req, res) => {
            const comment = await commentService.createComment(req.body);
            res.status(201).json(comment);
        }
    ],

    getPostComments: async (req, res) => {
        const postId = Number(req.params.postId);
        const { page = 1, limit = 20, parent_only = false } = req.query;
        const data = await commentService.getPostComments(postId, {
            page: Number(page),
            limit: Number(limit),
            parent_only: Boolean(parent_only)
        });
        res.status(200).json(data);
    },

    getCommentById: async (req, res) => {
        const id = Number(req.params.id);
        const comment = await commentService.getCommentById(id);
        res.status(200).json(comment);
    },

    getCommentReplies: async (req, res) => {
        const commentId = Number(req.params.commentId);
        const { page = 1, limit = 20 } = req.query;
        const data = await commentService.getCommentReplies(commentId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.status(200).json(data);
    },

    updateComment: [
        validateSchema(updateCommentSchema),
        async (req, res) => {
            const comment_id = Number(req.params.id);
            const { content } = req.body;
            const comment = await commentService.updateComment({
                comment_id,
                content
            });
            res.status(200).json(comment);
        }
    ],

    deleteComment: async (req, res) => {
        const id = Number(req.params.id);
        const comment = await commentService.deleteComment(id);
        res.status(200).json(comment);
    }
};
