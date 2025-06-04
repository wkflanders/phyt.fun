import { uuidv7 } from 'uuidv7';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// eslint-disable-next-line no-restricted-imports
import { CommentsVO } from '../commentsModel.js';

import type { UUIDv7 } from '@phyt/types';

describe('commentsModel', () => {
    const validCommentInput = {
        postId: uuidv7() as UUIDv7,
        userId: uuidv7() as UUIDv7,
        content: 'This is a test comment',
        parentCommentId: null
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('CommentsVO.create', () => {
        it('should create a valid comment with all fields', () => {
            const comment = CommentsVO.create({ input: validCommentInput });

            expect(comment.postId).toBe(validCommentInput.postId);
            expect(comment.userId).toBe(validCommentInput.userId);
            expect(comment.content).toBe('This is a test comment');
            expect(comment.parentCommentId).toBeNull();
            expect(comment.id).toBeDefined();
            expect(comment.createdAt).toBeInstanceOf(Date);
            expect(comment.updatedAt).toBeInstanceOf(Date);
            expect(comment.deletedAt).toBeNull();
        });

        it('should create a comment with parent comment ID', () => {
            const parentCommentId = uuidv7() as UUIDv7;
            const input = { ...validCommentInput, parentCommentId };
            const comment = CommentsVO.create({ input });

            expect(comment.parentCommentId).toBe(parentCommentId);
        });

        it('should reject comment with empty content', () => {
            const invalidInput = { ...validCommentInput, content: '' };

            expect(() => {
                CommentsVO.create({ input: invalidInput });
            }).toThrow('Comment content cannot be empty');
        });

        it('should reject comment with whitespace-only content', () => {
            const invalidInput = { ...validCommentInput, content: '   ' };

            expect(() => {
                CommentsVO.create({ input: invalidInput });
            }).toThrow('Comment content cannot be empty');
        });

        it('should reject comment without post ID', () => {
            const invalidInput = { ...validCommentInput, postId: '' as UUIDv7 };

            expect(() => {
                CommentsVO.create({ input: invalidInput });
            }).toThrow('Post ID is required');
        });

        it('should reject comment without user ID', () => {
            const invalidInput = { ...validCommentInput, userId: '' as UUIDv7 };

            expect(() => {
                CommentsVO.create({ input: invalidInput });
            }).toThrow('User ID is required');
        });
    });

    describe('CommentsVO.update', () => {
        it('should update comment content successfully', () => {
            const comment = CommentsVO.create({ input: validCommentInput });

            vi.advanceTimersByTime(1000);

            const updatedComment = comment.update({
                update: { content: 'Updated comment content' }
            });

            expect(updatedComment.content).toBe('Updated comment content');
            expect(updatedComment.userId).toBe(validCommentInput.userId); // should preserve other fields
            expect(updatedComment.updatedAt).toBeInstanceOf(Date);
            expect(updatedComment.updatedAt > comment.updatedAt).toBe(true);
        });

        it('should reject update with empty content', () => {
            const comment = CommentsVO.create({ input: validCommentInput });

            expect(() => {
                comment.update({ update: { content: '' } });
            }).toThrow('Comment content cannot be empty');
        });

        it('should reject update with whitespace-only content', () => {
            const comment = CommentsVO.create({ input: validCommentInput });

            expect(() => {
                comment.update({ update: { content: '   ' } });
            }).toThrow('Comment content cannot be empty');
        });
    });

    describe('CommentsVO.remove', () => {
        it('should mark comment as deleted', () => {
            const comment = CommentsVO.create({ input: validCommentInput });
            const deletedComment = comment.remove();

            expect(deletedComment.deletedAt).toBeInstanceOf(Date);
            expect(deletedComment.id).toBe(comment.id); // should preserve other fields
            expect(deletedComment.content).toBe(comment.content);
        });
    });

    describe('CommentsVO.with', () => {
        it('should add username and avatar URL', () => {
            const comment = CommentsVO.create({ input: validCommentInput });
            const commentWithOptions = comment.with({
                username: 'testuser',
                avatarUrl: 'https://example.com/avatar.jpg'
            });

            expect(commentWithOptions.username).toBe('testuser');
            expect(commentWithOptions.avatarUrl).toBe(
                'https://example.com/avatar.jpg'
            );
            expect(commentWithOptions.id).toBe(comment.id); // should preserve other fields
        });

        it('should handle partial options', () => {
            const comment = CommentsVO.create({ input: validCommentInput });
            const commentWithUsername = comment.with({ username: 'testuser' });

            expect(commentWithUsername.username).toBe('testuser');
            expect(commentWithUsername.avatarUrl).toBeUndefined();
        });
    });

    describe('CommentsVO.from', () => {
        it('should create CommentsVO from existing comment data', () => {
            const existingComment = CommentsVO.create({
                input: validCommentInput
            });
            const commentFromData = CommentsVO.from({
                comment: existingComment.toJSON()
            });

            expect(commentFromData.id).toBe(existingComment.id);
            expect(commentFromData.content).toBe(existingComment.content);
            expect(commentFromData.userId).toBe(existingComment.userId);
        });

        it('should create CommentsVO from existing comment data with options', () => {
            const existingComment = CommentsVO.create({
                input: validCommentInput
            });
            const commentFromData = CommentsVO.from({
                comment: existingComment.toJSON(),
                options: {
                    username: 'fromuser',
                    avatarUrl: 'https://example.com/from-avatar.jpg'
                }
            });

            expect(commentFromData.username).toBe('fromuser');
            expect(commentFromData.avatarUrl).toBe(
                'https://example.com/from-avatar.jpg'
            );
        });
    });

    describe('CommentsVO.toDTO', () => {
        it('should return DTO with proper date instances', () => {
            const comment = CommentsVO.create({ input: validCommentInput });
            const dto = comment.toDTO();

            expect(dto.createdAt).toBeInstanceOf(Date);
            expect(dto.updatedAt).toBeInstanceOf(Date);
            expect(dto.id).toBe(comment.id);
            expect(dto.content).toBe(comment.content);
        });

        it('should include username and avatarUrl in DTO when present', () => {
            const comment = CommentsVO.create({ input: validCommentInput });
            const commentWithOptions = comment.with({
                username: 'testuser',
                avatarUrl: 'https://example.com/avatar.jpg'
            });
            const dto = commentWithOptions.toDTO();

            expect(dto.username).toBe('testuser');
            expect(dto.avatarUrl).toBe('https://example.com/avatar.jpg');
        });
    });

    describe('CommentsVO.toJSON', () => {
        it('should return plain object representation', () => {
            const comment = CommentsVO.create({ input: validCommentInput });
            const json = comment.toJSON();

            expect(json).toEqual(
                expect.objectContaining({
                    postId: validCommentInput.postId,
                    userId: validCommentInput.userId,
                    content: validCommentInput.content
                })
            );

            // Should be a plain object without VO methods
            expect(json).not.toHaveProperty('update');
            expect(json).not.toHaveProperty('remove');
        });
    });
});
