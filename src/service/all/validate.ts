import { AssignmentExpression, ExpressionStatement, MemberExpression, ModuleDeclaration, Node, Program, Statement } from "acorn";
import { BLOCK_DESC_KEY, BlockFault, BLOCK_ID_KEY, BLOCK_TYPE_KEY, dxmlToObject, FaultInformation, FlowFault, FlowInformation, VariableInformation } from "../global"

export const validateFlows = (flowInfos: FlowInformation[], meta: any) => {
    const result: FlowFault[] = [];
    const { nodes } = meta;

    flowInfos.forEach(({ flowName, flowSource }) => {
        if (flowSource) {
            const flowObject = dxmlToObject(flowSource);
            const blocks = flowObject?.scenario?.block;

            if (blocks) {
                const blockFaultList: BlockFault[] = [];
                blocks.forEach((block: any) => {
                    const blockType = block[BLOCK_TYPE_KEY];
                    const blockID = block[BLOCK_ID_KEY];
                    const blockDescription = block[BLOCK_DESC_KEY];

                    const faultInfos: FaultInformation[] = [];
                    const blockFault: BlockFault = { blockType, blockID, blockDescription, faultInfos };

                    const { buildTag, properties, links } = nodes[blockType];
                    if (buildTag && Array.isArray(properties)) {
                        const blockAttributes = block[buildTag];
                        properties.forEach((property: any) => {
                            const { displayName, required, buildName } = property;
                            if (required) {
                                const contents = blockAttributes[buildName];

                                if (buildName == "source") {
                                    if (contents == "") {
                                        faultInfos.push({ faultLevel: "WARN", faultDescription: `Property "${displayName}" is empty` });
                                    }
                                } else {
                                    if (!contents) {
                                        faultInfos.push({ faultLevel: "ERROR", faultDescription: `Property "${displayName}" is required` });
                                    }
                                }
                            }
                        });
                    }

                    if (Array.isArray(links)) {
                        const { choice: blockChoices } = block;
                        links.forEach((link: any) =>{
                            const { name, required } = link;
                            if (required) {
                                let found;
                                if (Array.isArray(blockChoices)) {
                                    found = blockChoices.find((blockChoice: any) => blockChoice.event == name)
                                }
                                
                                if (!found) {
                                    faultInfos.push({ faultLevel: "ERROR", faultDescription: `Link "${name}" is required` })
                                }
                            } 
                        });
                    }

                    if (faultInfos.length > 0) {
                        blockFaultList.push(blockFault);
                    }
                });

                if (blockFaultList.length > 0) {
                    result.push({ flowName, blockFaultList });
                }
            }
        }
    });

    return result;
}

const searchJSFault = (node: Node | Node[] | null, result: FaultInformation[], variableInfos: VariableInformation[]) => {
    if (node === null) {
        return;
    }

    if (Array.isArray(node)) {
        node.forEach((subNode) => {
            searchJSFault(subNode, result, variableInfos);
        });
    } else {
        const { type } = node;
        if (type === "ExpressionStatement") {
            const { expression } = node as ExpressionStatement;
            searchJSFault(expression, result, variableInfos);
        }

        if (type === "AssignmentExpression") {
            const { left, right } = node as AssignmentExpression;
            if (left.type === "MemberExpression") {
                const { object, property, loc } = left as MemberExpression;
                if (object.type === "Identifier" && property.type === "Identifier") {
                    if (!variableInfos.some(({ variableAccessKey, variableName }) =>
                        variableAccessKey == object.name && variableName == property.name)) {
                        result.push({ faultLevel: "ERROR", faultDescription: `Cannot find Variable ${object.name}.${property.name}` });
                    }
                }
            }

            if (right.type === "MemberExpression") {

            }
        }
    }
}

export const validateScript = (program: Program, variableInfos: VariableInformation[]) => {
    const { body } = program;
    const result: FaultInformation[] = [];
    console.log("validateScript");
    searchJSFault(body, result, variableInfos);

    return result;
}