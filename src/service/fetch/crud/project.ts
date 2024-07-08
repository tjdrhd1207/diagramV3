import { FetchError } from "@/consts/erros";
import { messageFromError, ResponseHandler } from "../../_common";

interface CreateProjectReqeust {
    workspaceName: string;
    projectName: string;
    projectDescription: string;
}

export const createProject = async (body: CreateProjectReqeust, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;
    try {
        const response = await fetch("/api/project?action=create", {
            method: "POST",
            cache: "no-cache",
            body: JSON.stringify(body)
        })

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (contentType?.includes("application/json")) {
            const json = await response.json();
            if (response.ok) {
                onOK(json);
            } else {
                const { code, message } = json;
                throw new FetchError(status, statusText, message);
            }
        } else {
            onError(`Unsupported Content-Type: ${contentType}`);
        }
    } catch (error: any) {
        onError(messageFromError(error));
    }
}

export const getProjectInfoList = async (handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;
    try {
        const response = await fetch("/api/project", {
            cache: "no-cache"
        });

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (contentType?.includes("application/json")) {
            const json = await response.json();
            if (response.ok) {
                onOK(json);
            } else {
                const { code, message } = json;
                throw new FetchError(status, statusText, message);
            }
        } else {
            onError(`Unsupported Content-Type: ${contentType}`);
        }
    } catch (error: any) {
        onError(messageFromError(error));
    }
}