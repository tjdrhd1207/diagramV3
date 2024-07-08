export const DBE00000 = "DBE00000";

export class DBError extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.name = "DBError";
    }
}

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ApplicationError";
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
    status: number
    statusText: string
    constructor(status: number, statusText: string, message: string) {
        super(message);
        this.name = "FetchError";
        this.status = status;
        this.statusText = statusText;
    }
}