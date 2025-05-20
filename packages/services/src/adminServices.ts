import {
    PendingRunnerSchema,
    PendingRunSchema,
    RunSchema
} from '../../dto/src/adminDTO.js';
import { UserSchema } from '../../dto/src/usersDTO.js';

import type { AdminRepository } from '../../repositories/src/adminRepo.js';
import type { UUIDv7 } from '@phyt/types';

export const makeAdminService = (repo: AdminRepository) => {
    return {
        async getPendingRunners() {
            const runners = await repo.getPendingRunners();
            return runners.map((runner: any) =>
                PendingRunnerSchema.parse(runner)
            );
        },
        async getPendingRuns() {
            const runs = await repo.getPendingRuns();
            return runs.map((run: any) => PendingRunSchema.parse(run));
        },
        async approveRunner(userId: UUIDv7) {
            const user = await repo.approveRunner(userId);
            return UserSchema.parse(user);
        },
        async updateRunVerification(
            runId: UUIDv7,
            status: 'verified' | 'flagged'
        ) {
            const run = await repo.updateRunVerification(runId, status);
            return RunSchema.parse(run);
        }
    };
};

export type AdminService = ReturnType<typeof makeAdminService>;
