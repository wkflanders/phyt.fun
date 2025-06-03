import { uuidv7 } from 'uuidv7';
import { describe, it, expect } from 'vitest';

// eslint-disable-next-line no-restricted-imports
import { ReactionsVO } from '../reactionsModel.js';

import type { ReactionType, UUIDv7 } from '@phyt/types';

describe('reactionsModel', () => {
    const validReactionInputPost = {
        userId: uuidv7() as UUIDv7,
        postId: uuidv7() as UUIDv7,
        commentId: null,
        type: 'like' as const
    };

    const validReactionInputComment = {
        userId: uuidv7() as UUIDv7,
        postId: null,
        commentId: uuidv7() as UUIDv7,
        type: 'funny' as const
    };

    describe('ReactionsVO.create', () => {
        it('should create a valid reaction for a post', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputPost
            });

            expect(reaction.userId).toBe(validReactionInputPost.userId);
            expect(reaction.postId).toBe(validReactionInputPost.postId);
            expect(reaction.commentId).toBeNull();
            expect(reaction.type).toBe('like');
            expect(reaction.id).toBeDefined();
            expect(reaction.createdAt).toBeInstanceOf(Date);
            expect(reaction.updatedAt).toBeInstanceOf(Date);
        });

        it('should create a valid reaction for a comment', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputComment
            });

            expect(reaction.userId).toBe(validReactionInputComment.userId);
            expect(reaction.postId).toBeNull();
            expect(reaction.commentId).toBe(
                validReactionInputComment.commentId
            );
            expect(reaction.type).toBe('funny');
        });

        it('should reject reaction without user ID', () => {
            const invalidInput = {
                ...validReactionInputPost,
                userId: '' as UUIDv7
            };

            expect(() => {
                ReactionsVO.create({ input: invalidInput });
            }).toThrow('User ID is required');
        });

        it('should reject reaction without post ID or comment ID', () => {
            const invalidInput = {
                ...validReactionInputPost,
                postId: null,
                commentId: null
            };

            expect(() => {
                ReactionsVO.create({ input: invalidInput });
            }).toThrow('Either post ID or comment ID is required');
        });

        it('should reject reaction with both post ID and comment ID', () => {
            const invalidInput = {
                ...validReactionInputPost,
                commentId: uuidv7() as UUIDv7
            };

            expect(() => {
                ReactionsVO.create({ input: invalidInput });
            }).toThrow('Either post ID or comment ID is required, not both');
        });
    });

    describe('ReactionsVO.update', () => {
        it('should update reaction type successfully', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputPost
            });
            const updatedReaction = reaction.update({
                update: { type: 'insightful', action: 'added' }
            });

            expect(updatedReaction.type).toBe('insightful');
            expect(updatedReaction.userId).toBe(validReactionInputPost.userId); // should preserve other fields
            expect(updatedReaction.updatedAt).toBeInstanceOf(Date);
            expect(updatedReaction.updatedAt > reaction.updatedAt).toBe(true);
        });

        it('should reject update with invalid reaction type', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputPost
            });

            expect(() => {
                reaction.update({
                    update: { type: 'invalid' as ReactionType, action: 'added' }
                });
            }).toThrow('Invalid reaction type');
        });
    });

    describe('ReactionsVO.with', () => {
        it('should add username, avatarUrl, and counts', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputPost
            });
            const mockCounts = { like: 5, funny: 2, insightful: 1, fire: 0 };

            const reactionWithOptions = reaction.with({
                username: 'testuser',
                avatarUrl: 'https://example.com/avatar.jpg',
                counts: mockCounts
            });

            expect(reactionWithOptions.username).toBe('testuser');
            expect(reactionWithOptions.avatarUrl).toBe(
                'https://example.com/avatar.jpg'
            );
            expect(reactionWithOptions.counts).toEqual(mockCounts);
            expect(reactionWithOptions.id).toBe(reaction.id); // should preserve other fields
        });

        it('should handle partial options', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputPost
            });
            const reactionWithUsername = reaction.with({
                username: 'testuser'
            });

            expect(reactionWithUsername.username).toBe('testuser');
            expect(reactionWithUsername.avatarUrl).toBeUndefined();
            expect(reactionWithUsername.counts).toBeUndefined();
        });
    });

    describe('ReactionsVO.from', () => {
        it('should create ReactionsVO from existing reaction data', () => {
            const existingReaction = ReactionsVO.create({
                input: validReactionInputPost
            });
            const reactionFromData = ReactionsVO.from({
                reaction: existingReaction.toJSON()
            });

            expect(reactionFromData.id).toBe(existingReaction.id);
            expect(reactionFromData.type).toBe(existingReaction.type);
            expect(reactionFromData.userId).toBe(existingReaction.userId);
        });

        it('should create ReactionsVO from existing reaction data with options', () => {
            const existingReaction = ReactionsVO.create({
                input: validReactionInputPost
            });
            const mockCounts = { like: 10, funny: 5, insightful: 2, fire: 0 };

            const reactionFromData = ReactionsVO.from({
                reaction: existingReaction.toJSON(),
                options: {
                    username: 'fromuser',
                    avatarUrl: 'https://example.com/from-avatar.jpg',
                    counts: mockCounts
                }
            });

            expect(reactionFromData.username).toBe('fromuser');
            expect(reactionFromData.avatarUrl).toBe(
                'https://example.com/from-avatar.jpg'
            );
            expect(reactionFromData.counts).toEqual(mockCounts);
        });
    });

    describe('ReactionsVO.toDTO', () => {
        it('should return DTO with proper date instances', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputPost
            });
            const dto = reaction.toDTO();

            expect(dto.createdAt).toBeInstanceOf(Date);
            expect(dto.updatedAt).toBeInstanceOf(Date);
            expect(dto.id).toBe(reaction.id);
            expect(dto.type).toBe(reaction.type);
        });

        it('should include username and avatarUrl in DTO when present', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputPost
            });
            const reactionWithOptions = reaction.with({
                username: 'testuser',
                avatarUrl: 'https://example.com/avatar.jpg'
            });
            const dto = reactionWithOptions.toDTO();

            expect(dto.username).toBe('testuser');
            expect(dto.avatarUrl).toBe('https://example.com/avatar.jpg');
        });
    });

    describe('ReactionsVO.toJSON', () => {
        it('should return plain object representation', () => {
            const reaction = ReactionsVO.create({
                input: validReactionInputPost
            });
            const json = reaction.toJSON();

            expect(json).toEqual(
                expect.objectContaining({
                    userId: validReactionInputPost.userId,
                    postId: validReactionInputPost.postId,
                    type: validReactionInputPost.type
                })
            );

            // Should be a plain object without VO methods
            expect(json).not.toHaveProperty('update');
            expect(json).not.toHaveProperty('with');
        });
    });
});
