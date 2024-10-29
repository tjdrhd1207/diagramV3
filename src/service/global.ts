import { FetchError } from "@/consts/erros";

export const ContentTypes = {
    JSON: "application/json",
    XML: "application/xml",
    JS: "application/javascript"
}

export interface ResponseHandler {
    onOK: (data?: any) => void;
    onError: (message: string) => void;
}

export const messageFromError = (error: Error) => {
    let message;

    if (error instanceof FetchError) {
        const { status, statusText, code, message: errorMessage } = error;
        message = `(${status}) ${statusText} - [${code}] ${errorMessage}`;
    } else {
        message = `${error.name}: ${error.message}`;
    }

    return message;
}

export interface VariableInfo {
    variableAccessKey: string;
    variableType: string;
    variableName: string;
    defaultValue: string;
    variableDescription: string;
    createDate?: string;
    createTime?: string;
    updateDate?: string;
    updateTime?: string;
}

export interface UpdateVariableInfo {
    typeForUpdate?: string;
    nameForUpdate?: string;
    defaultForUpdate?: string;
    descriptionForUpdate?: string;
}

export interface DeleteVariableInfo {
    variableAccessKey: string;
    variableName: string;
}

export interface InterfaceItemInfo {
    itemIndex: number;
    transferType: string;
    assignType: string;
    assignValue: string;
    itemPosition: number;
    itemLength: number;
    itemSort: string;
    itemReplace: string;
    itemDescription: string;
}

export interface InterfaceItems {
    fixedItems: InterfaceItemInfo[],
    iterativeItems: InterfaceItemInfo[]
}

export interface InterfaceInfo {
    interfaceCode: string;
    interfaceName: string;
    interfaceItems: InterfaceItems;
    updateDate?: string;
    updateTime?: string;
}

export interface InterfaceItemInfos {
    fixedItemInfos: InterfaceItemInfo[],
    iterativeItemInfos: InterfaceItemInfo[]
}

export interface InterfaceUpdateInfo {
    codeForUpdate: string;
    nameForUpdate: string;
    itemsForUpdate: InterfaceItemInfos
}