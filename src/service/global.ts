import { FetchError } from "@/consts/erros";
import { X2jOptions, XMLParser } from "fast-xml-parser";

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

export const BLOCK_TYPE_KEY = "@_meta-name";
export const BLOCK_ID_KEY = "@_id";
export const BLOCK_DESC_KEY = "@_desc";
export const BLOCK_INFOS = [
    { key: BLOCK_ID_KEY, label: "id" },
    { key: BLOCK_DESC_KEY, label: "desc" },
    { key: "@_comment", label: "comment" },
    { key: BLOCK_TYPE_KEY, label: "meta-name" },
];

const dxmlParseOptions: X2jOptions = {
    ignoreAttributes: false,
    htmlEntities: true,
    isArray: (tagName, jPath) => {
        if (tagName == "block" || tagName == "choice") {
            return true;
        }
        return false;
    }
}

export const dxmlToObject = (dxml: string) => {
    const xmlParser = new XMLParser(dxmlParseOptions);
    return xmlParser.parse(dxml);
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

export interface InterfaceItems {
    fixedItems: InterfaceItem[],
    iterativeItems: InterfaceItem[]
}

export interface InterfaceInformation {
    interfaceCode: string;
    interfaceName: string;
    interfaceItems: InterfaceItems;
    updateDate?: string;
    updateTime?: string;
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
    blockID: string;
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

export interface JumpableBlockInfo {
    targetFlow: string;
    targetBlockID: string;
    targetBlockDescription: string;
}

export interface ReleaseServerInformation {
    releaseServerAlias: string;
    releaseServerURL: string;
}

export interface ReleaseJSON {
    releaseServerInfos: ReleaseServerInformation[]
}

export interface ReleaseMeta {
    releaseServerAlias: string;
    releaseDescription: string;
}

export interface FaultInformation {
    faultLevel: string;
    faultDescription: string;
}

export interface BlockFault {
    blockType: string;
    blockID: string;
    blockDescription: string;
    faultInfos: FaultInformation[];
}

export interface FlowFault {
    flowName: string;
    blockFaultList: BlockFault[];
}

export interface FaultReport {
    flowFaultList: FlowFault[];
    functionFaultList: FaultInformation[];
}