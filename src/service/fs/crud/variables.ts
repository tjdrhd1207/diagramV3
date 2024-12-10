import fs from 'fs';
import path from "path";
import assert from "assert";
import { logger } from '@/consts/logging';
import { FSError } from '../fs-error';
import { DefaultUserName, RepositoryDirectory } from '../fs-global';
import { ProjectJSON, VariableInformation } from '@/service/global';

export const getVariableInfos = (projectID: string) => {
    const prefix = "getVariableInfos";
    assert(projectID, "projectID is empty");
    assert(RepositoryDirectory, "RepositoryDirectory is empty");
    assert(DefaultUserName, "DefaultUserName is empty");

    let result: VariableInformation[] = [];
    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });

        const projectFilePath = path.join(projectDirectory, ".project.json");
        const projectFile = fs.readFileSync(projectFilePath, "utf-8");
        const projectJSON = JSON.parse(projectFile) as ProjectJSON;
        logger.debug(`projectJSON: ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        const { variableInfos } = projectJSON;
        if (variableInfos) {
            result = variableInfos;
        }
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }

    return result;
}

export const updateVariableInfos = (projectID: string, infosForUpdate: VariableInformation[]) => {
    const prefix = "updateVariableInfos";
    assert(projectID, "projectID is empty");
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

        projectJSON.variableInfos = infosForUpdate;
        logger.debug(`projectJSON(new): ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        fs.writeFileSync(projectFilePath, JSON.stringify(projectJSON, null, 4));
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }
}

