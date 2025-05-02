import { makeCommentRepositoryDrizzle } from '@phyt/drizzle';

import { makeCommentService } from '@/services/commentServices.js';

export const repos = {
    comments: makeCommentRepositoryDrizzle()
};

export const service = {
    comments: makeCommentService(repos.comments)
};
