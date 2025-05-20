import type {
    Run,
    UUIDv7,
    ISODate,
    RunRecord,
    RunWithRunner
} from '@phyt/types';

export interface RunVO extends Run {
    toDTO<T extends Run = Run>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): RunRecord;
    updateVerificationStatus(status: 'pending' | 'verified' | 'flagged'): RunVO;
    markAsPosted(): RunVO;
    runnerUsername?: string;
    runnerAvatarUrl?: string | null;
}

export const RunVO = (() => {
    const make = (record: RunRecord): RunVO => {
        const updateVerificationStatus = (
            status: 'pending' | 'verified' | 'flagged'
        ): RunVO => {
            return make({
                ...record,
                verificationStatus: status,
                updatedAt: new Date().toISOString() as ISODate
            });
        };

        const markAsPosted = (): RunVO => {
            return make({
                ...record,
                isPosted: true,
                updatedAt: new Date().toISOString() as ISODate
            });
        };

        const toDTO = <T extends Run = Run>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            const baseDTO = {
                id: record.id ?? ('' as UUIDv7),
                runnerId: record.runnerId,
                startTime: new Date(record.startTime),
                endTime: new Date(record.endTime),
                durationSeconds: record.durationSeconds,
                distance: record.distance,
                averagePaceSec: record.averagePaceSec,
                caloriesBurned: record.caloriesBurned,
                stepCount: record.stepCount,
                elevationGain: record.elevationGain,
                averageHeartRate: record.averageHeartRate,
                maxHeartRate: record.maxHeartRate,
                deviceId: record.deviceId,
                gpsRouteData: record.gpsRouteData,
                isPosted: record.isPosted,
                verificationStatus: record.verificationStatus,
                rawDataJson: record.rawDataJson,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(options ?? {})
            };

            const self = this as unknown as {
                runnerUsername?: string;
                runnerAvatarUrl?: string | null;
            };
            if (
                typeof self === 'object' &&
                'runnerUsername' in self &&
                'runnerAvatarUrl' in self
            ) {
                Object.assign(baseDTO, {
                    runnerUsername: self.runnerUsername,
                    runnerAvatarUrl: self.runnerAvatarUrl
                });
            }

            return baseDTO as T;
        };

        const toJSON = (): RunRecord => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            updateVerificationStatus,
            markAsPosted,
            toDTO,
            toJSON
        }) as RunVO;
    };

    return {
        create(data: {
            runnerId: UUIDv7;
            startTime: Date;
            endTime: Date;
            durationSeconds: number;
            distance: number;
            averagePaceSec?: number | null;
            caloriesBurned?: number | null;
            stepCount?: number | null;
            elevationGain?: number | null;
            averageHeartRate?: number | null;
            maxHeartRate?: number | null;
            deviceId?: string | null;
            gpsRouteData?: string | null;
            rawDataJson?: Record<string, unknown> | null;
        }): RunVO {
            return make({
                id: undefined,
                runnerId: data.runnerId,
                startTime: data.startTime.toISOString() as ISODate,
                endTime: data.endTime.toISOString() as ISODate,
                durationSeconds: data.durationSeconds,
                distance: data.distance,
                averagePaceSec: data.averagePaceSec ?? null,
                caloriesBurned: data.caloriesBurned ?? null,
                stepCount: data.stepCount ?? null,
                elevationGain: data.elevationGain ?? null,
                averageHeartRate: data.averageHeartRate ?? null,
                maxHeartRate: data.maxHeartRate ?? null,
                deviceId: data.deviceId ?? null,
                gpsRouteData: data.gpsRouteData ?? null,
                isPosted: false,
                verificationStatus: 'pending',
                rawDataJson: data.rawDataJson ?? null,
                createdAt: new Date().toISOString() as ISODate,
                updatedAt: new Date().toISOString() as ISODate
            });
        },

        fromRecord(record: RunRecord): RunVO {
            return make(record);
        },

        fromDTO(data: Run): RunVO {
            return make({
                id: data.id,
                runnerId: data.runnerId,
                startTime: (data.startTime instanceof Date
                    ? data.startTime.toISOString()
                    : data.startTime) as ISODate,
                endTime: (data.endTime instanceof Date
                    ? data.endTime.toISOString()
                    : data.endTime) as ISODate,
                durationSeconds: data.durationSeconds,
                distance: data.distance,
                averagePaceSec: data.averagePaceSec,
                caloriesBurned: data.caloriesBurned,
                stepCount: data.stepCount,
                elevationGain: data.elevationGain,
                averageHeartRate: data.averageHeartRate,
                maxHeartRate: data.maxHeartRate,
                deviceId: data.deviceId,
                gpsRouteData: data.gpsRouteData,
                isPosted: data.isPosted,
                verificationStatus: data.verificationStatus,
                rawDataJson: data.rawDataJson,
                createdAt: (data.createdAt instanceof Date
                    ? data.createdAt.toISOString()
                    : data.createdAt) as ISODate,
                updatedAt: (data.updatedAt instanceof Date
                    ? data.updatedAt.toISOString()
                    : data.updatedAt) as ISODate
            });
        },

        fromWithRunner(
            data:
                | RunWithRunner
                | (RunRecord & {
                      runnerUsername: string;
                      runnerAvatarUrl: string | null;
                  })
        ): RunVO {
            const runVO = make({
                id: data.id ?? ('' as UUIDv7),
                runnerId: data.runnerId,
                startTime: (data.startTime instanceof Date
                    ? data.startTime.toISOString()
                    : data.startTime) as ISODate,
                endTime: (data.endTime instanceof Date
                    ? data.endTime.toISOString()
                    : data.endTime) as ISODate,
                durationSeconds: data.durationSeconds,
                distance: data.distance,
                averagePaceSec: data.averagePaceSec,
                caloriesBurned: data.caloriesBurned,
                stepCount: data.stepCount,
                elevationGain: data.elevationGain,
                averageHeartRate: data.averageHeartRate,
                maxHeartRate: data.maxHeartRate,
                deviceId: data.deviceId,
                gpsRouteData: data.gpsRouteData,
                isPosted: data.isPosted,
                verificationStatus: data.verificationStatus,
                rawDataJson: data.rawDataJson,
                createdAt: (data.createdAt instanceof Date
                    ? data.createdAt.toISOString()
                    : data.createdAt) as ISODate,
                updatedAt: (data.updatedAt instanceof Date
                    ? data.updatedAt.toISOString()
                    : data.updatedAt) as ISODate
            });

            return Object.assign(runVO, {
                runnerUsername: data.runnerUsername,
                runnerAvatarUrl: data.runnerAvatarUrl
            });
        }
    };
})();
