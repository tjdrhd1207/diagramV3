import { logger } from "@/consts/logging";
import { AppDataSource, ormConnect } from "./datasource";
import { PROJECT_INFORMATION } from "@/entity/project_information";

export const getProjectList = async () => {
    const prefix = "getProjectList";
    let recordSet = undefined;

    await ormConnect();

    try {
        logger.debug("DB transaction start", { prefix: prefix });
        recordSet = await AppDataSource
            .createQueryBuilder(PROJECT_INFORMATION, "pi")
            .select()
            .getMany();
            
        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error: any) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        throw error;
    }

    return recordSet;
}