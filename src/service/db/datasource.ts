import { logger } from "@/consts/logging";
import { PROJECT_INFORMATION } from "@/entity/project_information";
import { DataSource, DataSourceOptions } from "typeorm";
import { messageFromError } from "../_common";
import { DBError } from "@/consts/erros";

export const DataSourceOption: DataSourceOptions = {
    type: "mssql",
    host: "10.1.14.110",
    port: 1433,
    username: "sa",
    password: "h@nsol1!",
    database: "SCENARIO_DESIGNER_V3",
    synchronize: false,
    logging: false,
    entities: [ PROJECT_INFORMATION ],
    migrations: [],
    subscribers: [],
    options: {
        encrypt: false,
    }
}

export const AppDataSource = new DataSource(DataSourceOption);

export const ormConnect = async () => {
    const prefix = "ormConnect";
    
    if (!AppDataSource.isInitialized) {
        logger.info("DataSource Not initialized", { prefix: prefix });
        logger.info(`DataSource Initialization has started - Option : ${JSON.stringify(DataSourceOption)}`, { prefix: prefix });
        try {
            await AppDataSource.initialize();
        } catch (error: any) {
            const errorMessage = messageFromError(error);
            logger.error(errorMessage, { prefix: prefix });
            throw new DBError("DBE00000", errorMessage);
        }
        logger.info("DataSource Initialization completed", { prefix: prefix });
    } else {
        logger.debug("DataSource already Initialized", { prefix: prefix });
    }
}
