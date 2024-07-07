import { FetchError } from "@/consts/erros";
import { ResponseHandler, messageFromError } from "./_fetch-utils";

interface AuthRequest {
    userName: string;
    password: string;
}

export const authWithPassword = async (body: AuthRequest, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;
    try {
        const response = await fetch("/api/auth-with-password", {
            method: "POST",
            cache: "no-cache",
            body: JSON.stringify(body)
        })
        
        const { status, statusText } = response;
        const contetntType = response.headers.get("Content-Type");
        if (contetntType?.includes("application/json")) {
            const json = await response.json();
            if (response.ok) {
                onOK();
            } else {
                const { code, message } = json;
                throw new FetchError(status, statusText, message);
            }
        } else {
            throw new FetchError(status, statusText, `Unsupported Content-Type: ${contetntType}`);
        }
    } catch(error: any) {
        onError(messageFromError(error));
    }
}

