import { makeCommentRepositoryDrizzle } from '@phyt/drizzle';

import { makeCommentService } from '@/services/commentServices.js';

import { makeCommentController } from './controllers/commentController.js';

export const repos = {
    comments: makeCommentRepositoryDrizzle()
};

export const service = {
    comments: makeCommentService(repos.comments)
};

export const controller = {
    comments: makeCommentController(service.comments)
};
