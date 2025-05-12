export type UUIDv7 = string & { __uuidv7: true };

export type ISODate = string & { readonly __iso: true };

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
