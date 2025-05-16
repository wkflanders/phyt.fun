import { makeCommentsDrizzleOps, db } from '@phyt/drizzle';
import { makeCommentsRepository } from '@phyt/repositories';
import { makeCommentsService } from '@phyt/services';

import { makeCommentsController } from './controllers/commentsController.js';

export const ops = {
    comments: makeCommentsDrizzleOps(db)
};

export const repos = {
    comments: makeCommentsRepository(ops.comments)
};

export const service = {
    comments: makeCommentsService(repos.comments)
};

export const controller = {
    comments: makeCommentsController(service.comments)
};
