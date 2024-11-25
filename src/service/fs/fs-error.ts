export class FSError extends Error {
    code: string;
    constructor(message: string) {
        super(message);
        this.name = "FSError";
        this.code = "FSE99999";
    }
}
