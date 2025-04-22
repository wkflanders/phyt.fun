import {
    NotFoundError,
    DatabaseError,
    RunnerProfile,
    RunnerActivity,
    RunnerPoolStatus,
    RunnerQueryParams
} from '@phyt/types';

import { runnerRepository } from '@/repositories/runnerRepository.js';
import { userRepository } from '@/repositories/userRepository.js';

export const runnerService = {
    getRecentActivities: async (
        filter?: string,
        privyId?: string
    ): Promise<RunnerActivity[]> => {
        try {
            let userId: number | undefined;
            if (filter === 'following' && privyId) {
                const users = await userRepository.findByPrivyId(privyId);
                if (!users.length) throw new NotFoundError('User not found');
                userId = users[0].id;
            }
            return await runnerRepository.findRecentActivities(filter, userId);
        } catch (error) {
            console.error('Error with getRecentActivities ', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to fetch recent activities');
        }
    },

    getRunnerActivities: async (
        runnerId: number
    ): Promise<RunnerActivity[]> => {
        try {
            const activities = await runnerRepository.findActivities(runnerId);
            if (!activities.length) {
                throw new NotFoundError(
                    `Runner with ID ${String(runnerId)} not found or no activities`
                );
            }
            return activities;
        } catch (error) {
            console.error('Error with getRunnerActivities ', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError(
                `Failed to fetch activities for runner ${String(runnerId)}`
            );
        }
    },

    getAllRunners: async (
        params: RunnerQueryParams
    ): Promise<RunnerProfile[]> => {
        try {
            return await runnerRepository.findAll(
                params.search,
                params.sortBy,
                params.sortOrder
            );
        } catch (error) {
            console.error('Error with getAllRunners ', error);
            throw new DatabaseError('Failed to get runners');
        }
    },

    getRunnerByPrivyId: async (privyId: string): Promise<RunnerProfile> => {
        try {
            const users = await userRepository.findByPrivyId(privyId);
            if (!users.length) throw new NotFoundError('User not found');
            const profile = await runnerRepository.findByUserId(users[0].id);
            if (!profile) throw new NotFoundError('Runner not found');
            return profile;
        } catch (error) {
            console.error('Error with getRunnerByPrivyId ', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get runner');
        }
    },

    getRunnerById: async (runnerId: number): Promise<RunnerProfile> => {
        try {
            const profile = await runnerRepository.findById(runnerId);
            if (!profile) throw new NotFoundError('Runner not found');
            return profile;
        } catch (error) {
            console.error('Error with getRunnerById ', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get runner');
        }
    },

    getRunnerStatusByPrivyId: async (
        privyId: string
    ): Promise<RunnerPoolStatus> => {
        try {
            const users = await userRepository.findByPrivyId(privyId);
            if (!users.length) throw new NotFoundError('User not found');
            const status = await runnerRepository.findStatusByUserId(
                users[0].id
            );
            if (!status) throw new NotFoundError('Runner not found');
            return status;
        } catch (error) {
            console.error('Error with getRunnerStatusByPrivyId ', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get runner status');
        }
    }
};
