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
    makePostsDrizzleOps,
    makeAdminDrizzleOps,
    makeRunnersDrizzleOps,
    makeRunsDrizzleOps,
    db
} from '@phyt/drizzle';
import {
    makeCommentsRepository,
    makeUsersRepository,
    makeReactionsRepository,
    makePostsRepository,
    makeAdminRepository,
    makeRunnersRepository,
    makeRunsRepository
} from '@phyt/repositories';
import {
    makeCommentsService,
    makeUsersService,
    makeMerkleTreeService,
    makeReactionsService,
    makePostsService,
    makeAdminService,
    makeRunnersServices,
    makeRunsServices
} from '@phyt/services';

import { makeAdminController } from './controllers/adminController.js';
import { makeCommentsController } from './controllers/commentsController.js';
import { makePostsController } from './controllers/postsController.js';
import { makeReactionsController } from './controllers/reactionsController.js';
import { makeRunnersController } from './controllers/runnersController.js';
import { makeRunsController } from './controllers/runsController.js';
import { makeUsersController } from './controllers/usersController.js';

export const ops = {
    commentsDrizzleOps: makeCommentsDrizzleOps(db),
    usersDrizzleOps: makeUsersDrizzleOps(db),
    userAWSOps: makeUserAWSOps(awsClient, avatarConfig, metadataConfig),
    reactionsDrizzleOps: makeReactionsDrizzleOps(db),
    postsDrizzleOps: makePostsDrizzleOps(db),
    adminDrizzleOps: makeAdminDrizzleOps(db),
    runnersDrizzleOps: makeRunnersDrizzleOps(db),
    runsDrizzleOps: makeRunsDrizzleOps(db)
};

export const repos = {
    comments: makeCommentsRepository(ops.commentsDrizzleOps),
    users: makeUsersRepository(ops.usersDrizzleOps, ops.userAWSOps),
    reactions: makeReactionsRepository(ops.reactionsDrizzleOps),
    posts: makePostsRepository(ops.postsDrizzleOps),
    admin: makeAdminRepository(ops.adminDrizzleOps),
    runners: makeRunnersRepository(ops.runnersDrizzleOps),
    runs: makeRunsRepository(ops.runsDrizzleOps)
};

export const service = {
    comments: makeCommentsService(repos.comments),
    users: makeUsersService(repos.users),
    merkletree: makeMerkleTreeService(repos.users),
    reactions: makeReactionsService(repos.reactions),
    posts: makePostsService(repos.posts),
    admin: makeAdminService(repos.admin),
    runners: makeRunnersServices(repos.runners),
    runs: makeRunsServices(repos.runs)
};

export const controller = {
    comments: makeCommentsController(service.comments),
    users: makeUsersController(service.users),
    reactions: makeReactionsController(service.reactions),
    posts: makePostsController(service.posts),
    admin: makeAdminController(service.admin),
    runners: makeRunnersController(service.runners),
    runs: makeRunsController(service.runs)
};
