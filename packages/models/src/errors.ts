export class DatabaseError extends Error {
    statusCode: number;
    constructor(
        message: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'DATABASE_ERROR';
        this.statusCode = 512;
    }
}

export class NotFoundError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'NOTFOUND_ERROR';
        this.statusCode = 404;
    }
}

export class DuplicateError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'DUPLICATE_ERROR';
        this.statusCode = 422;
    }
}

export class InputError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'INPUT_ERROR';
        this.statusCode = 400;
    }
}

export class ValidationError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'VALIDATION_ERROR';
        this.statusCode = 400;
    }
}

export class RequestError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'REQUEST_ERROR';
        this.statusCode = 400;
    }
}

export class AuthenticationError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'AUTHENTICATION_ERROR';
        this.statusCode = 401;
    }
}

export class PermissionError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = 'FORBIDDEN_ERROR';
        this.statusCode = 403;
    }
}

export class PackPurchaseError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'PACKPURCHASE_ERROR';
    }
}

export class MarketplaceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'MARKETPLACE_ERROR';
    }
}
