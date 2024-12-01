import { ERR00000, FetchError } from "@/consts/erros";
import { ContentTypes, messageFromError, ReleaseMeta, ResponseHandler } from "@/service/global";

export const releaseProject = async (projectID: string, releaseServerAlias: string, releaseDescription: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const releaseMeta: ReleaseMeta = { releaseServerAlias, releaseDescription };
        const response = await fetch(`/api/project?action=release&id=${projectID}`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(releaseMeta)
        });

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            if (contentType?.includes(ContentTypes.JSON)) {
                const json = await response.json();
                onOK(json);
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