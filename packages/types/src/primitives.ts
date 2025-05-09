export type UUIDv7 = string & { __uuidv7: true };

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
