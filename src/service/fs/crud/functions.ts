import fs from 'fs';
import path from "path";
import assert from "assert";
import { logger } from '@/consts/logging';
import { FSError } from '../fs-error';
import { DefaultUserName, RepositoryDirectory } from '../fs-global';
import { ProjectJSON } from '@/service/global';

export const getFunctionsScript = (projectID: string) => {
    const prefix = "getFunctionsScript";
    assert(projectID, "projectID is empty");

    let result: string = "";
    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });

        const projectFilePath = path.join(projectDirectory, ".project.json");
        const projectFile = fs.readFileSync(projectFilePath, "utf-8");
        const projectJSON = JSON.parse(projectFile) as ProjectJSON;
        logger.debug(`projectJSON: ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        const { functions } = projectJSON;
        if (functions) {
            result = functions;
        }
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }

    return result;
}

export const updateFunctionsScript = (projectID: string, scriptForUpdate: string) => {
    const prefix = "updateFunctionsScript";
    assert(projectID, "projectID is empty");
    assert(scriptForUpdate !== undefined, "scriptForUpdate should not be undefined");

    try {
        logger.debug("FS transaction started", { prefix: prefix });
        const projectDirectory = path.join(RepositoryDirectory, DefaultUserName, projectID);
        logger.debug(`projectDirectory: ${projectDirectory}`, { prefix: prefix });

        const projectFilePath = path.join(projectDirectory, ".project.json");
        const projectFile = fs.readFileSync(projectFilePath, "utf-8");
        const projectJSON = JSON.parse(projectFile) as ProjectJSON;
        logger.debug(`projectJSON: ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        projectJSON.functions = scriptForUpdate;
        logger.debug(`projectJSON(new): ${JSON.stringify(projectJSON)}`, { prefix: prefix });

        fs.writeFileSync(projectFilePath, JSON.stringify(projectJSON, null, 4));
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }
}