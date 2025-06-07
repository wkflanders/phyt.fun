/* eslint-disable no-console */
import { db } from './db.js';
import { makeCommentsDrizzleOps } from './ops/commentsDrizzleOps.js';
import { makePostsDrizzleOps } from './ops/postsDrizzleOps.js';
import { makeReactionsDrizzleOps } from './ops/reactionsDrizzleOps.js';
import { makeUsersDrizzleOps } from './ops/usersDrizzleOps.js';

import type { WalletAddress } from '@phyt/types';

async function seed() {
    const usersOps = makeUsersDrizzleOps({ db });
    const postsOps = makePostsDrizzleOps({ db });
    const commentsOps = makeCommentsDrizzleOps({ db });
    const reactionsOps = makeReactionsDrizzleOps({ db });

    // 1. Create users
    const user1 = await usersOps.create({
        input: {
            email: 'alice@example.com',
            username: 'alice',
            role: 'user',
            privyId: 'privy-alice',
            walletAddress: ('0x' + 'a'.repeat(40)) as WalletAddress,
            avatarUrl: undefined,
            twitterHandle: null,
            stravaHandle: null,
            phytnessPoints: 100
        }
    });
    const user2 = await usersOps.create({
        input: {
            email: 'bob@example.com',
            username: 'bob',
            role: 'user',
            privyId: 'privy-bob',
            walletAddress: ('0x' + 'b'.repeat(40)) as WalletAddress,
            avatarUrl: undefined,
            twitterHandle: null,
            stravaHandle: null,
            phytnessPoints: 50
        }
    });

    // 2. Create posts
    const post1 = await postsOps.create({
        input: {
            userId: user1.id,
            title: 'Alice Post',
            content: 'This is a post by Alice.',
            status: 'visible'
        }
    });
    const post2 = await postsOps.create({
        input: {
            userId: user2.id,
            title: 'Bob Post',
            content: 'This is a post by Bob.',
            status: 'hidden'
        }
    });

    // 3. Create comments
    const comment1 = await commentsOps.create({
        input: {
            postId: post1.id,
            userId: user2.id,
            content: 'Nice post, Alice!',
            parentCommentId: null
        }
    });
    const comment2 = await commentsOps.create({
        input: {
            postId: post2.id,
            userId: user1.id,
            content: 'Thanks Bob!',
            parentCommentId: null
        }
    });

    // 4. Create reactions
    await reactionsOps.create({
        input: {
            userId: user1.id,
            postId: post2.id,
            commentId: undefined,
            type: 'like'
        }
    });
    await reactionsOps.create({
        input: {
            userId: user2.id,
            postId: post1.id,
            commentId: undefined,
            type: 'fire'
        }
    });
    await reactionsOps.create({
        input: {
            userId: user1.id,
            postId: undefined,
            commentId: comment1.id,
            type: 'insightful'
        }
    });
    await reactionsOps.create({
        input: {
            userId: user2.id,
            postId: undefined,
            commentId: comment2.id,
            type: 'funny'
        }
    });

    console.log('Seed data inserted!');
}

seed()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
        console.error(err);
        process.exit(1);
    });
