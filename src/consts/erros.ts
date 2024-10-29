export const PRE00000 = "PRE00000";
export const PRE00001 = "PRE00001";
export const PRE00002 = "PRE00002";
export const PRE00003 = "PRE00003";
export const ERR00000 = "ERR00000";

export class DBError extends Error {
    code: string;
    constructor(message: string) {
        super(message);
        this.name = "DBError";
        this.code = "DBE99999";
    }
}

export class DBConnectionError extends DBError {
    constructor(message: string) {
        super(message);
        this.name = "DBConnectionError";
        this.code = "DBE00000";
    }
}

export class DBTransactionError extends DBError {
    constructor(message: string) {
        super(message);
        this.name = "DBTransactionError";
        this.code = "DBE00001";
    }
}

export class ApplicationError extends Error {
    code: string;
    constructor(message: string) {
        super(message);
        this.name = "ApplicationError";
        this.code = "APE99999";
    }
}

export class URLParamError extends ApplicationError {
    constructor(message: string) {
        super(message);
        this.name = "URLParamError";
        this.code = "APE10000";
    }
}

export class ContentTypeError extends ApplicationError {
    constructor(message: string) {
        super(message);
        this.name = "ContentTypeError";
        this.code = "APE20000";
    }
}

export class IncorrectBodyError extends ApplicationError {
    constructor(message: string) {
        super(message);
        this.name = "IncorrectBodyError";
        this.code = "APE30000";
    }
}

export class APIError extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.name = "APIError";
    }
}

export class FetchError extends Error {
    status: number;
    statusText: string;
    code: string;
    constructor(status: number, statusText: string, code: string, message: string) {
        super(message);
        this.name = "FetchError";
        this.status = status;
        this.statusText = statusText;
        this.code = code;
    }
}