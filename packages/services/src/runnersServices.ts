import { RunnerVO } from '@phyt/models';

import {
    RunnerSchema,
    PrivyIdDTO,
    RunnerIdDTO,
    RunnerDTO,
    CreateRunnerDTO,
    UpdateRunnerDTO,
    RunnersPageDTO,
    RunnerQueryParamsDTO
} from '@phyt/dto';

import type { RunnersRepository } from '@phyt/repositories';

export type RunnersService = ReturnType<typeof makeRunnersServices>;

export const makeRunnersServices = ({
    runnersRepo
}: {
    runnersRepo: RunnersRepository;
}) => {
    const createRunner = async ({
        input
    }: {
        input: CreateRunnerDTO;
    }): Promise<RunnerDTO> => {
        const runnerVO = RunnerVO.create({ input });
        await runnersRepo.save({ input: runnerVO });
        return RunnerSchema.parse(runnerVO.toDTO());
    };

    const getRunnerById = async ({
        runnerId
    }: {
        runnerId: RunnerIdDTO;
    }): Promise<RunnerDTO> => {
        const runnerVO = await runnersRepo.findById({ runnerId });
        return RunnerSchema.parse(runnerVO.toDTO());
    };

    const getRunnerByPrivyId = async ({
        privyId
    }: {
        privyId: PrivyIdDTO;
    }): Promise<RunnerDTO> => {
        const runnerVO = await runnersRepo.findByPrivyId({ privyId });
        return RunnerSchema.parse(runnerVO.toDTO<RunnerDTO>());
    };

    const getAllRunners = async ({
        params
    }: {
        params: RunnerQueryParamsDTO;
    }): Promise<RunnersPageDTO> => {
        const paginatedRunners = await runnersRepo.findAll({ params });
        return {
            runners: paginatedRunners.runners.map((runner) =>
                RunnerSchema.parse(runner.toDTO<RunnerDTO>())
            ),
            pagination: paginatedRunners.pagination
        };
    };

    const updateRunner = async ({
        runnerId,
        update
    }: {
        runnerId: RunnerIdDTO;
        update: UpdateRunnerDTO;
    }): Promise<RunnerDTO> => {
        const runnerVO = await runnersRepo.findById({ runnerId });
        const updatedRunnerVO = runnerVO.update({ update });
        await runnersRepo.save({ input: updatedRunnerVO });
        return RunnerSchema.parse(updatedRunnerVO.toDTO());
    };

    const deleteRunner = async ({
        runnerId
    }: {
        runnerId: RunnerIdDTO;
    }): Promise<RunnerDTO> => {
        const runnerVO = await runnersRepo.findById({ runnerId });
        const removedRunnerVO = runnerVO.remove();
        await runnersRepo.save({ input: removedRunnerVO });
        return RunnerSchema.parse(runnerVO.toDTO());
    };

    return {
        getAllRunners,
        getRunnerById,
        getRunnerByPrivyId,
        createRunner,
        updateRunner,
        deleteRunner
    };
};
