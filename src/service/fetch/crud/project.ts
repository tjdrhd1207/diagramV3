"use client"

import { ERR00000, FetchError, PRE00000, PRE00001 } from "@/consts/erros";
import { ContentTypes, messageFromError, ResponseHandler } from "../../global";

interface CreateProjectInfo {
    workspaceName: string;
    projectName: string;
    projectDescription: string;
}

export const createProject = async (body: CreateProjectInfo, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch("/api/project?action=create", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            if (contentType?.includes(ContentTypes.JSON)) {
                const json = await response.json();
                const { projectID } = json;
                if (projectID) {
                    onOK(projectID);
                } else {
                    onError(`Invalid Prject ID: ${projectID}`);
                }
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

export const getProjectInfos = async (handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch("/api/project", { cache: "no-cache" });

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

export const getProjectInfoByID = async (projectID: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}?action=details`, { cache: "no-cache" });

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

export const getProjectByZip = async (projectID: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;
}

interface AttributesForUpdate {
    projectName: string;
    projectDescription: string;
}

export const updateProjectInfo = async (projectID: string, attributes: AttributesForUpdate, handlers: ResponseHandler) => {

}

export const deleteProject = async (projectID: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}?action=delete`, { method: "POST", cache: "no-cache" });

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
                throw new FetchError(status, statusText, ERR00000, `Invalid Content-Type: ${contentType}`)
            }
        }
    } catch (error: any) {
        onError(messageFromError(error));
    }
}

interface CreateFlowInfo {
    flowName: string;
    flowTag: string;
}

export const createFlow = async (projectID: string, body: CreateFlowInfo, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/flows?action=create`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
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

export const getFlowNames = async (projectID: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/flows`, { cache: "no-cache" });

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

export const getFlowContents = async (projectID: string, flowName: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/flows/${flowName}`, { cache: "no-cache" });

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            if (contentType?.includes(ContentTypes.XML)) {
                const xml = await response.text();
                onOK(xml);
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

export const updateFlowContents = async (projectID: string, flowName: string, contents: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/flows/${flowName}?action=update&target=contents`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/xml"
            },
            body: contents
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
                throw new FetchError(status, statusText, ERR00000, `Invalid Content-Type: ${contentType}`)
            }
        }
    } catch (error: any) {
        onError(messageFromError(error));
    }
}

export const deleteFlow = async (projectID: string, flowName: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;
    
    try {
        const response = await fetch(`/api/project/${projectID}/flows/${flowName}?action=delete`, { method: "POST", cache: "no-cache" });

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
                throw new FetchError(status, statusText, ERR00000, `Invalid Content-Type: ${contentType}`)
            }
        }
    } catch (error: any) {
        onError(messageFromError(error));
    }
}