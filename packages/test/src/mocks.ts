import { vi } from 'vitest';

export const createMockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
});

export const createMockResponse = () => {
    const vi = () => ({ fn: () => ({ mockReturnThis: () => ({}) }) });
    const res = {
        status: vi().fn().mockReturnThis(),
        json: vi().fn().mockReturnThis(),
        send: vi().fn().mockReturnThis(),
        end: vi().fn().mockReturnThis()
    };
    return res;
};

export const createMockUser = (overrides = {}) => ({
    id: 'mock-user-id',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
    privyId: 'mock-privy-id',
    avatarUrl: null,
    walletAddress: '0x123',
    phytnessPoints: 0,
    twitterHandle: null,
    stravaHandle: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides
});

export const createMockComment = (overrides = {}) => ({
    id: 'mock-comment-id',
    postId: 'post-1',
    userId: 'user-1',
    content: 'mock content',
    parentCommentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides
});

export const createMockPost = (overrides = {}) => ({
    id: 'mock-post-id',
    userId: 'user-1',
    content: 'mock post content',
    mediaUrls: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides
});

export const createMockRun = (overrides = {}) => ({
    id: 'mock-run-id',
    userId: 'user-1',
    distance: 5000,
    duration: 1800,
    pace: 6.0,
    elevation: 100,
    route: 'mock-route',
    startedAt: new Date(),
    finishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides
});

export const createMockTransaction = (overrides = {}) => ({
    id: 'mock-transaction-id',
    type: 'reward',
    amount: 100,
    fromUserId: undefined,
    toUserId: 'user-1',
    description: 'mock transaction',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides
});

// Mock function builders for drizzle ops
export const createMockUsersDrizzleOps = () => ({
    create: vi.fn().mockResolvedValue(createMockUser()),
    update: vi.fn().mockResolvedValue(createMockUser()),
    findByPrivyId: vi.fn().mockResolvedValue(createMockUser()),
    findByPrivyIdWithStatus: vi
        .fn()
        .mockResolvedValue(createMockUser({ status: 'active' })),
    findById: vi.fn().mockResolvedValue(createMockUser()),
    findByIdWithStatus: vi
        .fn()
        .mockResolvedValue(createMockUser({ status: 'active' })),
    findByWalletAddress: vi.fn().mockResolvedValue(createMockUser()),
    findByEmail: vi.fn().mockResolvedValue(createMockUser()),
    findByUsername: vi.fn().mockResolvedValue(createMockUser()),
    findTransactionById: vi.fn().mockResolvedValue([]),
    findCardsById: vi.fn().mockResolvedValue([]),
    listUsers: vi.fn().mockResolvedValue({ users: [], total: 0 }),
    findWhitelistedWallets: vi.fn().mockResolvedValue([]),
    remove: vi.fn().mockResolvedValue(createMockUser()),
    unsafeRemove: vi.fn().mockResolvedValue(createMockUser())
});

export const createMockCommentsDrizzleOps = () => ({
    create: vi.fn().mockResolvedValue(createMockComment()),
    findById: vi.fn().mockResolvedValue(createMockComment()),
    listForPost: vi.fn().mockResolvedValue([]),
    listReplies: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(createMockComment()),
    remove: vi.fn().mockResolvedValue(createMockComment()),
    unsafeRemove: vi.fn().mockResolvedValue(createMockComment())
});

export const createMockAwsOps = () => ({
    uploadAvatar: vi.fn().mockResolvedValue('https://example.com/avatar.jpg'),
    generateAvatarUrl: vi
        .fn()
        .mockReturnValue('https://example.com/avatar.jpg'),
    deleteAvatar: vi.fn().mockResolvedValue(undefined),
    extractFileKeyFromUrl: vi.fn().mockReturnValue('avatar-key')
});

// Mock repository builders
export const createMockUsersRepo = () => ({
    save: vi.fn().mockResolvedValue(createMockUser()),
    findById: vi.fn().mockResolvedValue(createMockUser()),
    findByIdWithStatus: vi
        .fn()
        .mockResolvedValue(createMockUser({ status: 'active' })),
    findByPrivyId: vi.fn().mockResolvedValue(createMockUser()),
    findByPrivyIdWithStatus: vi
        .fn()
        .mockResolvedValue(createMockUser({ status: 'active' })),
    findByWalletAddress: vi.fn().mockResolvedValue(createMockUser()),
    findByEmail: vi.fn().mockResolvedValue(createMockUser()),
    findByUsername: vi.fn().mockResolvedValue(createMockUser()),
    findAll: vi.fn().mockResolvedValue([]),
    findWhitelistedWallets: vi.fn().mockResolvedValue([]),
    uploadAvatar: vi.fn().mockResolvedValue('https://example.com/avatar.jpg'),
    updateAvatarWithFile: vi.fn().mockResolvedValue(createMockUser()),
    deleteAvatar: vi.fn().mockResolvedValue(createMockUser()),
    extractFileKeyFromUrl: vi.fn().mockReturnValue('avatar-key'),
    remove: vi.fn().mockResolvedValue(createMockUser())
});
