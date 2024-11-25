import { logger } from '@/consts/logging';
import fs from 'fs';
import path from "path";
import { FSError } from './fs-error';

export const RepositoryDirectory = "D:/repo";
export const DefaultUserName = "global";

export const listdir = (path: string) => {
    const prefix = "listWorkingDirectory";
    let dirs: string[] = [];

    logger.debug(`path: ${path}`, { prefix: prefix });

    try {
        dirs = fs.readdirSync(path);
        logger.debug(`readdirSync: ${dirs}`, { prefix: prefix });
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    }

    return dirs;
}