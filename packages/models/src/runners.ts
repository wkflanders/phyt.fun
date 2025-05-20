import type {
    Runner,
    RunnerProfile,
    RunnerStatus,
    UUIDv7,
    ISODate
} from '@phyt/types';

export interface RunnerVO extends Runner {
    username?: string;
    avatarUrl?: string | null;
    updateStats(stats: {
        totalDistance?: number;
        totalRuns?: number;
        averagePace?: number | null;
        bestMileTime?: number | null;
    }): RunnerVO;
    updatePoolStatus(isPooled: boolean): RunnerVO;
    withUserInfo(username: string, avatarUrl: string | null): RunnerVO;
    toDTO<T extends Runner = Runner>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): RunnerRecord;
}

export interface RunnerRecord {
    id?: UUIDv7;
    userId: UUIDv7;
    totalDistance: number;
    averagePace: number | null;
    totalRuns: number;
    bestMileTime: number | null;
    status: RunnerStatus;
    isPooled: boolean;
    runnerWallet: string;
    createdAt: ISODate;
    updatedAt: ISODate;
}

export const RunnerVO = (() => {
    const make = (
        record: RunnerRecord & {
            username?: string | null;
            avatarUrl?: string | null;
        }
    ): RunnerVO => {
        const updateStats = (stats: {
            totalDistance?: number;
            totalRuns?: number;
            averagePace?: number | null;
            bestMileTime?: number | null;
        }): RunnerVO => {
            return make({
                ...record,
                ...stats,
                updatedAt: new Date().toISOString() as ISODate
            });
        };

        const updatePoolStatus = (isPooled: boolean): RunnerVO => {
            return make({
                ...record,
                isPooled,
                updatedAt: new Date().toISOString() as ISODate
            });
        };

        const withUserInfo = (
            username: string | null,
            avatarUrl: string | null
        ): RunnerVO => {
            return make({ ...record, username, avatarUrl });
        };

        const toDTO = <T extends Runner = Runner>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                id: record.id,
                userId: record.userId,
                totalDistance: record.totalDistance,
                averagePace: record.averagePace,
                totalRuns: record.totalRuns,
                bestMileTime: record.bestMileTime,
                status: record.status,
                isPooled: record.isPooled,
                runnerWallet: record.runnerWallet,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                ...(record.username ? { username: record.username } : {}),
                ...(record.avatarUrl !== undefined
                    ? { avatarUrl: record.avatarUrl }
                    : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): RunnerRecord => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            username: record.username,
            avatarUrl: record.avatarUrl,
            updateStats,
            updatePoolStatus,
            withUserInfo,
            toDTO,
            toJSON
        }) as RunnerVO;
    };

    return {
        create(userId: UUIDv7, walletAddress: string): RunnerVO {
            return make({
                id: undefined,
                userId,
                totalDistance: 0,
                averagePace: null,
                totalRuns: 0,
                bestMileTime: null,
                status: 'active',
                isPooled: false,
                runnerWallet: walletAddress,
                createdAt: new Date().toISOString() as ISODate,
                updatedAt: new Date().toISOString() as ISODate
            });
        },

        fromRecord(record: RunnerRecord): RunnerVO {
            return make(record);
        },

        fromProfile(data: RunnerProfile): RunnerVO {
            return make({
                id: data.id,
                userId: data.userId,
                totalDistance: data.totalDistance,
                averagePace: data.averagePace,
                totalRuns: data.totalRuns,
                bestMileTime: data.bestMileTime,
                status: data.status,
                isPooled: data.isPooled,
                runnerWallet: data.runnerWallet,
                createdAt: (data.createdAt instanceof Date
                    ? data.createdAt.toISOString()
                    : data.createdAt) as ISODate,
                updatedAt: (data.updatedAt instanceof Date
                    ? data.updatedAt.toISOString()
                    : data.updatedAt) as ISODate,
                username: data.username,
                avatarUrl: data.avatarUrl
            });
        }
    };
})();
