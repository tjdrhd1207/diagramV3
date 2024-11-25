import { logger } from "@/consts/logging";
import { dbConnect, dbTransaction, getNowDateTime } from "./_db-core";
import { DBError, DBTransactionError } from "@/consts/erros";
import assert from "assert";
import sql from "mssql";
import { createDummyFlowXML } from "@/consts/server-object";
import { ProjectInformation } from "../global";

export const createProject = async (info: ProjectInformation) => {
    const prefix = "createProject";
    const { projectID, workspaceName, projectName, projectDescription, designerVersion } = info;
    assert(projectID, "projectID is empty");
    assert(workspaceName, "workspaceName is empty");
    assert(projectName, "projectName is empty");
    assert(projectDescription !== undefined, "projectDescription should not be undefined");
    assert(designerVersion, "designerVersion is empty");

    const transaction = await dbTransaction();
    
    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });

        const { yyyymmdd: createDate, hhmmss: createTime } = getNowDateTime();
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`workspaceName: ${workspaceName}`, { prefix: prefix });
        logger.debug(`projectName: ${projectName}`, { prefix: prefix });
        logger.debug(`projectDescription: ${projectDescription}`, { prefix: prefix });
        logger.debug(`designerVersion: ${designerVersion}`, { prefix: prefix });
        logger.debug(`createDate(updateDate): ${createDate}`, { prefix: prefix });
        logger.debug(`createTime(updateTime): ${createTime}`, { prefix: prefix });

        let sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("workspaceName", sql.VarChar, workspaceName)
            .input("projectName", sql.VarChar, projectName)
            .input("projectDescription", sql.VarChar, projectDescription)
            .input("designerVersion", sql.VarChar, designerVersion)
            .input("createDate", sql.VarChar, createDate)
            .input("createTime", sql.VarChar, createTime)
            .query(`INSERT INTO PROJECT_INFORMATION (
                PROJECT_ID, WORKSPACE_NAME, PROJECT_NAME, PROJECT_DESCRIPTION, DESIGNER_VERSION,
                CREATE_DATE, CREATE_TIME, UPDATE_DATE, UPDATE_TIME
            ) VALUES (
                @projectID, @workspaceName, @projectName, @projectDescription, @designerVersion,
                @createDate, @createTime, @createDate, @createTime
            )`);

        let rowsAffected = sqlResult.rowsAffected;
        logger.info(`rowsAffected(INSERT - PROJECT_INFORMATION): ${rowsAffected}`, { prefix: prefix });

        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid affected rows(INSERT - PROJECT_INFORMATION)");
        }

        const ivrmainFileName = "ivrmain.dxml";
        const ivrmainSource = createDummyFlowXML();
        logger.debug(`ivrmainFileName: ${ivrmainFileName}`, { prefix: prefix });
        logger.debug(`ivrmainSource: ${ivrmainSource}`, { prefix: prefix });

        sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("flowName", sql.VarChar, ivrmainFileName)
            .input("flowSource", sql.VarChar, ivrmainSource)
            .input("createDate", sql.VarChar, createDate)
            .input("createTime", sql.VarChar, createTime)
            .query(`INSERT INTO PROJECT_FLOWS (
                PROJECT_ID, FLOW_NAME, FLOW_SOURCE, START_FLOW, CREATE_DATE, CREATE_TIME, UPDATE_DATE, UPDATE_TIME
            ) VALUES (
                @projectID, @flowName, @flowSource, 1, @createDate, @createTime, @createDate, @createTime
            )`);

        rowsAffected = sqlResult.rowsAffected;
        logger.info(`rowsAffected(INSERT - PROJECT_FLOWS): ${rowsAffected}`, { prefix: prefix });

        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid affected rows(INSERT - PROJECT_FLOWS)");
        }

        sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .input("createDate", sql.VarChar, createDate)
            .input("createTime", sql.VarChar, createTime)
            .query(`INSERT INTO PROJECT_GLOBAL_FUNCTION (
                PROJECT_ID, PROJECT_SCRIPT_SOURCE, CREATE_DATE, CREATE_TIME, UPDATE_DATE, UPDATE_TIME
            ) VALUES (
                @projectID, '', @createDate, @createTime, @createDate, @createTime
            )`);

        rowsAffected = sqlResult.rowsAffected;
        logger.info(`rowsAffected(INSERT - PROJECT_GLOBAL_FUNCTION): ${rowsAffected}`, { prefix: prefix });

        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid affected rows(INSERT - PROJECT_GLOBAL_FUNCTION)");
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

