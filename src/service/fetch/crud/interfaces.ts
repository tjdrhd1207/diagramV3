import { ERR00000, FetchError } from "@/consts/erros";
import { ContentTypes, InterfaceInfo, InterfaceItems, messageFromError, ResponseHandler } from "@/service/global";

export const createInterfaceCode = async (projectID: string, newInterfaceInfo: InterfaceInfo, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/interfaces?action=create`,
            { 
                method: "POST",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newInterfaceInfo)
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

export const getInterfaceInfos = async (projectID: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/interfaces`, { cache: "no-cache" });

        const { status, statusText } = response;
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            if (contentType?.includes(ContentTypes.JSON)) {
                const json = await response.json();
                const { interfaceInfos } = json;
                onOK(interfaceInfos);
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

export const updateInterfaceCode = async (projectID: string, interfaceCode: string, codeForUpdate: string ,handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/interfaces?action=update&code=${interfaceCode}&target=info`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ codeForUpdate: codeForUpdate })
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

export const updateInterfaceName = async (projectID: string, interfaceCode: string, nameForUpdate: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/interfaces?action=update&code=${interfaceCode}&target=info`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nameForUpdate: nameForUpdate })
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

export const updateInterfaceItems = async (projectID: string, interfaceCode: string, interfaceItems: InterfaceItems, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/interfaces?action=update&code=${interfaceCode}&target=items`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ itemsForUpdate: interfaceItems })
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

export const deleteInterfaceInfo = async (projectID: string, interfaceCode: string, handlers: ResponseHandler) => {
    const { onOK, onError } = handlers;

    try {
        const response = await fetch(`/api/project/${projectID}/interfaces?action=delete&code=${interfaceCode}`, {
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