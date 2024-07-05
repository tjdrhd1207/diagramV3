import { FetchError } from "@/consts/erros";

export interface ResponseHandler {
    onOK: (data?: object) => void;
    onError: (message: string) => void;
}

export const messageFromError = (error: Error) => {
    let message;

    if (error instanceof FetchError) {
        const { status, statusText, message: errorMessage } = error;
        message = `(${status}) ${statusText} - ${errorMessage}`;
    } else {
        message = `${error.name}: ${error.message}`;
    }

    return message;
}
