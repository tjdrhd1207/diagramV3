import { FetchError, ERR00000 } from "@/consts/erros";
import { ResponseHandler, ContentTypes, messageFromError, FlowInformation } from "@/service/global";

export const createFlow = async (projectID: string, flowInfo: FlowInformation, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/flows?action=create`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(flowInfo)
        });

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            onOK();
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

export const getFlowInfos = async (projectID: string, includeXML: boolean, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/flows?includeXML=${includeXML}`, { cache: "no-cache" });

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            if (contentType?.includes(ContentTypes.JSON)) {
                const json = await response.json();
                const { flowInfos } = json;
                onOK(flowInfos);
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