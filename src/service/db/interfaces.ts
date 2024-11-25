import assert from "assert";
import { dbConnect, dbTransaction, getNowDateTime } from "./_db-core";
import { logger } from "@/consts/logging";
import sql from "mssql";
import { DBTransactionError } from "@/consts/erros";
import { InterfaceInformation, InterfaceItem, InterfaceItemInfos, InterfaceUpdateInfo } from "../global";

const hasInterfaceCode = async (projectID: string, interfaceCode: string) => {
    const prefix = "hasInterfaceCode";
    assert(projectID, "projectID is empty");
    assert(interfaceCode, "interfaceCode is empty");

    const pool = await dbConnect();
    let interfaceInfo: InterfaceInformation;

    let sqlResult = await pool.request()
        .input("projectID", sql.VarChar, projectID)
        .input("interfaceCode", sql.VarChar, interfaceCode)
        .query(`SELECT * FROM PROJECT_INTERFACE_INFORMATION 
            WHERE PROJECT_ID = @projectID AND INTERFACE_CODE = @interfaceCode`);
    logger.debug(`sqlResult(SELECT): ${JSON.stringify(sqlResult)}`, { prefix: prefix });
    
    const recordSet = sqlResult.recordset;
    if (recordSet.length === 0) {
        throw new DBTransactionError(`interfaceCode(${interfaceCode}) NOT found`);
    } else if (recordSet.length > 1 ) {
        throw new DBTransactionError(`More then tow or more rows searched by intefaceCode(${interfaceCode})`);
    } else {
        const row = recordSet[0];
        interfaceInfo = {
            interfaceCode: row.INTERFACE_CODE, interfaceName: row.INTERFACE_NAME, 
            interfaceItems: JSON.parse(row.INTERFACE_ITEMS),
            updateDate: row.UPDATE_DATE, updateTime: row.UPDATE_TIME
        };
    }

    if (logger.isDebugEnabled()) {
        logger.info(`interfaceCode(${interfaceCode}) founded - ${JSON.stringify(interfaceInfo)}`);
    } else {
        logger.info(`interfaceCode(${interfaceCode}) founded`);
    }

    return interfaceInfo;
}

