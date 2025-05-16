import {
    makeUserAWSOps,
    awsClient,
    avatarConfig,
    metadataConfig
} from '@phyt/aws';
import { makeCommentsDrizzleOps, makeUsersDrizzleOps, db } from '@phyt/drizzle';
import {
    makeCommentsRepository,
    makeUsersRepository
} from '@phyt/repositories';
import { makeCommentsService, makeUsersService } from '@phyt/services';

import { makeCommentsController } from './controllers/commentsController.js';
import { makeUsersController } from './controllers/usersController.js';

export const ops = {
    commentsDrizzleOps: makeCommentsDrizzleOps(db),
    usersDrizzleOps: makeUsersDrizzleOps(db),
    userAWSOps: makeUserAWSOps(awsClient, avatarConfig, metadataConfig)
};

export const repos = {
    comments: makeCommentsRepository(ops.commentsDrizzleOps),
    users: makeUsersRepository(ops.usersDrizzleOps, ops.userAWSOps)
};

export const service = {
    comments: makeCommentsService(repos.comments),
    users: makeUsersService(repos.users)
};

export const controller = {
    comments: makeCommentsController(service.comments),
    users: makeUsersController(service.users)
};
