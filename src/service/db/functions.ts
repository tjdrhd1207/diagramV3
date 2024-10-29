import assert from "assert";
import { dbConnect, dbTransaction } from "./_db-core";
import { logger } from "@/consts/logging";
import sql from "mssql";
import { DBTransactionError } from "@/consts/erros";

export const getProjectFunctions = async (projectID: string) => {
    const prefix = "getProjectFunctions";
    assert(projectID, "projectID is empty");

    const pool = await dbConnect();
    let scriptSource = undefined;

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .query("SELECT * FROM PROJECT_GLOBAL_FUNCTION WHERE PROJECT_ID = @projectID");

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });
        
        const recordSet = sqlResult.recordset;
        if (recordSet.length === 1) {
            const { PROJECT_SCRIPT_SOURCE: projectScriptSource } = recordSet[0];
            scriptSource = projectScriptSource;
        }
    } catch (error: any) {
        if (error instanceof DBTransactionError) {
            throw error;
        } else {
            throw new DBTransactionError(error instanceof Error? error.message : error);
        }
    } finally {
        logger.debug("DB transaction terminated", { prefix: prefix });
    }

    return scriptSource;
}

export const updateProjectFunctions = async (projectID: string, scriptSource: string) => {
    const prefix = "updateProjectFunctions";
    assert(projectID, "projectID is empty");
    assert(scriptSource !== undefined, "scriptSource should not be undefined");

    const transaction = await dbTransaction();

    try {
        transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        const sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("scriptSource", sql.VarChar, scriptSource)
            .query(`UPDATE PROJECT_GLOBAL_FUNCTION SET PROJECT_SCRIPT_SOURCE = @scriptSource
                WHERE PROJECT_ID = @projectID`);

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(INSERT - PROJECT_GLOBAL_VARIABLE)");
        }

        await transaction.commit();
        logger.info("DB transaction commited", { prefix: prefix });
    } catch (error: any) {
        if (transaction) {
            transaction.rollback();
        }

        if (error instanceof DBTransactionError) {
            throw error;
        } else {
            throw new DBTransactionError(error instanceof Error? error.message : error);
        }
    } finally {
        logger.debug("DB transaction terminated", { prefix: prefix });
    }
}