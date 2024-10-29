import assert from "assert";
import { dbConnect, dbTransaction, getNowDateTime } from "./_db-core";
import { logger } from "@/consts/logging";
import { DBTransactionError } from "@/consts/erros";
import sql from "mssql";
import { VariableInfo, UpdateVariableInfo } from "../global";

export const createVariable = async (projectID: string, newVariableInfo: VariableInfo) => {
    const prefix = "createVariable";
    assert(projectID, "projectID is empty");
    assert(newVariableInfo, "projectID is empty");

    const { variableAccessKey, variableType, variableName, defaultValue, variableDescription } = newVariableInfo;
    assert(variableAccessKey, "variableAccessKey is empty");
    assert(variableType, "variableType is empty");
    assert(variableName, "variableName is empty");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        const { yyyymmdd: createDate, hhmmss: createTime } = getNowDateTime();
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`variableAccessKey: ${variableAccessKey}`, { prefix: prefix });
        logger.debug(`variableType: ${variableType}`, { prefix: prefix });
        logger.debug(`variableName: ${variableName}`, { prefix: prefix });
        logger.debug(`defaultValue: ${defaultValue}`, { prefix: prefix });
        logger.debug(`variableDescription: ${variableDescription}`, { prefix: prefix });
        logger.debug(`createDate(updateDate): ${createDate}`, { prefix: prefix });
        logger.debug(`createTime(updateTime): ${createTime}`, { prefix: prefix });

        let sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .query("SELECT * FROM PROJECT_GLOBAL_VARIABLE WHERE PROJECT_ID = @projectID");
        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        let variableNames: string[] = [];
        const recordSet = sqlResult.recordset;
        recordSet.forEach((r) => variableNames.push(r.VARIABLE_NAME));
        logger.debug(`variableNames: ${variableNames}`, { prefix: prefix });

        if (variableNames.includes(variableName)) {
            throw new DBTransactionError(`Duplicate variableName(${variableName})`);
        }

        sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("variableAccessKey", sql.VarChar, variableAccessKey)
            .input("variableType", sql.VarChar, variableType)
            .input("variableName", sql.VarChar, variableName)
            .input("defaultValue", sql.VarChar, defaultValue? defaultValue : "")
            .input("variableDescription", sql.VarChar, variableDescription? variableDescription : "")
            .input("createDate", sql.VarChar, createDate)
            .input("createTime", sql.VarChar, createTime)
            .query(`INSERT INTO PROJECT_GLOBAL_VARIABLE (
                PROJECT_ID, VARIABLE_ACCESS_KEY, VARIABLE_TYPE, VARIABLE_NAME, DEFAULT_VALUE, VARIABLE_DESCRITION,
                CREATE_DATE, CREATE_TIME, UPDATE_DATE, UPDATE_TIME
            ) VALUES (
                @projectID, @variableAccessKey, @variableType, @variableName, @defaultValue, @variableDescription,
                @createDate, @createTime, @createDate, @createTime
            )`);
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

export const getVariableInfos = async (projectID: string) => {
    const prefix = "getVariableInfos";
    assert(projectID, "projectID is empty");

    const pool = await dbConnect();
    let recordSet = undefined;

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .query("SELECT * FROM PROJECT_GLOBAL_VARIABLE WHERE PROJECT_ID = @projectID");

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });
        recordSet = sqlResult.recordset;
    } catch (error: any) {
        if (error instanceof DBTransactionError) {
            throw error;
        } else {
            throw new DBTransactionError(error instanceof Error? error.message : error);
        }
    } finally {
        logger.debug("DB transaction terminated", { prefix: prefix });
    }

    return recordSet;
}

