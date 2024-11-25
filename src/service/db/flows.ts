import { DBTransactionError } from "@/consts/erros";
import { logger } from "@/consts/logging";
import assert from "assert";
import sql from "mssql";
import { dbConnect, dbTransaction, getNowDateTime } from "./_db-core";
import { FlowInformation } from "../global";
import { createDummyFlowXML } from "@/consts/server-object";

export const createFlow = async (projectID: string, flowName: string, flowTag: string ) => {
    const prefix = "createFlow";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");

    const transaction = await dbTransaction();
    let flowContents: string | undefined = undefined;

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        const { yyyymmdd: createDate, hhmmss: createTime } = getNowDateTime();
        const flowSource = createDummyFlowXML();
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`flowName: ${flowName}`, { prefix: prefix });
        logger.debug(`flowSource: ${flowSource}`, { prefix: prefix });
        logger.debug(`flowTag: ${flowTag}`, { prefix: prefix });
        logger.debug(`createDate: ${createDate}`, { prefix: prefix });
        logger.debug(`createTime: ${createTime}`, { prefix: prefix });

        let sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("flowName", sql.VarChar, flowName)
            .query("SELECT COUNT(*) AS count FROM PROJECT_FLOWS WHERE PROJECT_ID = @projectID AND FLOW_NAME = @flowName");

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });
        const recordSet = sqlResult.recordset;
        if (recordSet && recordSet.length === 1) {
            const { count } = recordSet[0];
            if (count !== 0) {
                throw new DBTransactionError(`Flow(${flowName}) already exists`);
            } 
        } else {
            throw new DBTransactionError("Invalid recordSet(SELECT - PROJECT_FLOWS)");
        }

        sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("flowName", sql.VarChar, flowName)
            .input("flowSource", sql.VarChar, flowSource)
            .input("flowTag", sql.VarChar, flowTag? flowTag : "")
            .input("createDate", sql.VarChar, createDate)
            .input("createTime", sql.VarChar, createTime)
            .query(`INSERT INTO PROJECT_FLOWS (
                PROJECT_ID, FLOW_NAME, FLOW_SOURCE, START_FLOW, FLOW_TAG, CREATE_DATE, CREATE_TIME, UPDATE_DATE, UPDATE_TIME
            ) VALUES (
                @projectID, @flowName, @flowSource, 0, @flowTag, @createDate, @createTime, @createDate, @createTime
            )`);

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });
        const rowsAffected = sqlResult.rowsAffected;
        if (rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(INSERT - PROJECT_FLOWS)");
        }

        flowContents = flowSource;
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

    return flowContents;
}

export const getFlowInfos = async (projectID: string) => {
    const prefix = "getFlowNames";
    assert(projectID, "projectID is empty");

    const pool = await dbConnect();
    let flowInfos: FlowInformation[] = [];

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .query("SELECT * FROM PROJECT_FLOWS WHERE PROJECT_ID = @projectID");
        
        const recordSet = sqlResult.recordset;
        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });

        if (recordSet) {
            recordSet.forEach((row) => {
                flowInfos.push({
                    flowName: row.FLOW_NAME,
                    flowSource: row.FLOW_SOURCE,
                    startFlow: row.START_FLOW,
                    flowTag: row.FLOW_TAG,
                    createDate: row.CREATE_DATE,
                    createTime: row.CREATE_TIME,
                    updateDate: row.UPDATE_DATE,
                    updateTime: row.UPDATE_TIME
                });
            });
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

    return flowInfos;
}