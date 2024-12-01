import { ERR00000, FetchError } from "@/consts/erros";
import { ContentTypes, messageFromError, ResponseHandler } from "@/service/global";

export const getReleaseServerInfos = async (handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch("/api/release", { cache: "no-cache" });

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            if (contentType?.includes(ContentTypes.JSON)) {
                const json = await response.json() as any;
                const { releaseServerInfos } = json;
                onOK(releaseServerInfos);
            } else {
                throw new FetchError(status, statusText, ERR00000, `Invalid Content-Type: ${contentType}`);
            }
        } else {
            if (contentType?.includes(ContentTypes.JSON)) {
                const json = await response.json();
                const { code, message } = json;
                throw new FetchError(status, statusText, code, message);
            } else {
                throw new FetchError(status, statusText, ERR00000, `Invalid Content-Type: ${contentType}`);
            }
        }
    } catch (error: any) {
        onError(messageFromError(error));
    }
}