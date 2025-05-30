import { makeAvatarAWSOps } from '@phyt/aws';

import {
    makeCommentsDrizzleOps,
    makeUsersDrizzleOps,
    makeReactionsDrizzleOps,
    makePostsDrizzleOps,
    // makeAdminDrizzleOps,
    makeRunnersDrizzleOps,
    makeRunsDrizzleOps,
    // makePacksDrizzleOps,
    // makeMetadataDrizzleOps,
    db
} from '@phyt/drizzle';

import {
    makeCommentsRepository,
    makeUsersRepository,
    makeReactionsRepository,
    makePostsRepository,
    // makeAdminRepository,
    makeRunnersRepository,
    makeRunsRepository
    // makePacksRepository,
    // makeMetadataRepository
} from '@phyt/repositories';

import {
    makeCommentsService,
    makeUsersService,
    makeMerkleTreeService,
    makeReactionsService,
    makePostsService,
    // makeAdminService,
    makeRunnersServices,
    makeRunsServices
    // makePacksService,
    // makeMetadataService
} from '@phyt/services';

import { avatarConfig, awsClient } from '@phyt/infra/server';

// import { makeAdminController } from './controllers/adminController.js';
import { makeCommentsController } from './controllers/commentsController.js';
// import { makeMetadataController } from './controllers/metadataController.js';
// import { makePacksController } from './controllers/packsController.js';
import { makePostsController } from './controllers/postsController.js';
import { makeReactionsController } from './controllers/reactionsController.js';
import { makeRunnersController } from './controllers/runnersController.js';
import { makeRunsController } from './controllers/runsController.js';
import { makeUsersController } from './controllers/usersController.js';

export const ops = {
    commentsDrizzleOps: makeCommentsDrizzleOps({ db }),
    usersDrizzleOps: makeUsersDrizzleOps({ db }),
    avatarAWSOps: makeAvatarAWSOps({ awsClient, avatarConfig }),
    reactionsDrizzleOps: makeReactionsDrizzleOps({ db }),
    postsDrizzleOps: makePostsDrizzleOps({ db }),
    // adminDrizzleOps: makeAdminDrizzleOps(db),
    runnersDrizzleOps: makeRunnersDrizzleOps({ db }),
    runsDrizzleOps: makeRunsDrizzleOps({ db })
    // packsDrizzleOps: makePacksDrizzleOps(db),
    // metadataDrizzleOps: makeMetadataDrizzleOps(db)
};

export const repos = {
    comments: makeCommentsRepository({ drizzleOps: ops.commentsDrizzleOps }),
    users: makeUsersRepository({
        drizzleOps: ops.usersDrizzleOps,
        awsOps: ops.avatarAWSOps
    }),
    reactions: makeReactionsRepository({
        drizzleOps: ops.reactionsDrizzleOps
    }),
    posts: makePostsRepository({ drizzleOps: ops.postsDrizzleOps }),
    // admin: makeAdminRepository(ops.adminDrizzleOps),
    runners: makeRunnersRepository({ drizzleOps: ops.runnersDrizzleOps }),
    runs: makeRunsRepository({ drizzleOps: ops.runsDrizzleOps })
    // packs: makePacksRepository(ops.packsDrizzleOps),
    // metadata: makeMetadataRepository(ops.metadataDrizzleOps, ops.userAWSOps)
};

export const service = {
    comments: makeCommentsService({
        commentsRepo: repos.comments
    }),
    users: makeUsersService({
        usersRepo: repos.users
    }),
    merkletree: makeMerkleTreeService({
        usersRepo: repos.users
    }),
    reactions: makeReactionsService({
        reactionsRepo: repos.reactions
    }),
    posts: makePostsService({
        postsRepo: repos.posts
    }),
    // admin: makeAdminService(repos.admin),
    runners: makeRunnersServices({
        runnersRepo: repos.runners
    }),
    runs: makeRunsServices({
        runsRepo: repos.runs,
        usersRepo: repos.users
    })
    // packs: makePacksService(repos.packs),
    // metadata: makeMetadataService(repos.metadata)
};

export const controller = {
    comments: makeCommentsController({
        commentServices: service.comments
    }),
    users: makeUsersController({
        userServices: service.users
    }),
    reactions: makeReactionsController({
        reactionsServices: service.reactions
    }),
    posts: makePostsController({
        postServices: service.posts
    }),
    // admin: makeAdminController(service.admin),
    runners: makeRunnersController({
        runnerServices: service.runners
    }),
    runs: makeRunsController({
        runServices: service.runs
    })
    // packs: makePacksController(service.packs),
    // metadata: makeMetadataController(service.metadata)
};
