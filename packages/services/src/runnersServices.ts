import {
    RunnerProfileSchema,
    RunnerActivitySchema,
    RunnerPoolStatusSchema,
    RunnerSchema,
    RunnerDTO,
    RunnerProfileDTO,
    RunnerActivityDTO,
    RunnerPoolStatusDTO
} from '@phyt/dto';

import type { RunnersRepository } from '@phyt/repositories';
import type { UUIDv7, RunnerQueryParams } from '@phyt/types';

export type RunnersService = ReturnType<typeof makeRunnersServices>;

export const makeRunnersServices = (repo: RunnersRepository) => {
    /**
     * Domain operations: Return RunnerVO objects for internal use
     * These are not exposed outside the service
     */
    const _getRunnerById = async (id: UUIDv7) => {
        return await repo.getRunnerById(id);
    };

    /**
     * Public API: Always return plain DTOs for external consumption
     */
    const getAllRunners = async (
        params: RunnerQueryParams
    ): Promise<RunnerProfileDTO[]> => {
        const runners = await repo.getAllRunners(params);
        return runners.map((runner) =>
            RunnerProfileSchema.parse(runner.toDTO())
        );
    };

    const getRunnerById = async (
        runnerId: UUIDv7
    ): Promise<RunnerProfileDTO> => {
        const runner = await _getRunnerById(runnerId);
        return RunnerProfileSchema.parse(runner.toDTO());
    };

    const getRunnerByPrivyId = async (
        privyId: string
    ): Promise<RunnerProfileDTO> => {
        const runner = await repo.getRunnerByPrivyId(privyId);
        return RunnerProfileSchema.parse(runner.toDTO());
    };

    const getRunnerStatusByPrivyId = async (
        privyId: string
    ): Promise<RunnerPoolStatusDTO> => {
        // Get runner VO and extract status info
        const runner = await repo.getRunnerStatusByPrivyId(privyId);
        const status = {
            status: runner.status,
            isPooled: runner.isPooled
        };
        return RunnerPoolStatusSchema.parse(status);
    };

    const getRecentActivities = async (
        filter?: string
    ): Promise<RunnerActivityDTO[]> => {
        // Convert runner VOs to activities
        const runners = await repo.getRecentActivities(filter);

        // Convert runners to activities
        return runners.map((runner) => {
            const activity = {
                id: runner.id,
                runnerId: runner.id,
                username: runner.username ?? '',
                avatarUrl: runner.avatarUrl ?? '',
                distance: runner.totalDistance,
                completedAt: runner.updatedAt.toString(),
                isPooled: runner.isPooled,
                timeAgo: formatTimeAgo(new Date(runner.updatedAt))
            };
            return RunnerActivitySchema.parse(activity);
        });
    };

    const getRunnerActivities = async (
        runnerId: UUIDv7
    ): Promise<RunnerActivityDTO[]> => {
        // Make sure runner exists and get its data
        const runner = await _getRunnerById(runnerId);

        // Convert runner to an activity
        const activity = {
            id: runner.id,
            runnerId: runner.id,
            username: runner.username ?? '',
            avatarUrl: runner.avatarUrl ?? '',
            distance: runner.totalDistance,
            completedAt: runner.updatedAt.toString(),
            isPooled: runner.isPooled,
            timeAgo: formatTimeAgo(new Date(runner.updatedAt))
        };

        // Return as an array with one item
        return [RunnerActivitySchema.parse(activity)];
    };

    const createRunner = async (
        userId: UUIDv7,
        walletAddress: string
    ): Promise<RunnerDTO> => {
        const runner = await repo.createRunner(userId, walletAddress);
        return RunnerSchema.parse(runner.toDTO());
    };

    const updateRunnerStats = async (
        runnerId: UUIDv7,
        stats: {
            totalDistance?: number;
            totalRuns?: number;
            averagePace?: number | null;
            bestMileTime?: number | null;
        }
    ): Promise<RunnerDTO> => {
        const runner = await repo.updateRunnerStats(runnerId, stats);
        return RunnerSchema.parse(runner.toDTO());
    };

    const updateRunnerPoolStatus = async (
        runnerId: UUIDv7,
        isPooled: boolean
    ): Promise<RunnerDTO> => {
        const runner = await repo.updateRunnerPoolStatus(runnerId, isPooled);
        return RunnerSchema.parse(runner.toDTO());
    };

    // Helper function to format time ago for activities
    function formatTimeAgo(date: Date): string {
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 1) {
            return 'just now';
        } else if (diffInMinutes < 60) {
            return diffInMinutes.toString() + 'm ago';
        } else if (diffInMinutes < 24 * 60) {
            const hours = Math.floor(diffInMinutes / 60);
            return hours.toString() + 'h ago';
        } else {
            // Format as "May 5" or similar
            const months = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ];
            const monthIdx = date.getMonth();
            // Ensure we have a valid month index and get it as a string
            const month: string =
                monthIdx >= 0 && monthIdx < months.length
                    ? months[monthIdx]
                    : 'Jan';
            const day = date.getDate().toString();
            return month + ' ' + day;
        }
    }

    return {
        getAllRunners,
        getRunnerById,
        getRunnerByPrivyId,
        getRunnerStatusByPrivyId,
        getRecentActivities,
        getRunnerActivities,
        createRunner,
        updateRunnerStats,
        updateRunnerPoolStatus
    };
};
