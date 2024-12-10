import { FetchError } from "@/consts/erros";
import { messageFromError, ResponseHandler } from "@/service/global";

export const parseScriptSource = async (scriptSource: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch("/api/ast", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/javascript"
            },
            body: scriptSource
        });

        const { status, statusText } = response;
        const contetntType = response.headers.get("Content-Type");
        if (contetntType?.includes("application/json")) {
            const json = await response.json();
            if (response.ok) {
                onOK(json);
            } else {
                const { code, message } = json;
                throw new FetchError(status, statusText, code, message);
            }
        } else {
            throw new FetchError(status, statusText, "ERROR", `Unsupported Content-Type: ${contetntType}`);
        }
    } catch (error: any) {
        onError(messageFromError(error));
    }
}