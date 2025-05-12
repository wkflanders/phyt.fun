import { makeCommentDrizzleOps, db } from '@phyt/drizzle';
import { makeCommentRepository } from '@phyt/repositories';
import { makeCommentService } from '@phyt/services';

import { makeCommentController } from './controllers/commentController.js';

export const ops = {
    comments: makeCommentDrizzleOps(db)
};

export const repos = {
    comments: makeCommentRepository(ops.comments)
};

export const service = {
    comments: makeCommentService(repos.comments)
};

export const controller = {
    comments: makeCommentController(service.comments)
};
