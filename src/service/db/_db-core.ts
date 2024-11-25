import { DBConnectionError, DBError } from "@/consts/erros";
import { logger } from "@/consts/logging";
import sql from "mssql";

// https://tediousjs.github.io/node-mssql/#connections-1
const mssqlDBConfig: sql.config = {
    server: "10.1.14.109",
    port: 1433,
    database: "SCENARIO_DESIGNER_V3",
    pool: {
        max: 5,
        min: 1,
        idleTimeoutMillis: 30000
    },
    options: { encrypt: false },
    authentication: {
        type: "default",
        options: {
            userName: "sa",
            password: "h@nsol1!"
        }
    }
}

export const getNowDateTime = () => {
    const now = new Date();

    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");

    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    return {
        yyyymmdd: `${now.getFullYear()}-${month}-${day}`,
        hhmmss: `${hours}:${minutes}:${seconds}`
    }
}

export const dbConnect = async () => {
    let pool = undefined;
    try {
        pool = await sql.connect(mssqlDBConfig);
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        throw new DBConnectionError(error instanceof Error? error.message : error);
    }
    return pool;
}

export const dbTransaction = async () => {
    let transaction = undefined;
    try {
        const pool = await dbConnect();
        transaction = pool.transaction();
    } catch (error: any) {
        if (error instanceof DBConnectionError) {
            throw error;
        } else {
            logger.error(error instanceof Error? error.stack : error);
            throw new DBConnectionError(error instanceof Error? error.message : error);
        }
    }
    return transaction;
}