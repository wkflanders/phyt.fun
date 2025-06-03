import { uuidv7 } from 'uuidv7';
import { describe, it, expect } from 'vitest';

// eslint-disable-next-line no-restricted-imports
import { PostsVO } from '../postsModel.js';

import type { PostStatus, UUIDv7 } from '@phyt/types';

describe('postsModel', () => {
    const validPostInput = {
        userId: uuidv7() as UUIDv7,
        title: 'Test Post Title',
        content: 'This is test post content',
        runId: uuidv7() as UUIDv7,
        status: 'visible' as const
    };

    describe('PostsVO.create', () => {
        it('should create a valid post with all fields', () => {
            const post = PostsVO.create({ input: validPostInput });

            expect(post.userId).toBe(validPostInput.userId);
            expect(post.title).toBe('Test Post Title');
            expect(post.content).toBe('This is test post content');
            expect(post.runId).toBe(validPostInput.runId);
            expect(post.status).toBe('visible');
            expect(post.id).toBeDefined();
            expect(post.createdAt).toBeInstanceOf(Date);
            expect(post.updatedAt).toBeInstanceOf(Date);
            expect(post.deletedAt).toBeNull();
        });

        it('should create a post without run ID', () => {
            const input = { ...validPostInput, runId: undefined };
            const post = PostsVO.create({ input });

            expect(post.runId).toBeNull();
            expect(post.title).toBe(validPostInput.title);
        });

        it('should reject post without user ID', () => {
            const invalidInput = { ...validPostInput, userId: '' as UUIDv7 };

            expect(() => {
                PostsVO.create({ input: invalidInput });
            }).toThrow('User ID is required');
        });

        it('should reject post with empty title', () => {
            const invalidInput = { ...validPostInput, title: '' };

            expect(() => {
                PostsVO.create({ input: invalidInput });
            }).toThrow('Post title cannot be empty');
        });

        it('should reject post with whitespace-only title', () => {
            const invalidInput = { ...validPostInput, title: '   ' };

            expect(() => {
                PostsVO.create({ input: invalidInput });
            }).toThrow('Post title cannot be empty');
        });

        it('should reject post with empty content', () => {
            const invalidInput = { ...validPostInput, content: '' };

            expect(() => {
                PostsVO.create({ input: invalidInput });
            }).toThrow('Post content cannot be empty');
        });

        it('should reject post with whitespace-only content', () => {
            const invalidInput = { ...validPostInput, content: '   ' };

            expect(() => {
                PostsVO.create({ input: invalidInput });
            }).toThrow('Post content cannot be empty');
        });

        it('should reject post with invalid status', () => {
            const invalidInput = {
                ...validPostInput,
                status: 'invalid' as PostStatus
            };

            expect(() => {
                PostsVO.create({ input: invalidInput });
            }).toThrow('Invalid post status');
        });
    });

    describe('PostsVO.update', () => {
        it('should update post data successfully', () => {
            const post = PostsVO.create({ input: validPostInput });
            const updatedPost = post.update({
                update: {
                    title: 'Updated Title',
                    content: 'Updated content',
                    status: 'hidden'
                }
            });

            expect(updatedPost.title).toBe('Updated Title');
            expect(updatedPost.content).toBe('Updated content');
            expect(updatedPost.status).toBe('hidden');
            expect(updatedPost.userId).toBe(validPostInput.userId); // should preserve other fields
            expect(updatedPost.updatedAt).toBeInstanceOf(Date);
            expect(updatedPost.updatedAt > post.updatedAt).toBe(true);
        });

        it('should reject update with empty title', () => {
            const post = PostsVO.create({ input: validPostInput });

            expect(() => {
                post.update({ update: { title: '' } });
            }).toThrow('Post title cannot be empty');
        });

        it('should reject update with empty content', () => {
            const post = PostsVO.create({ input: validPostInput });

            expect(() => {
                post.update({ update: { content: '' } });
            }).toThrow('Post content cannot be empty');
        });

        it('should reject update with invalid status', () => {
            const post = PostsVO.create({ input: validPostInput });

            expect(() => {
                post.update({
                    update: { status: 'invalid' as PostStatus }
                });
            }).toThrow('Invalid post status');
        });
    });

    describe('PostsVO.remove', () => {
        it('should mark post as deleted', () => {
            const post = PostsVO.create({ input: validPostInput });
            const deletedPost = post.remove();

            expect(deletedPost.deletedAt).toBeInstanceOf(Date);
            expect(deletedPost.id).toBe(post.id); // should preserve other fields
            expect(deletedPost.title).toBe(post.title);
        });
    });

    describe('PostsVO.with', () => {
        it('should add username, avatarUrl, stats, and run', () => {
            const post = PostsVO.create({ input: validPostInput });
            const mockStats = {
                commentCount: 3,
                reactionCount: 5,
                shareCount: 1
            };
            const mockRun = {
                id: uuidv7() as UUIDv7,
                distance: 5000,
                durationSeconds: 3600,
                startTime: new Date(),
                endTime: new Date(),
                runnerId: uuidv7() as UUIDv7,
                averagePaceSec: 360,
                caloriesBurned: 100,
                stepCount: 1000,
                elevationGain: 100,
                averageHeartRate: 100,
                maxHeartRate: 150,
                deviceId: 'test-device-id',
                gpsRouteData: 'test-gps-route-data',
                isPosted: true,
                verificationStatus: 'verified' as const,
                rawDataJson: { test: 'test' },
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            };

            const postWithOptions = post.with({
                username: 'testuser',
                avatarUrl: 'https://example.com/avatar.jpg',
                stats: mockStats,

                run: mockRun
            });

            expect(postWithOptions.username).toBe('testuser');
            expect(postWithOptions.avatarUrl).toBe(
                'https://example.com/avatar.jpg'
            );
            expect(postWithOptions.stats).toEqual(mockStats);
            expect(postWithOptions.run).toEqual(mockRun);
            expect(postWithOptions.id).toBe(post.id); // should preserve other fields
        });

        it('should handle partial options', () => {
            const post = PostsVO.create({ input: validPostInput });
            const postWithUsername = post.with({ username: 'testuser' });

            expect(postWithUsername.username).toBe('testuser');
            expect(postWithUsername.avatarUrl).toBeUndefined();
            expect(postWithUsername.stats).toBeUndefined();
            expect(postWithUsername.run).toBeUndefined();
        });
    });

    describe('PostsVO.from', () => {
        it('should create PostsVO from existing post data', () => {
            const existingPost = PostsVO.create({ input: validPostInput });
            const postFromData = PostsVO.from({
                post: existingPost.toJSON()
            });

            expect(postFromData.id).toBe(existingPost.id);
            expect(postFromData.title).toBe(existingPost.title);
            expect(postFromData.userId).toBe(existingPost.userId);
        });

        it('should create PostsVO from existing post data with options', () => {
            const existingPost = PostsVO.create({ input: validPostInput });
            const mockStats = {
                commentCount: 10,
                reactionCount: 5,
                shareCount: 2
            };

            const postFromData = PostsVO.from({
                post: existingPost.toJSON(),
                options: {
                    username: 'fromuser',
                    avatarUrl: 'https://example.com/from-avatar.jpg',
                    stats: mockStats
                }
            });

            expect(postFromData.username).toBe('fromuser');
            expect(postFromData.avatarUrl).toBe(
                'https://example.com/from-avatar.jpg'
            );
            expect(postFromData.stats).toEqual(mockStats);
        });
    });

    describe('PostsVO.toDTO', () => {
        it('should return DTO with proper date instances', () => {
            const post = PostsVO.create({ input: validPostInput });
            const dto = post.toDTO();

            expect(dto.createdAt).toBeInstanceOf(Date);
            expect(dto.updatedAt).toBeInstanceOf(Date);
            expect(dto.id).toBe(post.id);
            expect(dto.title).toBe(post.title);
        });

        it('should include username and avatarUrl in DTO when present', () => {
            const post = PostsVO.create({ input: validPostInput });
            const postWithOptions = post.with({
                username: 'testuser',
                avatarUrl: 'https://example.com/avatar.jpg'
            });
            const dto = postWithOptions.toDTO();

            expect(dto.username).toBe('testuser');
            expect(dto.avatarUrl).toBe('https://example.com/avatar.jpg');
        });
    });

    describe('PostsVO.toJSON', () => {
        it('should return plain object representation', () => {
            const post = PostsVO.create({ input: validPostInput });
            const json = post.toJSON();

            expect(json).toEqual(
                expect.objectContaining({
                    userId: validPostInput.userId,
                    title: validPostInput.title,
                    content: validPostInput.content,
                    status: validPostInput.status
                })
            );

            // Should be a plain object without VO methods
            expect(json).not.toHaveProperty('update');
            expect(json).not.toHaveProperty('remove');
        });
    });
});
