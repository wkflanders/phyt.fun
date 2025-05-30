import { Pagination, UUIDv7 } from './core.js';

export interface Competition {
    id: UUIDv7;
    eventName: string;
    startTime: string;
    endTime: string;
    jackpot: string;
    distance: number | null;
    eventType: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface PaginatedCompetitions<T = Competition> {
    competitions: T[];
    pagination: Pagination;
}
