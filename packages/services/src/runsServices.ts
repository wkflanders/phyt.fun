import { RunsVO } from '@phyt/models';

import type {
    PrivyIdDTO,
    RunIdDTO,
    RunnerIdDTO,
    RunDTO,
    RunWithRunnerDTO,
    CreateRunDTO,
    UpdateRunDTO,
    RunQueryParamsDTO,
    RunsPageDTO,
    RunsWithRunnerPageDTO
} from '@phyt/dto';
import type { RunsRepository, UsersRepository } from '@phyt/repositories';

export type RunsService = ReturnType<typeof makeRunsServices>;

export const makeRunsServices = ({
    runsRepo,
    usersRepo
}: {
    runsRepo: RunsRepository;
    usersRepo: UsersRepository;
}) => {
    const createRun = async ({
        input
    }: {
        input: CreateRunDTO;
    }): Promise<RunDTO> => {
        const runVO = RunsVO.create({ input });
        await runsRepo.save({ input: runVO });
        return runVO.toDTO<RunDTO>();
    };

    const createRunByPrivyId = async ({
        privyId,
        input
    }: {
        privyId: PrivyIdDTO;
        input: CreateRunDTO;
    }): Promise<RunDTO> => {
        const userVO = await usersRepo.findByPrivyId({ privyId });
        const runVO = RunsVO.create({
            input: {
                ...input,
                runnerId: userVO.id
            }
        });
        await runsRepo.save({ input: runVO });
        return runVO.toDTO<RunDTO>();
    };

    const createRunsBatch = async ({
        input,
        params
    }: {
        input: CreateRunDTO[];
        params?: RunQueryParamsDTO;
    }): Promise<RunsPageDTO> => {
        const runsVOList = input.map((batch) =>
            RunsVO.create({ input: batch })
        );
        const result = await runsRepo.saveBatch({ input: runsVOList, params });
        return {
            runs: result.runs.map((run) => run.toDTO<RunDTO>()),
            pagination: result.pagination
        };
    };

    const createRunsBatchByPrivyId = async ({
        privyId,
        input,
        params
    }: {
        privyId: PrivyIdDTO;
        input: CreateRunDTO[];
        params?: RunQueryParamsDTO;
    }): Promise<RunsPageDTO> => {
        const userVO = await usersRepo.findByPrivyId({ privyId });
        const runsVOList = input.map((data) =>
            RunsVO.create({
                input: {
                    ...data,
                    runnerId: userVO.id
                }
            })
        );
        const result = await runsRepo.saveBatch({ input: runsVOList, params });
        return {
            runs: result.runs.map((run) => run.toDTO<RunDTO>()),
            pagination: result.pagination
        };
    };

    const getRunById = async ({
        runId
    }: {
        runId: RunIdDTO;
    }): Promise<RunDTO> => {
        const result = await runsRepo.findById({ runId });
        return result.toDTO<RunDTO>();
    };

    const getRunsByRunnerId = async ({
        runnerId,
        params
    }: {
        runnerId: RunnerIdDTO;
        params: RunQueryParamsDTO;
    }): Promise<RunsPageDTO> => {
        const result = await runsRepo.findByRunnerId({ runnerId, params });
        return {
            runs: result.runs.map((run) => run.toDTO<RunDTO>()),
            pagination: result.pagination
        };
    };

    const getRunsWithRunnerInfo = async ({
        runnerId,
        params
    }: {
        runnerId: RunnerIdDTO;
        params: RunQueryParamsDTO;
    }): Promise<RunsWithRunnerPageDTO> => {
        const result = await runsRepo.findWithRunnerInfo({ runnerId, params });
        return {
            runs: result.runs.map((run) => run.toDTO<RunWithRunnerDTO>()),
            pagination: result.pagination
        };
    };

    const getPendingRuns = async (): Promise<RunsPageDTO> => {
        const result = await runsRepo.findPending();
        return {
            runs: result.runs.map((run) => run.toDTO<RunDTO>()),
            pagination: result.pagination
        };
    };

    const updateRun = async ({
        runId,
        update
    }: {
        runId: RunIdDTO;
        update: UpdateRunDTO;
    }): Promise<RunDTO> => {
        const runVO = await runsRepo.findById({ runId });
        const updateRunVO = runVO.update({ update });
        await runsRepo.save({ input: updateRunVO });
        return updateRunVO.toDTO<RunDTO>();
    };

    const deleteRun = async ({
        runId
    }: {
        runId: RunIdDTO;
    }): Promise<RunDTO> => {
        const runVO = await runsRepo.findById({ runId });
        const removedRunVO = runVO.remove();
        await runsRepo.save({ input: removedRunVO });
        return runVO.toDTO<RunDTO>();
    };

    return Object.freeze({
        getRunById,
        getRunsByRunnerId,
        getRunsWithRunnerInfo,
        getPendingRuns,
        createRun,
        createRunsBatch,
        updateRun,
        deleteRun,
        createRunByPrivyId,
        createRunsBatchByPrivyId
    });
};