export const getProjectInfos = async () => {
    const prefix = "getProjectInfoList";

    const pool = await dbConnect();
    let recordSet = undefined;
    const projectInfos: ProjectInformation[] = [];

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        const sqlResult = await pool.request().query("SELECT * FROM PROJECT_INFORMATION");

        recordSet = sqlResult.recordset;
        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });

        
        if (recordSet) {
            recordSet.forEach((row) => {
                projectInfos.push({
                    projectID: row.PROJECT_ID,
                    workspaceName: row.WORKSPACE_NAME,
                    projectName: row.PROJECT_NAME,
                    projectDescription: row.PROJECT_DESCRIPTION,
                    designerVersion: row.DESIGNER_VERSION,
                    createDate: row.CREATE_DATE, createTime: row.CREATE_TIME,
                    updateDate: row.UPDATE_DATE, updateTime: row.UPDATE_TIME
                });
            });
        }
    } catch (error: any) {
        throw new DBTransactionError(error instanceof Error? error.message : error);
    } finally {
        logger.debug("DB transaction terminated", { prefix: prefix });
    }

    return projectInfos;
}

export const getProjectInfoByID = async (projectID: string) => {
    const prefix = "getProjectInfoByID";
    assert(projectID, "projectID is empty");

    const pool = await dbConnect();
    let projectInfo = {};

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .query("SELECT * FROM PROJECT_INFORMATION WHERE PROJECT_ID = @projectID");
        
        const recordSet = sqlResult.recordset;
        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });
        if (recordSet.length === 1) {
            projectInfo = recordSet[0];
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

    return projectInfo;
}

interface UpdateProjectInfos {
    projectName: string;
    projectDescription: string;
}

export const updateProjectInfo = async (props: UpdateProjectInfos) => {
    const prefix = "updateProjectInfo";
    const { projectName, projectDescription } = props;

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });
        
        logger.debug(`projectName: ${projectName}`, { prefix: prefix });
        logger.debug(`projectDescription: ${projectDescription}`, { prefix: prefix });

        let sqlRequest = transaction.request();
        
        if (projectName) {
            sqlRequest = sqlRequest.input("projectName", sql.VarChar, projectName);
        }

        if (projectDescription) {
            sqlRequest = sqlRequest.input("projectDescription", sql.VarChar, projectDescription);
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

export const deleteProject = async (projectID: string) => {
    const prefix = "deleteProject";
    assert(projectID, "projectID is empty");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });

        const sqlResult = await transaction.request()
            .input("projectID", sql.VarChar, projectID)
            .query("DELETE FROM PROJECT_INFORMATION WHERE PROJECT_ID = @projectID");

        const rowsAffected = sqlResult.rowsAffected;
        logger.info(`rowsAffected(DELETE - PROJECT_INFORMATION): ${rowsAffected}`, { prefix: prefix });

        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid affected rows(INSERT - PROJECT_INFORMATION)");
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

export const getFlowNames = async (projectID: string) => {
    const prefix = "getFlowNames";
    assert(projectID, "projectID is empty");

    const pool = await dbConnect();
    let recordSet = undefined;

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .query("SELECT * FROM PROJECT_FLOWS WHERE PROJECT_ID = @projectID");
        
        recordSet = sqlResult.recordset;
        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });
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

export const getFlowContents = async (projectID: string, flowName: string) => {
    const prefix = "getFlowContents";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");

    const pool = await dbConnect();
    let flowContents = "";

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`flowName: ${flowName}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .input("flowName", sql.VarChar, flowName)
            .query("SELECT FLOW_SOURCE FROM PROJECT_FLOWS WHERE PROJECT_ID = @projectID AND FLOW_NAME = @flowName");
        
        const recordSet = sqlResult.recordset;
        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });
        if (recordSet.length === 1) {
            const { FLOW_SOURCE: flowSource } = recordSet[0];
            flowContents = flowSource
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

    return flowContents;
}

export const updateFlowContents = async (projectID: string, flowName: string, flowContents: string) => {
    const prefix = "updateFlowContents";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");

    const pool = await dbConnect();

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        const { yyyymmdd: updateDate, hhmmss: updateTime } = getNowDateTime();
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`flowName: ${flowName}`, { prefix: prefix });
        logger.debug(`flowContents: ${flowContents}`, { prefix: prefix });
        logger.debug(`updateDate: ${updateDate}`, { prefix: prefix });
        logger.debug(`updateTime: ${updateTime}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .input("flowName", sql.VarChar, flowName)
            .input("flowContents", sql.VarChar, flowContents)
            .input("updateDate", sql.VarChar, updateDate)
            .input("updateTime", sql.VarChar, updateTime)
            .query(`UPDATE PROJECT_FLOWS 
                set FLOW_SOURCE = @flowContents, UPDATE_DATE = @updateDate, UPDATE_TIME = @updateTime
                WHERE PROJECT_ID = @projectID AND FLOW_NAME = @flowName`);

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });
        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(UPDATE - PROJECT_FLOWS)");
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
}