// TODO 변경할 변수가 다른 Client 로 부터 이미 변경된 상태라면 오류가 발생 해야 한다.
export const updateVariableInfo = async (projectID: string, variableAccessKey: string, variableName: string, 
    updateVariableInfo: UpdateVariableInfo) => {
    const prefix = "updateProjectVariables";
    assert(projectID, "projectID is empty");
    assert(variableAccessKey, "variableAccessKey is empty");
    assert(variableName, "variableName is empty");

    const { typeForUpdate, defaultForUpdate, descriptionForUpdate } = updateVariableInfo;
    assert(typeForUpdate, "variableName is empty");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`variableAccessKey: ${variableAccessKey}`, { prefix: prefix });
        logger.debug(`variableName: ${variableName}`, { prefix: prefix });
        logger.debug(`variableType: ${typeForUpdate}`, { prefix: prefix });
        logger.debug(`defaultValue: ${defaultForUpdate}`, { prefix: prefix });
        logger.debug(`variableDescription: ${descriptionForUpdate}`, { prefix: prefix });

        let sqlResult;

        if (typeForUpdate) {
            sqlResult = await transaction.request()
                .input("variableType", sql.VarChar, typeForUpdate)
                .input("projectID", sql.VarChar, projectID)
                .input("variableAccessKey", sql.VarChar, variableAccessKey)
                .input("variableName", sql.VarChar, variableName)
                .query(`UPDATE PROJECT_GLOBAL_VARIABLE SET VARIABLE_TYPE = @variableType
                    WHERE PROJECT_ID = @projectID AND VARIABLE_ACCESS_KEY = @variableAccessKey AND VARIABLE_NAME = @variableName`);

            logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });

            if (sqlResult.rowsAffected[0] !== 1) {
                throw new DBTransactionError("Invalid rowsAffected(UPDATE - PROJECT_GLOBAL_VARIABLE(VARIABLE_TYPE))");
            }
        }

        if (defaultForUpdate !== undefined) {
            sqlResult = await transaction.request()
                .input("defaultValue", sql.VarChar, defaultForUpdate)
                .input("projectID", sql.VarChar, projectID)
                .input("variableAccessKey", sql.VarChar, variableAccessKey)
                .input("variableName", sql.VarChar, variableName)
                .query(`UPDATE PROJECT_GLOBAL_VARIABLE SET DEFAULT_VALUE = @defaultValue
                    WHERE PROJECT_ID = @projectID AND VARIABLE_ACCESS_KEY = @variableAccessKey AND VARIABLE_NAME = @variableName`);
            
            logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });

            if (sqlResult.rowsAffected[0] !== 1) {
                throw new DBTransactionError("Invalid rowsAffected(UPDATE - PROJECT_GLOBAL_VARIABLE(DEFAULT_VALUE))");
            }
        }

        if (descriptionForUpdate !== undefined) {
            sqlResult = await transaction.request()
                .input("variableDescription", sql.VarChar, descriptionForUpdate)
                .input("projectID", sql.VarChar, projectID)
                .input("variableAccessKey", sql.VarChar, variableAccessKey)
                .input("variableName", sql.VarChar, variableName)
                .query(`UPDATE PROJECT_GLOBAL_VARIABLE SET VARIABLE_DESCRITION = @variableDescription
                    WHERE PROJECT_ID = @projectID AND VARIABLE_ACCESS_KEY = @variableAccessKey AND VARIABLE_NAME = @variableName`);

                logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });

                if (sqlResult.rowsAffected[0] !== 1) {
                    throw new DBTransactionError("Invalid rowsAffected(UPDATE - PROJECT_GLOBAL_VARIABLE(VARIABLE_DESCRITION))");
                }
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

export const deleteVariable = async (projectID: string, variableAccessKey: string, variableName: string) => {
    const prefix = "deleteVariable";
    assert(projectID, "projectID is empty");
    assert(variableAccessKey, "variableAccessKey is empty");
    assert(variableName, "variableName is empty");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`variableAccessKey: ${variableAccessKey}`, { prefix: prefix });
        logger.debug(`variableName: ${variableName}`, { prefix: prefix });

        const sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("variableAccessKey", sql.VarChar, variableAccessKey)
            .input("variableName", sql.VarChar, variableName)
            .query(`DELETE FROM PROJECT_GLOBAL_VARIABLE 
                WHERE PROJECT_ID = @projectID AND VARIABLE_ACCESS_KEY = @variableAccessKey AND VARIABLE_NAME = @variableName`);

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