"use server"

import { ApplicationError, DBError } from "@/consts/erros";
import { logger } from "@/consts/logging";
import { $DummyPageXML, $DummyProjectFile, APIResponse } from "@/consts/server-object";
import assert, { AssertionError } from "assert";
import { randomUUID } from "crypto";
import sql, { rows } from "mssql";
import fs from 'fs';
import path from "path";

// https://tediousjs.github.io/node-mssql/#connections-1
const mssqlDBConfig: sql.config = {
    server: "10.1.14.110",
    port: 1433,
    database: "OAMP_V4",
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

// export const mssqlPool = new sql.ConnectionPool(mssqlDBConfig, (err) => console.log(err));
// const request = mssqlPool.request();
// const result = request.query("SELECT 1").then((result) => result.output).then((output) => console.log(output));

const _getNowDateTime = () => {
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

const dbConnect = () => {
    return sql.connect(mssqlDBConfig);
}

export const getProjectList = async () => {
    let pool, recordSet = undefined;
    try {
        pool = await dbConnect();
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }
 
    try {
        logger.debug("DB transaction(Select project information) start");
        const sqlResult = await pool.request().query(`SELECT 
            t1.PROJECT_ID, t1.WORKSPACE_NAME, t1.USER_ID, t1.PROJECT_NAME, t1.PROJECT_DESCRIPTION, t1.CREATE_DATE, t1.CREATE_TIME,
        (
            SELECT TOP 1 UPDATE_DATE FROM SCENARIO_PAGE_REAL_TIME t2 
            WHERE t1.PROJECT_ID = t2.PROJECT_ID ORDER BY UPDATE_DATE, UPDATE_TIME
        ) AS UPDATE_DATE,
        (
            SELECT TOP 1 UPDATE_TIME FROM SCENARIO_PAGE_REAL_TIME t2 
            WHERE t1.PROJECT_ID = t2.PROJECT_ID ORDER BY UPDATE_DATE, UPDATE_TIME
        ) AS UPDATE_TIME
        FROM PROJECT_INFORMATION t1;`);

        recordSet = sqlResult.recordset;
        logger.debug("DB transaction(Select project information) complete");
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    return recordSet;
}

interface CreateProjectProps {
    workspace_name: string,
    project_name: string,
    description?: string
}

export const createProject = async (props: CreateProjectProps) => {
    const { workspace_name, project_name, description } = props;
    assert(workspace_name, "workspace_name is empty");
    assert(project_name, "project_name is empty");

    const project_id = `prj-${randomUUID()}`;

    let transaction;
    try {
        const pool = await dbConnect();
        transaction = pool.transaction();
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    let rowsAffected;
    try {
        const { yyyymmdd: create_date, hhmmss: create_time } = _getNowDateTime();
        
        logger.debug(`project_id: ${project_id}`);
        logger.debug(`create_date: ${create_date}`);
        logger.debug(`create_time: ${create_time}`);
        logger.debug(`description: ${description}`);

        logger.debug("DB transaction(Create project) start");
        await transaction.begin();

        logger.info("DB transaction(Create project) start");
        let sqlResult = await transaction.request().input("project_id", sql.VarChar, project_id)
            .input("workspace_name", sql.VarChar, workspace_name)
            .input("project_name", sql.VarChar, project_name)
            .input("description", sql.VarChar, description? description : "")
            .input("create_date", sql.VarChar, create_date)
            .input("create_time", sql.VarChar, create_time)
            .query(`INSERT INTO PROJECT_INFORMATION (
                project_id, workspace_name, user_id, project_name, project_description, create_date, create_time
            ) VALUES (
                @project_id, @workspace_name, 'admin', @project_name, @description, @create_date, @create_time
            )`);

        rowsAffected = sqlResult.rowsAffected;
        logger.info(`rowsAffected(Insert Project Information): ${rowsAffected}`);

        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(Insert Project Information)");
        }

        const projectFileName = `${project_name}.xml`;
        const ivrmainFileName = "ivrmain.xml";

        logger.debug(`projectFileName: ${projectFileName}`);
        logger.debug(`ivrmainFileName: ${ivrmainFileName}`);

        sqlResult = await transaction.request()
            .input("project_id", sql.VarChar, project_id)
            .input("project_file_name", sql.VarChar, projectFileName)
            .input("project_file_source", sql.VarChar, $DummyProjectFile)
            .input("ivrmain_file_name", sql.VarChar, ivrmainFileName)
            .input("ivrmain_file_source", sql.VarChar, $DummyPageXML)
            .input("create_date", sql.VarChar, create_date)
            .input("update_date", sql.VarChar, create_date)
            .input("create_time", sql.VarChar, create_time)
            .input("update_time", sql.VarChar, create_time)
            .query(`INSERT INTO SCENARIO_PAGE_REAL_TIME (
                user_id, project_id, page_file_name, page_source, create_date, create_time, update_date, update_time
            ) VALUES (
                'admin', @project_id, @project_file_name, @project_file_source, @create_date, @create_time, @update_date, @update_time
            ), (
                'admin', @project_id, @ivrmain_file_name, @ivrmain_file_source, @create_date, @create_time, @update_date, @update_time
            )`);

        rowsAffected = sqlResult.rowsAffected;
        logger.info(`rowsAffected(Insert dummy page sources): ${rowsAffected}`);

        if (!rowsAffected[0] || rowsAffected[0] !== 2) {
            throw new DBError("Invalid affected rows(Insert dummy page sources)")
        }

        await transaction.commit();
        logger.debug("DB transaction(Create project) complete");
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        if (transaction) {
            transaction.rollback();
        }
        throw error;
    }

    return { project_id: project_id }
}

export const deleteProject = () => {

}

interface ExportProjectProps {
    project_id: string;
}

export const exportProject = async (props: ExportProjectProps) => {
    const { project_id } = props;
    assert(project_id, "project_id is empty");

    let pool, recordSet;
    try {
        pool = await dbConnect();
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    try {
        logger.debug("DB transaction(Export project) start");
        const sqlResult = await pool.request()
            .input("project_id", sql.VarChar, project_id)
            .query(`SELECT PAGE_FILE_NAME, PAGE_SOURCE from SCENARIO_PAGE_REAL_TIME WHERE PROJECT_ID = @project_id`);
        recordSet = sqlResult.recordset;
        logger.debug(`RecordSet(Export project): ${JSON.stringify(recordSet)}`);
        logger.debug("DB transaction(Export project) complete");
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    return recordSet;
}

interface CreatePageFileProps {
    project_id: string;
    page_file_name: string;
}

export const createPageFile = async (props: CreatePageFileProps) => {
    const { project_id, page_file_name } = props;
    assert(project_id, "project_id is empty");
    assert(page_file_name, "page_file_name is empty");

    let transaction, result = false;
    try {
        const pool = await dbConnect();
        transaction = pool.transaction();
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }
    
    try {
        const { yyyymmdd: create_date, hhmmss: create_time } = _getNowDateTime();

        logger.debug(`project_id: ${project_id}`);
        logger.debug(`page_file_name: ${page_file_name}`);
        logger.debug(`create_date: ${create_date}`);
        logger.debug(`create_time: ${create_time}`);

        logger.debug("DB transaction(Create project file) start");
        await transaction.begin();

        let sqlResult = await transaction.request()
            .input("project_id", sql.VarChar, project_id)
            .input("page_file_name", sql.VarChar, page_file_name)
            .query(`SELECT COUNT(*) as count FROM SCENARIO_PAGE_REAL_TIME
                WHERE PROJECT_ID = @project_id AND PAGE_FILE_NAME = @page_file_name`)
        let recordset = sqlResult.recordset;

        logger.debug(`Check file exists : ${JSON.stringify(recordset)}`);

        if (!recordset || recordset.length !== 1) {
            throw new DBError("Invalid RecordSet(Check file exists)");
        } else {
            const { count } = recordset[0];
            if (count !== 0) {
                throw new ApplicationError("Page file already exists");
            }
        }
        
        sqlResult = await transaction.request()
            .input("project_id", sql.VarChar, project_id)
            .input("page_file_name", sql.VarChar, page_file_name)
            .input("page_source", sql.VarChar, $DummyPageXML)
            .input("create_date", sql.VarChar, create_date)
            .input("update_date", sql.VarChar, create_date)
            .input("create_time", sql.VarChar, create_time)
            .input("update_time", sql.VarChar, create_time)
            .query(`INSERT INTO SCENARIO_PAGE_REAL_TIME (
                user_id, project_id, page_file_name, page_source, create_date, create_time, update_date, update_time
            ) VALUES (
                'admin', @project_id, @page_file_name, @page_source, @create_date, @create_time, @update_date, @update_time
            )`)
        let rowsAffected = sqlResult.rowsAffected;

        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(Insert page file)")
        }

        result = true;
        await transaction.commit();
        logger.debug("DB transaction(Create page file) complete");
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        if (transaction) {
            transaction.rollback();
        }
        throw error;
    }

    return result;
}

interface UpdatePageFileProps {
    project_id: string;
    page_file_name: string;
    page_source: string;
}

export const updateProjectFile = async (props: UpdatePageFileProps) => {
    const { project_id, page_file_name, page_source } = props;
    assert(project_id, "project_id is empty");
    assert(page_file_name, "page_file_name is empty");
    assert(page_source, "page_source is empty");

    
    let pool, result = false;
    try {
        pool = await dbConnect();
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }
    
    try {
        const { yyyymmdd: update_date, hhmmss: update_time } = _getNowDateTime();

        logger.debug(`project_id: ${project_id}`);
        logger.debug(`page_file_name: ${page_file_name}`);
        logger.debug(`page_source: ${page_source}`);
        logger.debug(`update_date: ${update_date}`);
        logger.debug(`update_time: ${update_time}`);

        logger.debug("DB transaction(Update project file) start");
        const sqlResult = await pool.request()
            .input("page_source", sql.VarChar, page_source)
            .input("update_date", sql.VarChar, update_date)
            .input("update_time", sql.VarChar, update_time)
            .input("project_id", sql.VarChar, project_id)
            .input("page_file_name", sql.VarChar, page_file_name)
            .query(`UPDATE SCENARIO_PAGE_REAL_TIME 
                set PAGE_SOURCE = @page_source, UPDATE_DATE = @update_date, UPDATE_TIME = @update_time
                WHERE PROJECT_ID = @project_id AND PAGE_FILE_NAME = @page_file_name`);

        const rowsAffected = sqlResult.rowsAffected;
        logger.debug(`RowsAffected(Delete page file): ${rowsAffected}`);
        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(Update page file)");
        }

        result = true;
        logger.debug("DB transaction(Update project file) complete");
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    return result;
}

interface DeletePageFileProps {
    project_id: string;
    page_file_name: string;
}

export const deletePageFile = async (props: DeletePageFileProps) => {
    const { project_id, page_file_name } = props;
    assert(project_id, "project_id is empty");
    assert(page_file_name, "page_file_name is empty");

    let pool, result = false;
    try {
        pool = await dbConnect();
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    try {
        logger.debug(`project_id: ${project_id}`);
        logger.debug(`page_file_name: ${page_file_name}`);

        logger.debug("DB transaction(Delete project file) start");
        const sqlResult = await pool.request()
            .input("project_id", sql.VarChar, project_id)
            .input("page_file_name", sql.VarChar, page_file_name)
            .query(`DELETE FROM SCENARIO_PAGE_REAL_TIME WHERE PROJECT_ID = @project_id AND PAGE_FILE_NAME = @page_file_name`);

        const rowsAffected = sqlResult.rowsAffected;
        logger.debug(`RowsAffected(Delete page file): ${rowsAffected}`);
        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(Delete page file)");
        }

        result = true;
        logger.debug("DB transaction(Delete project file) complete");
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    return result;
}

interface OpenProjectFileProps {
    project_id: string;
    page_file_name: string;
}

export const openProjectFile = async (props: OpenProjectFileProps) => {
    const { project_id, page_file_name } = props;
    assert(project_id, "project_id is empty");
    assert(page_file_name, "page_file_name is empty");

    let pool, xmlString: string | undefined = undefined;
    try {
        pool = await dbConnect();
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    try {
        logger.debug(`project_id: ${project_id}`);
        logger.debug(`page_file_name: ${page_file_name}`);

        logger.debug("DB transaction(Open project file) start");
        const sqlResult = await pool.request()
            .input("project_id", sql.VarChar, project_id)
            .input("page_file_name", sql.VarChar, page_file_name)
            .query(`SELECT PAGE_SOURCE FROM SCENARIO_PAGE_REAL_TIME WHERE PROJECT_ID = @project_id AND PAGE_FILE_NAME = @page_file_name`);

        const recordSet = sqlResult.recordset;
        logger.debug(`RecordSet(Open project file): ${JSON.stringify(recordSet)}`);

        if (recordSet.length === 0) {
            throw new DBError(`Project file(${page_file_name}) NOT found`);
        } 
        
        if (recordSet.length > 1) {
            throw new DBError(`Invalid project file(${page_file_name}) count(${recordSet.length})`);
        }

        xmlString = recordSet[0].PAGE_SOURCE;
        logger.debug(`Project file contents: ${xmlString}`);
        logger.debug("DB transaction(Open project file) complete");
    } catch (error) {
        logger.error(error instanceof Error? error.stack : error);
        throw error;
    }

    return xmlString;
}

export const searchKeyword = () => {

}

export const validateProject = () => {

}

export const getSnapshotList = () => {

}

export const createSnapshot = () => {

}

export const deleteSnapshot = () => {

}

export const updateSnapshot = () => {

}

export const exportSnapshot = () => {

}