export const updateFlowName = async (projectID: string, flowName: string, newFlowName: string) => {
    const prefix = "updateFlowName";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");
    assert(newFlowName, "newFlowName is empty");

    const pool = await dbConnect();

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        const { yyyymmdd: updateDate, hhmmss: updateTime } = getNowDateTime();
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`flowName: ${flowName}`, { prefix: prefix });
        logger.debug(`newFlowName: ${newFlowName}`, { prefix: prefix });
        logger.debug(`updateDate: ${updateDate}`, { prefix: prefix });
        logger.debug(`updateTime: ${updateTime}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .input("flowName", sql.VarChar, flowName)
            .input("newFlowName", sql.VarChar, newFlowName)
            .input("updateDate", sql.VarChar, updateDate)
            .input("updateTime", sql.VarChar, updateTime)
            .query(`UPDATE PROJECT_FLOWS 
                set FLOW_NAME = @newFlowName, UPDATE_DATE = @updateDate, UPDATE_TIME = @updateTime
                WHERE PROJECT_ID = @projectID AND FLOW_NAME = @flowName`);

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });
        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(UPDATE - PROJECT_FLOWS)");
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
}

export const updateFlowTag = async (projectID: string, flowName: string, newFlowTag: string) => {
    const prefix = "updateFlowTag";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");
    assert(newFlowTag, "newFlowTag is empty");

    const pool = await dbConnect();

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        const { yyyymmdd: updateDate, hhmmss: updateTime } = getNowDateTime();
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`flowName: ${flowName}`, { prefix: prefix });
        logger.debug(`newFlowTag: ${newFlowTag}`, { prefix: prefix });
        logger.debug(`updateDate: ${updateDate}`, { prefix: prefix });
        logger.debug(`updateTime: ${updateTime}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .input("flowName", sql.VarChar, flowName)
            .input("newFlowTag", sql.VarChar, newFlowTag)
            .input("updateDate", sql.VarChar, updateDate)
            .input("updateTime", sql.VarChar, updateTime)
            .query(`UPDATE PROJECT_FLOWS 
                set FLOW_TAG = @newFlowTag, UPDATE_DATE = @updateDate, UPDATE_TIME = @updateTime
                WHERE PROJECT_ID = @projectID AND FLOW_NAME = @flowName`);

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });
        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(UPDATE - PROJECT_FLOWS)");
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
}

export const changeStartFlow = async (projectID: string, flowName: string) => {
    const prefix = "deleteFlow";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");

    const transaction = await dbTransaction();

    try {
        await transaction.begin();
        logger.debug("DB transaction started", { prefix: prefix });

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

export const deleteFlow = async (projectID: string, flowName: string) => {
    const prefix = "deleteFlow";
    assert(projectID, "projectID is empty");
    assert(flowName, "flowName is empty");

    const pool = await dbConnect();

    try {
        logger.debug("DB transaction started", { prefix: prefix });
        logger.debug(`projectID: ${projectID}`, { prefix: prefix });
        logger.debug(`flowName: ${flowName}`, { prefix: prefix });

        const sqlResult = await pool.request()
            .input("projectID", sql.VarChar, projectID)
            .input("flowName", sql.VarChar, flowName)
            .query("DELETE FROM PROJECT_FLOWS WHERE PROJECT_ID = @projectID AND FLOW_NAME = @flowName");

        logger.debug(`sqlResult: ${JSON.stringify(sqlResult)}`, { prefix: prefix });
        if (sqlResult.rowsAffected[0] !== 1) {
            throw new DBTransactionError("Invalid rowsAffected(INSERT - PROJECT_FLOWS)");
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
}