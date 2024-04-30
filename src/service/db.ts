"use server"

import { ApplicationError, DBError } from "@/consts/erros";
import { logger } from "@/consts/logging";
import { $DummyPageXML, $DummyProjectFile, APIResponse } from "@/consts/server-object";
import assert, { AssertionError } from "assert";
import { randomUUID } from "crypto";
import sql, { rows } from "mssql";

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
    const prefix = "getProjectList";

    let pool, recordSet = undefined;
    try {
        pool = await dbConnect();

        logger.debug("DB transaction start", { prefix: prefix });
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
        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`)
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error: any) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        throw error;
    }

    return recordSet;
}

interface GetProjectPageListProps {
    project_id: string;
}

interface ProjectFiles {
    project_file: string;
    source_files: string[]
}

export const getProjectPageList = async (props: GetProjectPageListProps) => {
    const prefix = "getProjectPageList";
    const { project_id } = props;
    assert(project_id, "project_id is empty");

    let transaction, result: ProjectFiles;
    try {
        const pool = await dbConnect();
        transaction = pool.transaction();
        await transaction.begin();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug("DB transaction start", { prefix: prefix });

        const projectInfo = await checkProjectExists(transaction, project_id);
        if (projectInfo) {
            const { project_name } = projectInfo;
            let sqlResult = await transaction.request()
                .input("project_id", sql.VarChar, project_id)
                .query("SELECT PAGE_FILE_NAME, START, TAG FROM SCENARIO_PAGE_REAL_TIME sprt WHERE PROJECT_ID = @project_id");
            let recordSet = sqlResult.recordset;
            logger.debug(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });

            result = { 
                project_file: `${project_name}.xml`,
                source_files: []
            }
            recordSet.map((row) => row.PAGE_FILE_NAME).forEach((name: string) => {
                if (!name.startsWith(project_name)) {
                    result.source_files.push(name);
                }
            })
        } else {
            throw new ApplicationError(`Project(${project_id}) NOT found`);
        }

        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }

    return result;
}

interface CreateProjectProps {
    workspace_name: string,
    project_name: string,
    description?: string
}

export const createProject = async (props: CreateProjectProps) => {
    const prefix = "createProject";
    const { workspace_name, project_name, description } = props;
    assert(workspace_name, "workspace_name is empty");
    assert(project_name, "project_name is empty");

    const project_id = `prj-${randomUUID()}`;

    let transaction;
    try {
        const pool = await dbConnect();
        transaction = pool.transaction();
        const { yyyymmdd: create_date, hhmmss: create_time } = _getNowDateTime();
        
        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug(`create_date: ${create_date}`, { prefix: prefix });
        logger.debug(`create_time: ${create_time}`, { prefix: prefix });
        logger.debug(`description: ${description}`, { prefix: prefix });

        logger.debug("DB transaction(Create project) start", { prefix: prefix });
        await transaction.begin();

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

        let rowsAffected = sqlResult.rowsAffected;
        logger.info(`rowsAffected(INSERT - PROJECT_INFORMATION): ${rowsAffected}`, { prefix: prefix });

        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(INSERT - PROJECT_INFORMATION)");
        }

        const projectFileName = `${project_name}.xml`;
        const ivrmainFileName = "ivrmain.xml";

        logger.debug(`projectFileName: ${projectFileName}`, { prefix: prefix });
        logger.debug(`ivrmainFileName: ${ivrmainFileName}`, { prefix: prefix });

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
        logger.info(`rowsAffected(INSERT - SCENARIO_PAGE_REAL_TIME): ${rowsAffected}`, { prefix: prefix });

        if (!rowsAffected[0] || rowsAffected[0] !== 2) {
            throw new DBError("Invalid affected rows(INSERT - SCENARIO_PAGE_REAL_TIME)")
        }

        await transaction.commit();
        logger.info(`Project(${project_id}) created`);
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        if (transaction) {
            transaction.rollback();
        }
        throw error;
    }

    return { project_id: project_id }
}

interface DeleteProjectProps {
    project_id: string;
}

export const deleteProject = async (props: DeleteProjectProps) => {
    const prefix = "deleteProject";
    const { project_id } = props;
    assert(project_id, "project_id is empty");

    let pool, transaction, result = false;
    try {
        pool = await dbConnect();
        transaction = pool.transaction();
        transaction.begin();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug("DB transaction start", { prefix: prefix });

        const sqlResult = await pool.request().input("project_id", sql.VarChar, project_id)
            .query("DELETE FROM PROJECT_INFORMATION WHERE PROJECT_ID = @project_id");
        const rowsAffected = sqlResult.rowsAffected;

        logger.info(`rowsAffected(DELETE - PROJECT_INFORMATION): ${rowsAffected}`, { prefix: prefix });
        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(INSERT - PROJECT_INFORMATION)");
        }

        result = true;
        transaction.commit();
        logger.info(`Project(${project_id}) deleted`);
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        if (transaction) {
            transaction.rollback();
        }
        throw error;
    }

    return result;
}

interface ExportProjectProps {
    project_id: string;
}

export const exportProject = async (props: ExportProjectProps) => {
    const prefix = "exportProject";
    const { project_id } = props;
    assert(project_id, "project_id is empty");

    let pool, recordSet;
    try {
        pool = await dbConnect();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug("DB transaction start", { prefix: prefix });

        const sqlResult = await pool.request()
            .input("project_id", sql.VarChar, project_id)
            .query(`SELECT PAGE_FILE_NAME, PAGE_SOURCE from SCENARIO_PAGE_REAL_TIME WHERE PROJECT_ID = @project_id`);
        recordSet = sqlResult.recordset;

        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        throw error;
    }

    return recordSet;
}

interface CreatePageFileProps {
    project_id: string;
    page_file_name: string;
}

export const createPageFile = async (props: CreatePageFileProps) => {
    const prefix = "createPageFile";
    const { project_id, page_file_name } = props;
    assert(project_id, "project_id is empty");
    assert(page_file_name, "page_file_name is empty");

    let transaction, result = false;
    try {
        const pool = await dbConnect();
        transaction = pool.transaction();

        const { yyyymmdd: create_date, hhmmss: create_time } = _getNowDateTime();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug(`page_file_name: ${page_file_name}`, { prefix: prefix });
        logger.debug(`create_date: ${create_date}`, { prefix: prefix });
        logger.debug(`create_time: ${create_time}`, { prefix: prefix });

        logger.debug("DB transaction start", { prefix: prefix });
        await transaction.begin();

        let sqlResult = await transaction.request()
            .input("project_id", sql.VarChar, project_id)
            .input("page_file_name", sql.VarChar, page_file_name)
            .query(`SELECT COUNT(*) as count FROM SCENARIO_PAGE_REAL_TIME
                WHERE PROJECT_ID = @project_id AND PAGE_FILE_NAME = @page_file_name`)
        let recordset = sqlResult.recordset;

        logger.debug(`Check file exists : ${JSON.stringify(recordset)}`, { prefix: prefix });

        if (!recordset || recordset.length !== 1) {
            throw new DBError("Invalid RecordSet(SELECt - SCENARIO_PAGE_REAL_TIME)");
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
        
        logger.info(`rowsAffected(INSERT - SCENARIO_PAGE_REAL_TIME): ${rowsAffected}`, { prefix: prefix });
        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(INSERT - SCENARIO_PAGE_REAL_TIME)")
        }

        result = true;
        await transaction.commit();
        logger.info(`File(${page_file_name}) of project(${project_id}) created`);
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error: any) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
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
    const prefix = "updateProjectFile";
    const { project_id, page_file_name, page_source } = props;
    assert(project_id, "project_id is empty");
    assert(page_file_name, "page_file_name is empty");
    assert(page_source, "page_source is empty");

    
    let pool, result = false;
    try {
        pool = await dbConnect();

        const { yyyymmdd: update_date, hhmmss: update_time } = _getNowDateTime();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug(`page_file_name: ${page_file_name}`, { prefix: prefix });
        logger.debug(`page_source: ${page_source}`, { prefix: prefix });
        logger.debug(`update_date: ${update_date}`, { prefix: prefix });
        logger.debug(`update_time: ${update_time}`, { prefix: prefix });

        logger.debug("DB transaction start", { prefix: prefix });
        
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
        logger.debug(`RowsAffected(UPDATE - SCENARIO_PAGE_REAL_TIME): ${rowsAffected}`, { prefix: prefix });
        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(UPDATE - SCENARIO_PAGE_REAL_TIME)");
        }

        logger.info(`File(${page_file_name}) of project(${project_id}) updated`);
        result = true;
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error: any) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        throw error;
    }

    return result;
}

interface DeletePageFileProps {
    project_id: string;
    page_file_name: string;
}

export const deletePageFile = async (props: DeletePageFileProps) => {
    const prefix = "deletePageFile";
    const { project_id, page_file_name } = props;
    assert(project_id, "project_id is empty");
    assert(page_file_name, "page_file_name is empty");

    let pool, result = false;
    try {
        pool = await dbConnect();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug(`page_file_name: ${page_file_name}`, { prefix: prefix });

        logger.debug("DB transaction start", { prefix: prefix });
        const sqlResult = await pool.request()
            .input("project_id", sql.VarChar, project_id)
            .input("page_file_name", sql.VarChar, page_file_name)
            .query(`DELETE FROM SCENARIO_PAGE_REAL_TIME WHERE PROJECT_ID = @project_id AND PAGE_FILE_NAME = @page_file_name`);

        const rowsAffected = sqlResult.rowsAffected;
        logger.debug(`RowsAffected(DELETE - SCENARIO_PAGE_REAL_TIME): ${rowsAffected}`, { prefix: prefix });
        if (!rowsAffected[0] || rowsAffected[0] !== 1) {
            throw new DBError("Invalid affected rows(DELETE - SCENARIO_PAGE_REAL_TIME)");
        }

        logger.info(`Page file(${page_file_name}) of project(${project_id}) deleted`);
        result = true;
        logger.debug("DB transaction(Delete project file) complete");
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        throw error;
    }

    return result;
}

interface OpenProjectFileProps {
    project_id: string;
    page_file_name: string;
}

export const openProjectFile = async (props: OpenProjectFileProps) => {
    const prefix = "openProjectFile";
    const { project_id, page_file_name } = props;
    assert(project_id, "project_id is empty");
    assert(page_file_name, "page_file_name is empty");

    let pool, xmlString: string | undefined = undefined;
    try {
        pool = await dbConnect();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug(`page_file_name: ${page_file_name}`, { prefix: prefix });

        logger.debug("DB transaction start", { prefix: prefix });
        const sqlResult = await pool.request()
            .input("project_id", sql.VarChar, project_id)
            .input("page_file_name", sql.VarChar, page_file_name)
            .query(`SELECT PAGE_SOURCE FROM SCENARIO_PAGE_REAL_TIME WHERE PROJECT_ID = @project_id AND PAGE_FILE_NAME = @page_file_name`);

        const recordSet = sqlResult.recordset;
        logger.debug(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });

        if (recordSet.length === 0) {
            throw new DBError(`Project file(${page_file_name}) NOT found`);
        } 
        
        if (recordSet.length > 1) {
            throw new DBError(`Invalid project file(${page_file_name}) count: ${recordSet.length}`);
        }

        xmlString = recordSet[0].PAGE_SOURCE;
        logger.info(`Project file contents: ${xmlString}`, { prefix: prefix });
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        throw error;
    }

    return xmlString;
}

export const searchKeyword = () => {

}

export const validateProject = () => {

}

export const getSnapshotList = async () => {
    const prefix = "getSnapshotList";

    let pool, recordSet = undefined;
    try {
        pool = await dbConnect();

        logger.debug("DB transaction start", { prefix: prefix });
        let sqlResult = await pool.request()
            .query(`SELECT 
                si.PROJECT_ID, si.USER_ID, si.PROJECT_VERSION, si.DISABLE, si.SNAPSHOT_DESCRIPTION,
                sps.CREATE_DATE, sps.CREATE_TIME, pi.WORKSPACE_NAME, pi.PROJECT_NAME
            FROM SNAPSHOT_INFORMATION si
            LEFT JOIN (
                SELECT
                    PROJECT_ID,
                    CREATE_DATE,
                    CREATE_TIME,
                    ROW_NUMBER() OVER (PARTITION BY PROJECT_ID ORDER BY CREATE_DATE DESC, CREATE_TIME DESC) as RowNum
                FROM
                    SCENARIO_PAGE_SNAPSHOT
            ) sps ON si.PROJECT_ID = sps.PROJECT_ID AND sps.RowNum = 1
            LEFT JOIN PROJECT_INFORMATION pi ON si.PROJECT_ID = pi.PROJECT_ID;`);
        recordSet = sqlResult.recordset;

        logger.info(`RecordSet: ${JSON.stringify(recordSet)}`, { prefix: prefix });
        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        throw error;
    }

    return recordSet;
}

interface ProjectInfo {
    project_id: string,
    project_name: string,
    workspace_name: string,
    project_description: string
}

const checkProjectExists = async (transaction: sql.Transaction, project_id: string) => {
    const prefix = "checkProjectExists";
    assert(transaction, "Invalid sql.Transaction");
    assert(project_id, "project_id is empty");

    let result: ProjectInfo | undefined = undefined;
    try {
        let sqlResult = await transaction.request()
            .input("project_id", sql.VarChar, project_id)
            // .query(`SELECT COUNT(*) as count FROM PROJECT_INFORMATION WHERE PROJECT_ID = @project_id`);
            .query(`SELECT * FROM PROJECT_INFORMATION WHERE PROJECT_ID = @project_id`);
        let recordset = sqlResult.recordset;

        logger.debug(`Check file exists : ${JSON.stringify(recordset)}`, { prefix: prefix });

        if (!recordset || recordset.length > 1) {
            throw new DBError("Invalid RecordSet(SELECT - PROJECT_INFORMATION)");
        } else {
            if (recordset.length === 1) {
                const { PROJECT_ID, PROJECT_NAME, WORKSPACE_NAME, PROJECT_DESCRIPTION } = recordset[0];
                result = {
                    project_id: PROJECT_ID,
                    project_name: PROJECT_NAME,
                    workspace_name: WORKSPACE_NAME,
                    project_description: PROJECT_DESCRIPTION
                };
                logger.info(`Project information founded(Project Name: ${JSON.stringify(result)})`, { prefix: prefix });
            }
        }
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        throw error;
    }

    return result;
}

interface CreateSnapshotProps {
    project_id: string,
    snapshot_description: string,
    project_version: string,
}

export const createSnapshot = async (props: CreateSnapshotProps) => {
    const prefix = "createSnapshot";
    const { project_id, snapshot_description, project_version } = props;
    assert(project_id, "project_id is empty");
    assert(project_version, "project_version is empty");
    assert(snapshot_description, "snapshot_description is empty");

    let transaction, result = false;
    try {
        const pool = await dbConnect();
        transaction = pool.transaction();

        const { yyyymmdd: create_date, hhmmss: create_time } = _getNowDateTime();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug(`project_version: ${project_version}`, { prefix: prefix });
        logger.debug(`snapshot_description: ${snapshot_description}`, { prefix: prefix });
        logger.debug(`create_date: ${create_date}`, { prefix: prefix });
        logger.debug(`create_time: ${create_time}`, { prefix: prefix });

        logger.debug("DB transaction start", { prefix: prefix });
        await transaction.begin();

        if (await checkProjectExists(transaction, project_id)) {
            let sqlResult = await transaction.request()
                .input("project_id", sql.VarChar, project_id)
                .input("project_version", sql.VarChar, project_version)
                .input("snapshot_description", sql.VarChar, snapshot_description)
                .input("create_date", sql.VarChar, create_date)
                .input("create_time" ,sql.VarChar, create_time)
                .query(`INSERT INTO  SNAPSHOT_INFORMATION (
                        PROJECT_ID, USER_ID, PROJECT_VERSION, DISABLE, SNAPSHOT_DESCRIPTION, CREATE_DATE, CREATE_TIME
                    ) VALUES (
                        @project_id, 'admin', @project_version, 'false', @snapshot_description, @create_date, @create_time
                    )`);
            let rowsAffected = sqlResult.rowsAffected

            logger.debug(`INSERT - SNAPSHOT_INFORMATION rowsAffected: ${rowsAffected}`, { prefix: prefix });
            if (!rowsAffected[0] || rowsAffected[0] !== 1) {
                throw new DBError("Invalid affected rows(INSERT - SNAPSHOT_INFORMATION)");
            }

            logger.info(`Snapshot information (ver:${project_version}) of project(${project_id}) created`);

            sqlResult = await transaction.request()
                .input("project_version", sql.VarChar, project_version)
                .input("create_date", sql.VarChar, create_date)
                .input("create_time" ,sql.VarChar, create_time)
                .input("project_id", sql.VarChar, project_id)
                .query(`INSERT INTO SCENARIO_PAGE_SNAPSHOT (
                    PROJECT_ID, USER_ID, PROJECT_VERSION, PAGE_FILE_NAME, PAGE_SOURCE, CREATE_DATE, CREATE_TIME
                ) SELECT PROJECT_ID, USER_ID, @project_version, PAGE_FILE_NAME, PAGE_SOURCE, @create_date, @create_time
                FROM SCENARIO_PAGE_REAL_TIME WHERE PROJECT_ID = @project_id`);
            rowsAffected = sqlResult.rowsAffected;
            if (!rowsAffected[0] || rowsAffected[0] < 1) {
                throw new DBError("Invalid affected rows(INSERT - SCENARIO_PAGE_SNAPSHOT)");
            }

            result = true;
            transaction.commit();
        } else {
            throw new ApplicationError(`Project(${project_id}) NOT found`);
        }

        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        if (transaction) {
            transaction.rollback();
        }
        throw error;
    }

    return result;
}

interface ChangeSnapshotStatusProps {
    project_id: string;
    project_version: string;
    disable: boolean;
}

export const changeSnapshotStatus = async (props: ChangeSnapshotStatusProps) => {
    const prefix = "changeSnapshotStatus";
    const { project_id, project_version, disable } = props;
    assert(project_id, "project_id is empty");
    assert(project_version, "project_version is empty");

    let transaction, result = false;
    try {
        const pool = await dbConnect();
        transaction = pool.transaction();

        logger.debug(`project_id: ${project_id}`, { prefix: prefix });
        logger.debug(`project_version: ${project_version}`, { prefix: prefix });
        logger.debug(`disable: ${disable}`, { prefix: prefix });
        
        logger.debug("DB transaction start", { prefix: prefix });
        await transaction.begin();

        if (await checkProjectExists(transaction, project_id)) {
            let sqlResult = await transaction.request()
                .input("disable", sql.VarChar, disable? "true" : "false")
                .input("project_id", sql.VarChar, project_id)
                .input("project_version", sql.VarChar, project_version)
                .query("UPDATE SNAPSHOT_INFORMATION SET DISABLE = @disable WHERE PROJECT_ID = @project_id AND PROJECT_VERSION = @project_version");
            let rowsAffected = sqlResult.rowsAffected;

            logger.debug(`UPDATE - SNAPSHOT_INFORMATION rowsAffected: ${rowsAffected}`, { prefix: prefix });
            if (!rowsAffected[0] || rowsAffected[0] !== 1) {
                throw new DBError("Invalid affected rows(UPDATE - SNAPSHOT_INFORMATION)");
            }

            logger.info(`Status of project(${project_id}) in SNAPSHOT_INFORMATION updated`, { prefix: prefix });
            result = true;
            transaction.commit();
        } else {
            throw new ApplicationError(`Project(${project_id}) NOT found`);
        }

        logger.debug("DB transaction complete", { prefix: prefix });
    } catch (error) {
        logger.error(`${error instanceof Error? error.stack : error}`, { prefix: prefix });
        if (transaction) {
            transaction.rollback();
        }
        throw error;
    }

    return result;
}

export const deleteSnapshot = () => {

}

export const exportSnapshot = () => {

}

