import { logger } from '@/consts/logging';
import fs from 'fs';
import path from "path";
import { FSError } from './fs-error';

export const RepositoryDirectory = process.env.WD_REPOSITORY_DIR;
export const DefaultUserName = process.env.WD_DEFAULT_USERNAME;
export const OutputDirectory = process.env.WD_OUTPUT_DIR;

export const listdir = (sourcePath: string) => {
    const prefix = "listWorkingDirectory";
    let dirs: string[] = [];

    logger.debug(`path: ${sourcePath}`, { prefix: prefix });

    try {
        let files = fs.readdirSync(sourcePath);
        dirs.push(...files.filter((fileName) => fs.lstatSync(path.join(sourcePath, fileName)).isDirectory()));
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug(`readdirSync: ${dirs}`, { prefix: prefix });
    }

    return dirs;
}