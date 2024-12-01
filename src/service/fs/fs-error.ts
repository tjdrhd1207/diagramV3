export class FSError extends Error {
    code: string;
    constructor(message: string) {
        super(message);
        this.name = "FSError";
        this.code = "FSE99999";
    }
}

export class ReleaseError extends FSError {
    constructor(message: string) {
        super(message);
        this.name = "ReleaseError";
        this.code = "DPE99999";
    }
}