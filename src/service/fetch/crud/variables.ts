import { ERR00000, FetchError } from "@/consts/erros";
import { ContentTypes, messageFromError, VariableInfo, ResponseHandler, UpdateVariableInfo } from "@/service/global"

export const createVariable = async (projectID: string, newVariableInfo: VariableInfo, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/variables?action=create`, { 
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newVariableInfo)
        });

        if (response.ok) {
            onOK();
        } else {
            const { status, statusText } = response;
            const contentType = response.headers.get("Content-Type");
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

export const getVariableInfos = async (projectID: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/variables`, { cache: "no-cache" });

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            if (contentType?.includes(ContentTypes.JSON)) {
                const json = await response.json();
                const { variableInfos } = json;
                onOK(variableInfos);
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

export const updateProjectVariable = async (projectID: string, variableAccessKey: string, variableName: string, 
    updateVariableInfo: UpdateVariableInfo, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/variables?` 
            + `action=update&accessKey=${variableAccessKey}&name=${variableName}`, { 
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateVariableInfo)
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

export const updateVariableName = async (projectID: string, variableAccessKey: string, variableName: string, 
    updateVariableInfo: UpdateVariableInfo, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/variables?` 
            + `action=update&accessKey=${variableAccessKey}&name=${variableName}&target=name`, { 
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateVariableInfo)
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

export const updateVariableInfo = async (projectID: string, variableAccessKey: string, variableName: string, 
    updateVariableInfo: UpdateVariableInfo, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/variables?` 
            + `action=update&accessKey=${variableAccessKey}&name=${variableName}&target=info`, { 
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateVariableInfo)
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

export const deleteVariable = async (projectID: string, variableAccessKey: string, variableName: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/variables?` 
            + `action=delete&accessKey=${variableAccessKey}&name=${variableName}`, { 
            method: "POST",
            cache: "no-cache"
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