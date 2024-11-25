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

export interface ProjectInformation {
    projectID?: string; 
    workspaceName: string;
    projectName: string;
    projectDescription: string;
    designerVersion: string;
    createDate?: string;
    createTime?: string;
    updateDate?: string;
    updateTime?: string;
}

export interface FlowInformation {
    flowName: string;
    flowSource?: string;
    startFlow: boolean;
    flowTag: string;
    createDate?: string;
    createTime?: string;
    updateDate?: string;
    updateTime?: string;
}

export interface VariableInformation {
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

export interface InterfaceItem {
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

export interface InterfaceInformation {
    interfaceCode: string;
    interfaceName: string;
    interfaceItems: InterfaceItems;
    updateDate?: string;
    updateTime?: string;
}

export interface InterfaceItems {
    fixedItems: InterfaceItem[],
    iterativeItems: InterfaceItem[]
}

export interface InterfaceItemInfos {
    fixedItemInfos: InterfaceItem[],
    iterativeItemInfos: InterfaceItem[]
}

export interface InterfaceUpdateInfo {
    codeForUpdate: string;
    nameForUpdate: string;
    itemsForUpdate: InterfaceItemInfos
}

export interface ProjectJSON {
    projectInfo: ProjectInformation,
    flowInfos: FlowInformation[],
    variableInfos: VariableInformation[],
    functions: string,
    interfaceInfos: InterfaceInformation[]
}

export interface SearchItem {
    label?: string;
    contents: string;
}

export interface ScriptSearchResult extends SearchItem {
    line: number;
    start: number;
    end: number;
}

export interface BlockSearchResult {
    blockType: string;
    blockId: string;
    blockDescription: string;
    searchItems: SearchItem[]
}

export interface FlowSearchResult {
    flowName: string,
    blockSearchResults: BlockSearchResult[]
}

export interface SearchReport {
    flowSearchResults: FlowSearchResult[];
    functionSearchResults: ScriptSearchResult[];
    variableSearchResults: VariableInformation[];
    interfaceSearchResults: InterfaceInformation[];
}