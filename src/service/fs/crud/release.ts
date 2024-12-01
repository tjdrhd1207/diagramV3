import { logger } from "@/consts/logging";
import { FSError } from "../fs-error";
import path from "path";
import fs from "fs";
import { RepositoryDirectory, DefaultUserName } from "../fs-global";
import { ReleaseJSON, ReleaseServerInformation } from "@/service/global";

export const getReleaseServerInfos = () => {
    const prefix = "getReleaseServerInfos";

    const releaseServerInfos: ReleaseServerInformation[] = [];
    try {
        logger.debug("FS transaction started", { prefix: prefix });

        const releaseJSONFilePath = path.join(RepositoryDirectory, DefaultUserName, "release.json");
        logger.debug(`releaseJSONFilePath: ${releaseJSONFilePath}`, { prefix: prefix });

        if (!fs.existsSync(releaseJSONFilePath)) {
            const releaseJSON: ReleaseJSON = { releaseServerInfos: releaseServerInfos };
            logger.info(`Create release.json (${JSON.stringify(releaseJSON)})`, { prefix: prefix });
            fs.writeFileSync(releaseJSONFilePath, JSON.stringify(releaseJSON, null, 4));
        } else {
            const releaseJSONFile = fs.readFileSync(releaseJSONFilePath, "utf-8");
            const releaseJSON = JSON.parse(releaseJSONFile) as ReleaseJSON;
            releaseServerInfos.push(...releaseJSON.releaseServerInfos);
        }
    } catch (error: any) {
        throw new FSError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("FS transaction terminated", { prefix: prefix });
    }

    return releaseServerInfos;
}