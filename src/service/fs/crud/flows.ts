import fs from 'fs';
import path from "path";
import { FlowInformation, ProjectJSON } from "@/service/global";
import assert from "assert";
import { RepositoryDirectory, DefaultUserName } from "../fs-global";
import { FSError } from '../fs-error';
import { logger } from '@/consts/logging';
import { createDummyFlowXML } from '@/consts/server-object';

export const createFlow = (projectID: string, flowName: string, flowTag?: string ) => {
    const prefix = "createFlow";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");
    assert(RepositoryDirectory, "RepositoryDirectory is empty");
    assert(DefaultUserName, "DefaultUserName is empty");

    const flowContents: string = createDummyFlowXML();

    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });
        
        const flowFilePath = path.join(projectDirectory, flowName);
        logger.debug(`flowFilePath: ${flowFilePath}`, { prefix: prefix });
        fs.writeFileSync(flowFilePath, createDummyFlowXML());

        const projectFilePath = path.join(projectDirectory, ".project.json");
        const projectFile = fs.readFileSync(projectFilePath, "utf-8");
        const projectJSON = JSON.parse(projectFile) as ProjectJSON;
        logger.debug(`projectJSON(old): ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        projectJSON.flowInfos.push({ flowName, flowTag: flowTag? flowTag : "", startFlow : false });
        logger.debug(`projectJSON(new): ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        fs.writeFileSync(projectFilePath, JSON.stringify(projectJSON, null, 4));
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug(`flowContents: ${flowContents}`, { prefix: prefix });
        logger.debug("FS transaction terminated", { prefix: prefix });
    }

    return flowContents;
}

export const getFlowInfos = (projectID: string) => {
    const prefix = "getFlowInfos";
    assert(projectID, "projectID is empty");
    assert(RepositoryDirectory, "RepositoryDirectory is empty");
    assert(DefaultUserName, "DefaultUserName is empty");

    let result: FlowInformation[] = [];
    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });

        const projectFilePath = path.join(projectDirectory, ".project.json");
        const projectFile = fs.readFileSync(projectFilePath, "utf-8");
        const projectJSON = JSON.parse(projectFile) as ProjectJSON;
        logger.debug(`projectJSON: ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        const { flowInfos } = projectJSON;
        if (flowInfos) {
            result = flowInfos;
        }
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug(`flowInfos: ${JSON.stringify(result)}`, { prefix: prefix });
        logger.debug("FS transaction terminated", { prefix: prefix });
    }

    return result
}

export const getFlowContents = (projectID: string, flowName: string) => {
    const prefix = "getFlowContents";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");
    assert(RepositoryDirectory, "RepositoryDirectory is empty");
    assert(DefaultUserName, "DefaultUserName is empty");

    let flowContents: string = "";
    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });

        const flowFilePath = path.join(projectDirectory, flowName);
        flowContents = fs.readFileSync(flowFilePath, "utf-8");

    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug(`flowContents: ${flowContents}`, { prefix: prefix });
        logger.debug("FS transaction terminated", { prefix: prefix });
    }

    return flowContents;
}

export const updateFlowName = (projectID: string, flowName: string, nameForUpdate: string) => {
    const prefix = "updateFlowContents";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");
    assert(nameForUpdate, "nameForUpdate is empty");
    assert(RepositoryDirectory, "RepositoryDirectory is empty");
    assert(DefaultUserName, "DefaultUserName is empty");

    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });

        const projectFilePath = path.join(projectDirectory, ".project.json");
        const projectFile = fs.readFileSync(projectFilePath, "utf-8");
        const projectJSON = JSON.parse(projectFile) as ProjectJSON;
        logger.debug(`projectJSON(old): ${JSON.stringify(projectJSON)}`, { prefix: prefix });
        
        projectJSON.flowInfos = projectJSON.flowInfos.map((info) => {
            if (info.flowName === flowName) {
                return { ...info, flowName: nameForUpdate };
            } else {
                return info;
            }
        });
        logger.debug(`projectJSON(new): ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        fs.writeFileSync(projectFilePath, JSON.stringify(projectJSON, null, 4));
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }
}

export const updateFlowContents = (projectID: string, flowName: string, flowContents: string) => {
    const prefix = "updateFlowContents";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");
    assert(flowContents !== undefined, "flowContents should not be undefined");
    assert(RepositoryDirectory, "RepositoryDirectory is empty");
    assert(DefaultUserName, "DefaultUserName is empty");

    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });

        const flowFilePath = path.join(projectDirectory, flowName);
        logger.debug(`flowFilePath: ${flowFilePath}`, { prefix: prefix });

        fs.writeFileSync(flowFilePath, flowContents);
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }
}

export const deleteFlow = (projectID: string, flowName: string) => {
    const prefix = "getFlowContents";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");
    assert(RepositoryDirectory, "RepositoryDirectory is empty");
    assert(DefaultUserName, "DefaultUserName is empty");

    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });

        const pathForDelete = path.join(projectDirectory, flowName);
        fs.rmSync(pathForDelete, { force: true });

        const projectFilePath = path.join(projectDirectory, ".project.json");
        const projectFile = fs.readFileSync(projectFilePath, "utf-8");
        const projectJSON = JSON.parse(projectFile) as ProjectJSON;
        logger.debug(`projectJSON(old): ${JSON.stringify(projectJSON)}`, { prefix: prefix });
        
        projectJSON.flowInfos = projectJSON.flowInfos.filter((info) => info.flowName !== flowName);
        logger.debug(`projectJSON(new): ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        fs.writeFileSync(projectFilePath, JSON.stringify(projectJSON, null, 4));
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }
}