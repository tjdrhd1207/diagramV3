import fs from 'fs';
import { logger } from "@/consts/logging";
import assert from "assert";
import { ReleaseError } from "../fs-error";
import path from "path";
import { DefaultUserName, OutputDirectory, RepositoryDirectory } from "../fs-global";
import { ProjectJSON, ReleaseJSON } from '@/service/global';
import { XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';
import FormData from 'form-data';
import fetch from 'node-fetch';

interface __page {
    "@_name": string;
    "@_start": string | null;
}

interface __pages {
    page: __page[]
}

interface __variable {
    type: string;
    name: string;
    "init-value": string;
}

interface __variables {
    "@_key": string;
    variable: __variable[]
}

interface __message_variable {
    mode: string;
    type: string;
    value: string;
    sort: string;
    replace: string;
    position: number;
    length: number;
    description: string
}

interface __message {
    code: string;
    name: string;
    "variable-fixed": __message_variable[] | string;
    "variables-iterative": __message_variable[] | string;
}

interface __interface {
    "use-trim": boolean
    message: __message[]
}

interface ProjectXML {
    scenario: {
        "scenario-pages": __pages;
        variables: __variables;
        functions: string;
        interface: __interface;
    }
}

export const buildProject = (projectID: string) => {
    const prefix = "buildProject";
    assert(projectID, "projectID is empty");
    
    try {
        logger.debug("FS transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        const workingDirectory = path.join(RepositoryDirectory, DefaultUserName);
        logger.debug(`workingDirectory: ${workingDirectory}`, { prefix: prefix });

        const projectDirectory = path.join(workingDirectory, projectID);
        const projectJSONFilePath = path.join(projectDirectory, ".project.json");
        const projectJSONFile = fs.readFileSync(projectJSONFilePath, "utf-8");
        const projectJSON = JSON.parse(projectJSONFile) as ProjectJSON;

        const { projectInfo, flowInfos, variableInfos, functions, interfaceInfos } = projectJSON;

        const projectXML: ProjectXML = {
            scenario: {
                "scenario-pages": {
                    page: flowInfos.map(({ flowName, startFlow }) => 
                    ({ "@_name": flowName, "@_start": startFlow? "True" : null }))
                },
                variables: {
                    "@_key": "app",
                    variable: variableInfos.map(({ variableType, variableName, defaultValue }) => 
                        ({ type: variableType, name: variableName, "init-value": defaultValue }))
                },
                functions,
                interface: {
                    "use-trim": false,
                    message: interfaceInfos.map(({ interfaceCode, interfaceName, interfaceItems }) => ({
                        code: interfaceCode, name: interfaceName,
                        "variable-fixed": interfaceItems.fixedItems.map(({
                            transferType, assignType, assignValue, itemSort, itemReplace, itemPosition, itemLength, itemDescription
                        }) => ({
                            mode: transferType, type: assignType, value: assignValue,
                            sort: itemSort, replace: itemReplace, position: itemPosition, length: itemLength,
                            description: itemDescription
                        } as __message_variable)),
                        "variables-iterative": []
                    }))
                }

            }
        };

        const options: XmlBuilderOptions = {
            ignoreAttributes : false,
            format: true,
            cdataPropName: "functions",
            suppressEmptyNode: true
        };
        
        const builder = new XMLBuilder(options);
        let xmlString = builder.build(projectXML);
        
        const outputDirectory = path.join(projectDirectory, OutputDirectory);

        if (fs.existsSync(outputDirectory)) {
            fs.rmSync(outputDirectory, { recursive: true, force: true });
            logger.debug("Remove old output files", { prefix: prefix });
        }

        fs.mkdirSync(outputDirectory);
        
        const projectXMLFileName = `${projectInfo.projectName}.xml`;
        const projectXMLFilePath = path.join(outputDirectory, projectXMLFileName);

        fs.writeFileSync(projectXMLFilePath, xmlString);
        logger.debug(`Project XML File created(path: ${projectXMLFilePath})`, { prefix: prefix });
        flowInfos.forEach(({ flowName }) => {
            const sourcePath = path.join(projectDirectory, flowName);
            const destinationPath = path.join(outputDirectory, flowName);
            fs.copyFileSync(sourcePath, destinationPath);
            logger.debug(`Flow File copyed(path: ${destinationPath})`, { prefix: prefix });
        });

    } catch (error: any) {
        throw new ReleaseError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }
}

export const releaseProject = async (projectID: string, releaseServerAlias: string, releaseDescription: string) => {
    const prefix = "releaseProject";
    assert(projectID, "projectID is empty");

    let deployKey: string | undefined = undefined;

    try {
        logger.debug("FS transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`releaseServerAlias: ${releaseServerAlias}`, { prefix: prefix });
        logger.debug(`releaseDescription: ${releaseDescription}`, { prefix: prefix });

        const workingDirectory = path.join(RepositoryDirectory, DefaultUserName);
        logger.debug(`workingDirectory: ${workingDirectory}`, { prefix: prefix });

        const releaseJSONFilePath = path.join(workingDirectory, "release.json");
        logger.debug(`releaseJSONFilePath: ${releaseJSONFilePath}`, { prefix: prefix });

        if (!fs.existsSync(releaseJSONFilePath)) {
            throw new ReleaseError(`releaseJSONFile(path: ${releaseJSONFilePath}) NOT exists`);
        }

        const releaseJSONFile = fs.readFileSync(releaseJSONFilePath, "utf-8");
        const releaseJSON = JSON.parse(releaseJSONFile) as ReleaseJSON;
        const { releaseServerInfos } = releaseJSON;

        const releaseServerInfo = releaseServerInfos.find((info) => info.releaseServerAlias === releaseServerAlias);
        if (!releaseServerInfo) {
            throw new ReleaseError(`releaseServerInfo(alias : ${releaseServerAlias}) NOT founded`);
        }

        const projectDirectory = path.join(workingDirectory, projectID);
        const projectJSONFilePath = path.join(projectDirectory, ".project.json");
        const projectJSONFile = fs.readFileSync(projectJSONFilePath, "utf-8");
        const projectJSON = JSON.parse(projectJSONFile) as ProjectJSON;

        const { projectInfo } = projectJSON;

        const outputDirectory = path.join(projectDirectory, OutputDirectory);
        logger.debug(`outputDirectory: ${outputDirectory}`, { prefix: prefix });

        if (!fs.existsSync(outputDirectory)) {
            throw new ReleaseError(`outputDirectory(path: ${outputDirectory}) NOT exists`);
        }

        const formData = new FormData();
        formData.append("projectName", projectInfo.projectName);
        formData.append("scenarioDescription", releaseDescription);

        const files = fs.readdirSync(outputDirectory);
        files.forEach((file) => {
            const filePath = path.join(outputDirectory, file);
            formData.append("file", fs.createReadStream(filePath), file);
        });

        const response = await fetch(releaseServerInfo.releaseServerURL, {
            method: "POST",
            headers: formData.getHeaders(),
            body: formData
        });

        if (response.ok) {
            const json = await response.json() as any;
            logger.info(`Deploy Response: ${JSON.stringify(json)})`, { prefix: prefix });

            const { result, scenarioKey, error } = json;
            if (!result) {
                throw new ReleaseError(error);
            } else {
                deployKey = scenarioKey;
            }
        } else {
            throw new ReleaseError(`${response.status} ${response.statusText}`);
        }
    } catch (error: any) {
        throw new ReleaseError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }

    return deployKey;
}