export const createInterfaceCode = async (projectID: string, newInterfaceInfo: InterfaceInformation) => {
    const prefix = "createInterfaceCode";
    assert(projectID, "projectID is empty");
    
    const { interfaceCode, interfaceName, interfaceItems } = newInterfaceInfo;
    assert(interfaceCode, "interfaceCode is empty");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        let sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("interfaceCode", sql.VarChar, interfaceCode)
            .query(`SELECT * FROM PROJECT_INTERFACE_INFORMATION 
                WHERE PROJECT_ID = @projectID AND INTERFACE_CODE = @interfacecode`);
        logger.debug(`sqlResult(SELECT): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.recordset.length !== 0) {
            throw new DBTransactionError(`Duplicate interfaceCode(${interfaceCode})`);
        }

        logger.debug(`interfaceCode: ${interfaceCode}`, { prefix: prefix });
        logger.debug(`interfaceName: ${interfaceName}`, { prefix: prefix });
        logger.debug(`interfaceItems: ${JSON.stringify(interfaceItems)}`, { prefix: prefix });
        const { yyyymmdd: createDate, hhmmss: createTime } = getNowDateTime();
        logger.debug(`createDate(updateDate): ${createDate}`, { prefix: prefix });
        logger.debug(`createTime(updateTime): ${createTime}`, { prefix: prefix });

        sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("interfaceCode", sql.VarChar, interfaceCode)
            .input("interfaceName", sql.VarChar, interfaceName? interfaceName : "")
            .input("interfaceItems", sql.VarChar, JSON.stringify(interfaceItems))
            .input("createDate", sql.VarChar, createDate)
            .input("createTime", sql.VarChar, createTime)
            .input("updateDate", sql.VarChar, createDate)
            .input("updateTime", sql.VarChar, createTime)
            .query(`INSERT INTO PROJECT_INTERFACE_INFORMATION (
                PROJECT_ID, INTERFACE_CODE, INTERFACE_NAME, INTERFACE_ITEMS, CREATE_DATE, CREATE_TIME, UPDATE_DATE, UPDATE_TIME
            ) VALUES (
                @projectID, @interfaceCode, @interfaceName, @interfaceItems, @createDate, @createTime, @updateDate, @updateTime
            )`);
        logger.debug(`sqlResult(INSERT): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(INSERT - PROJECT_INTERFACE_INFORMATION)");
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

export const getInterfaceInfos = async (projectID: string) => {
    const prefix = "getInterfaceInfos";
    assert(projectID, "projectID is empty");

    const pool = await dbConnect();
    let interfaceInfos: InterfaceInformation[] = [];

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .query("SELECT * FROM PROJECT_INTERFACE_INFORMATION WHERE PROJECT_ID = @projectID");
        logger.debug(`sqlResult(SELECT): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        sqlResult.recordset.forEach((r) => {
            interfaceInfos.push({
                interfaceCode: r.INTERFACE_CODE, interfaceName: r.INTERFACE_NAME,
                interfaceItems: JSON.parse(r.INTERFACE_ITEMS),
                updateDate: r.UPDATE_DATE, updateTime: r.UPDATE_TIME
            });
        });

        logger.debug(`interfaceInfos: ${JSON.stringify(interfaceInfos)}`, { prefix: prefix });
    } catch (error: any) {
        if (error instanceof DBTransactionError) {
            throw error;
        } else {
            throw new DBTransactionError(error instanceof Error? error.message : error);
        }
    } finally {
        logger.debug("DB transaction terminated", { prefix: prefix });
    }

    return interfaceInfos;
}

export const updateInterfaceCode = async (projectID: string, interfaceCode: string, codeForUpdate: string) => {
    const prefix = "updateInterfaceCode";
    assert(projectID, "projectID is empty");
    assert(interfaceCode, "interfaceCode is empty");
    assert(codeForUpdate, "codeForUpdate is empty");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`interfaceCode: ${interfaceCode}`, { prefix: prefix });
        logger.debug(`codeForUpdate: ${codeForUpdate}`, { prefix: prefix });

        const interfaceInfo = await hasInterfaceCode(projectID, interfaceCode);

        let sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("codeForUpdate", sql.VarChar, codeForUpdate)
            .query(`SELECT * FROM PROJECT_INTERFACE_INFORMATION 
                WHERE PROJECT_ID = @projectID AND INTERFACE_CODE = @codeForUpdate`);
        logger.debug(`sqlResult(SELECT): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.recordset.length !== 0) {
            throw new DBTransactionError(`Duplicate interfaceCode(${codeForUpdate})`);
        }

        const { yyyymmdd: createDate, hhmmss: createTime } = getNowDateTime();
        logger.debug(`createDate(updateDate): ${createDate}`, { prefix: prefix });
        logger.debug(`createTime(updateTime): ${createTime}`, { prefix: prefix });

        sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("codeForUpdate", sql.VarChar, codeForUpdate)
            .input("interfaceName", sql.VarChar, interfaceInfo.interfaceName)
            .input("interfaceItems", sql.VarChar, JSON.stringify(interfaceInfo.interfaceItems))
            .input("createDate", sql.VarChar, createDate)
            .input("createTime", sql.VarChar, createTime)
            .input("updateDate", sql.VarChar, createDate)
            .input("updateTime", sql.VarChar, createTime)
            .query(`INSERT INTO PROJECT_INTERFACE_INFORMATION (
                PROJECT_ID, INTERFACE_CODE, INTERFACE_NAME, INTERFACE_ITEMS, CREATE_DATE, CREATE_TIME, UPDATE_DATE, UPDATE_TIME
            ) VALUES (
                @projectID, @codeForUpdate, @interfaceName, @interfaceItems, @createDate, @createTime, @updateDate, @updateTime
            )`);
        logger.debug(`sqlResult(INSERT): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(INSERT - PROJECT_INTERFACE_INFORMATION)");
        }

        sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("interfaceCode", sql.VarChar, interfaceCode)
            .query(`DELETE FROM PROJECT_INTERFACE_INFORMATION
                WHERE PROJECT_ID = @projectID AND INTERFACE_CODE = @interfaceCode`);
        logger.debug(`sqlResult(DELETE): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(DELETE - PROJECT_INTERFACE_INFORMATION)");
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

export const updateInterfaceName = async (projectID: string, interfaceCode: string, nameForUpdate: string) => {
    const prefix = "updateInterfaceName";
    assert(projectID, "projectID is empty");
    assert(interfaceCode, "interfaceCode is empty");
    assert(nameForUpdate !== undefined, "nameForUpdate should not be undefined");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`interfaceCode: ${interfaceCode}`, { prefix: prefix });
        logger.debug(`nameForUpdate: ${nameForUpdate}`, { prefix: prefix });

        await hasInterfaceCode(projectID, interfaceCode);

        const { yyyymmdd: updateDate, hhmmss: updateTime } = getNowDateTime();
        logger.debug(`updateDate: ${updateDate}`, { prefix: prefix });
        logger.debug(`updateTime: ${updateTime}`, { prefix: prefix });

        const sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("interfaceCode", sql.VarChar, interfaceCode)
            .input("nameForUpdate", sql.VarChar, nameForUpdate)
            .input("updateDate", sql.VarChar, updateDate)
            .input("updateTime", sql.VarChar, updateTime)
            .query(`UPDATE PROJECT_INTERFACE_INFORMATION
                SET INTERFACE_NAME = @nameForUpdate, UPDATE_DATE = @updateDate, UPDATE_TIME = @updateTime
                WHERE PROJECT_ID = @projectID AND INTERFACE_CODE = @interfaceCode`);
        logger.debug(`sqlResult(UPDATE): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(UPDATE - PROJECT_INTERFACE_INFORMATION)");
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

export const updateInterfaceItems = async (projectID: string, interfaceCode: string, itemsForUpdate: InterfaceItem) => {
    const prefix = "deleteInterfaceInfo";
    assert(projectID, "projectID is empty");
    assert(interfaceCode, "interfaceCode is empty");
    assert(itemsForUpdate !== undefined, "itemsForUpdate should not be undefined");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`interfaceCode: ${interfaceCode}`, { prefix: prefix });
        
        await hasInterfaceCode(projectID, interfaceCode);

        logger.debug(`itemsForUpdate: ${JSON.stringify(itemsForUpdate)}`, { prefix: prefix });
        const { yyyymmdd: updateDate, hhmmss: updateTime } = getNowDateTime();
        logger.debug(`updateDate: ${updateDate}`, { prefix: prefix });
        logger.debug(`updateTime: ${updateTime}`, { prefix: prefix });

        const sqlResult = await transaction.request()
        .input("projectID", sql.VarChar, projectID)
        .input("interfaceCode", sql.VarChar, interfaceCode)
        .input("itemsForUpdate", sql.VarChar, JSON.stringify(itemsForUpdate))
        .input("updateDate", sql.VarChar, updateDate)
        .input("updateTime", sql.VarChar, updateTime)
        .query(`UPDATE PROJECT_INTERFACE_INFORMATION
            SET INTERFACE_ITEMS = @itemsForUpdate, UPDATE_DATE = @updateDate, UPDATE_TIME = @updateTime
            WHERE PROJECT_ID = @projectID AND INTERFACE_CODE = @interfaceCode`);
        logger.debug(`sqlResult(UPDATE): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(UPDATE - PROJECT_INTERFACE_INFORMATION)");
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

export const deleteInterfaceInfo = async (projectID: string, interfaceCode: string) => {
    const prefix = "deleteInterfaceInfo";
    assert(projectID, "projectID is empty");
    assert(interfaceCode, "interfaceCode is empty");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`interfaceCode: ${interfaceCode}`, { prefix: prefix });

        await hasInterfaceCode(projectID, interfaceCode);

        const sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("interfaceCode", sql.VarChar, interfaceCode)
            .query(`DELETE FROM PROJECT_INTERFACE_INFORMATION
                WHERE PROJECT_ID = @projectID AND INTERFACE_CODE = @interfaceCode`);
        logger.debug(`sqlResult(DELETE): ${JSON.stringify(sqlResult)}`, { prefix: prefix });

        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(DELETE - PROJECT_INTERFACE_INFORMATION)");
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