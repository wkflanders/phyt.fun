import {
    makeUserAWSOps,
    awsClient,
    avatarConfig,
    metadataConfig
} from '@phyt/aws';
import {
    makeCommentsDrizzleOps,
    makeUsersDrizzleOps,
    makeReactionsDrizzleOps,
    db
} from '@phyt/drizzle';
import {
    makeCommentsRepository,
    makeUsersRepository,
    makeReactionsRepository
} from '@phyt/repositories';
import {
    makeCommentsService,
    makeUsersService,
    makeMerkleTreeService,
    makeReactionsService
} from '@phyt/services';

import { makeCommentsController } from './controllers/commentsController.js';
import { makeReactionsController } from './controllers/reactionsController.js';
import { makeUsersController } from './controllers/usersController.js';

export const ops = {
    commentsDrizzleOps: makeCommentsDrizzleOps(db),
    usersDrizzleOps: makeUsersDrizzleOps(db),
    userAWSOps: makeUserAWSOps(awsClient, avatarConfig, metadataConfig),
    reactionsDrizzleOps: makeReactionsDrizzleOps(db)
};

export const repos = {
    comments: makeCommentsRepository(ops.commentsDrizzleOps),
    users: makeUsersRepository(ops.usersDrizzleOps, ops.userAWSOps),
    reactions: makeReactionsRepository(ops.reactionsDrizzleOps)
};

export const service = {
    comments: makeCommentsService(repos.comments),
    users: makeUsersService(repos.users),
    merkletree: makeMerkleTreeService(repos.users),
    reactions: makeReactionsService(repos.reactions)
};

export const controller = {
    comments: makeCommentsController(service.comments),
    users: makeUsersController(service.users),
    reactions: makeReactionsController(service.reactions)
};
