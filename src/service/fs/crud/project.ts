import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { FlowInformation, ProjectInformation, ProjectJSON } from '@/service/global';
import { DefaultUserName, listdir, RepositoryDirectory } from '../fs-global';
import { createDummyFlowXML } from '@/consts/server-object';
import { logger } from '@/consts/logging';
import { FSError } from '../fs-error';

export const createProject = (projectInfo: ProjectInformation) => {
    const prefix = "createProject";
    const { projectID, workspaceName, projectName, projectDescription, designerVersion } = projectInfo;
    assert(projectID, "projectID is empty");
    assert(workspaceName, "workspaceName is empty");
    assert(projectName, "projectName is empty");
    assert(projectDescription !== undefined, "projectDescription should not be undefined");
    assert(designerVersion, "designerVersion is empty");

    try {
        logger.debug("FS transaction started", { prefix: prefix });
        
        const workingDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`workingDirectory: ${workingDirectory}`, { prefix: prefix });

        fs.mkdirSync(workingDirectory, { recursive: true });

        const projectJSON: ProjectJSON = {
            projectInfo,
            flowInfos: [
                { flowName: "ivrmain.dxml", flowTag: "", startFlow: true }
            ],
            variableInfos: [],
            functions: "",
            interfaceInfos: []
        }

        logger.debug(`projecJSON: ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        const projectFileName = ".project.json";
        const projectFilePath = path.join(workingDirectory, projectFileName);
        fs.writeFileSync(projectFilePath, JSON.stringify(projectJSON, null, 4));

        const ivrmainXMLFileName = "ivrmain.dxml";
        const ivrmainXMLFilePath = path.join(workingDirectory, ivrmainXMLFileName);
        fs.writeFileSync(ivrmainXMLFilePath, createDummyFlowXML());
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }
}

export const getProjectInfos = () => {
    const prefix = "getProjectInfos";

    let projectInfos: ProjectInformation[] = [];
    try {
        logger.debug("FS transaction started", { prefix: prefix });

        const workingDirectory = path.join(RepositoryDirectory, DefaultUserName);
        logger.debug(`workingDirectory: ${workingDirectory}`, { prefix: prefix });

        const dirs = listdir(workingDirectory);
        dirs.forEach((dir) => {
            const projectFilePath = path.join(workingDirectory, dir, ".project.json");
            const projectFile = fs.readFileSync(projectFilePath, "utf-8");

            const { projectInfo } = JSON.parse(projectFile);
            const { projectID, projectName, workspaceName, projectDescription, designerVersion} = projectInfo;

            projectInfos.push({
                projectID: projectID,
                projectName: projectName,
                workspaceName: workspaceName,
                projectDescription: projectDescription,
                designerVersion: designerVersion
            });
        });
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }

    return projectInfos;
}

export const deleteProject = (idForDelete: string) => {
    const prefix = "deleteProject";
    assert(idForDelete, "idForDelete is empty");

    try {
        logger.debug("FS transaction started", { prefix: prefix });
        logger.debug(`projectID: ${idForDelete}`, { prefix: prefix });

        const workingDirectory = path.join(RepositoryDirectory, DefaultUserName);
        logger.debug(`workingDirectory: ${workingDirectory}`, { prefix: prefix });

        const targetDirectory = path.join(workingDirectory, idForDelete);
        fs.rmSync(targetDirectory, { recursive: true, force: true });

    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }
}