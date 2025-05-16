export type UUIDv7 = string & { __uuidv7: true };

export type ISODate = string & { readonly __iso: true };

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
