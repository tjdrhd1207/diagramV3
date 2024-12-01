import { FlowInformation, InterfaceInformation, VariableInformation, FlowSearchResult, BlockSearchResult, SearchItem, ScriptSearchResult, JumpableBlockInfo, dxmlToObject, blockDescriptionKey, blockIDKey, blockInfos, blockTypeKey } from "../global";

export const searchFromFlows = (keyword: string, flowInfos: FlowInformation[], meta: any) => {
    const result: FlowSearchResult[] = [];

    const { nodes } = meta;

    flowInfos.forEach((info) => {
        const { flowName, flowSource } = info;
        if (flowSource) {
            const flowObject = dxmlToObject(flowSource);
            const blocks = flowObject?.scenario?.block;
            
            if (blocks) {
                const blockSearchResults: BlockSearchResult[] = [];
                blocks.forEach((block: any) => {
                    const blockType = block[blockTypeKey];
                    const blockID = block[blockIDKey];
                    const blockDescription = block[blockDescriptionKey];

                    const searchItems: SearchItem[] = [];
                    const searchResult: BlockSearchResult = { blockType, blockID, blockDescription, searchItems };

                    blockInfos.forEach((info) => {
                        const { key, label } = info;
                        const contents = block[key];
                        if (contents.includes(keyword)) {
                            searchItems.push({ label, contents });
                        }
                    });

                    const { buildTag, properties } = nodes[blockType];
                    if (buildTag && Array.isArray(properties)) {
                        const blockAttributes = block[buildTag];
                        properties.forEach((property: any) => {
                            const { displayName: label, searchTarget, buildName } = property;
                            if (searchTarget) {
                                const contents = blockAttributes[buildName];
                                if (contents.includes(keyword)) {
                                    searchItems.push({ label, contents });
                                }
                            }
                        });
                    }

                    if (searchItems.length > 0) {
                        blockSearchResults.push(searchResult);
                    }
                });

                if (blockSearchResults.length > 0) {
                    result.push({ flowName, blockSearchResults });
                }
            }
        }
    });

    return result;
}

export const getJumpableBlockInfos = (flowInfos: FlowInformation[], meta: any) => {
    const result: JumpableBlockInfo[] = [];

    const { nodes } = meta;

    flowInfos.forEach((info) => {
        const { flowName, flowSource } = info;
        if (flowSource) {
            const flowObject = dxmlToObject(flowSource);
            const blocks = flowObject?.scenario?.block;

            if (blocks) {
                blocks.forEach((block: any) => {
                    const blockType = block[blockTypeKey];
                    const blockID = block[blockIDKey];
                    const blockDescription = block[blockDescriptionKey];
                    const { isJumpable } = nodes[blockType];
    
                    if (isJumpable) {
                        result.push({ targetFlow: flowName, targetBlockID: blockID, targetBlockDescription: blockDescription });
                    }
                });
            }
        }
    });

    return result;
}

export const searchFromFunctions = (keyword: string, scriptSource: string) => {
    const result: ScriptSearchResult[] = [];

    const lines = scriptSource.split(/\r\n|\r|\n/);

    if (lines.length > 0) {
        lines.forEach((line, index, array) => {
            if (line.includes(keyword)) {
                const start = line.indexOf(keyword);
                result.push({ contents: line, line: index + 1, start, end: keyword.length });
            }
        });
    }

    return result;
}

export const searchFromVariables = (keyword: string, variableInfos: VariableInformation[]) => {
    return variableInfos.filter(({ variableName, variableDescription }) => 
        variableName.includes(keyword) || variableDescription.includes(keyword));
}

export const searchFromInterfaces = (keyword: string, interfaceInfos: InterfaceInformation[]) => {
    return interfaceInfos.filter(({ interfaceCode, interfaceName, interfaceItems }) => {
        if (interfaceCode.includes(keyword) || interfaceName.includes(keyword)) {
            return true;
        }

        const { fixedItems, iterativeItems } = interfaceItems;
        if (fixedItems.find(({ assignValue, itemDescription }) => assignValue.includes(keyword) || itemDescription.includes(keyword))) {
            return true;
        }

        if (iterativeItems.find(({ assignValue, itemDescription }) => assignValue.includes(keyword) || itemDescription.includes(keyword))) {
            return true;
        }

        return false;
    });
}