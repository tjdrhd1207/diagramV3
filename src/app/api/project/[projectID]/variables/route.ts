import { ApplicationError, ContentTypeError, ERR00000, IncorrectBodyError, URLParamError } from "@/consts/erros";
import { logger, logWebRequest, logWebResponse } from "@/consts/logging";
import { ContentTypes, VariableInfo } from "@/service/global";
import { createVariable, deleteVariable, getVariableInfos, updateVariableInfo } from "@/service/db/variables";

export const GET = async (request: Request, { params }: { params: { projectID: string }}) => {
    logWebRequest(request);
    const { projectID } = params;

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        },
    }

    try {
        if (projectID) {
            const recordSet = await getVariableInfos(projectID);
            let variableInfos: VariableInfo[] = [], rowCount = 0;

            if (recordSet) {
                recordSet.forEach((r: any) => {
                    const {
                        VARIABLE_ACCESS_KEY: variableAccessKey,
                        VARIABLE_TYPE: variableType,
                        VARIABLE_NAME: variableName,
                        DEFAULT_VALUE: defaultValue,
                        VARIABLE_DESCRITION: variableDescription,
                        CREATE_DATE: createDate,
                        CREATE_TIME: createTime,
                        UPDATE_DATE: updateDate,
                        UPDATE_TIME: updateTime
                    } = r;
                    variableInfos.push({
                        variableAccessKey: variableAccessKey,
                        variableType: variableType,
                        variableName: variableName,
                        defaultValue: defaultValue,
                        variableDescription: variableDescription,
                        createDate: createDate,
                        createTime: createTime,
                        updateDate: updateDate,
                        updateTime: updateTime
                    });
                });
                rowCount = recordSet.length;
            }

            apiResponse = {
                variableInfos: variableInfos,
                rowCount: rowCount
            }
        } else {
            throw new URLParamError(`Invalid Project ID: ${projectID}`);
        }
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        const { name, code, message } = error;
        apiResponse = {
            code: code? code : ERR00000,
            message: message && name? `${name} - ${message}` : error
        }
        responseOptions.status = error instanceof ApplicationError? 400 : 500;
    }

    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    
    logWebResponse(webResponse, apiResponse);
    return webResponse;
}

export const POST = async (request: Request, { params }: { params: { projectID: string }}) => {
    const { projectID } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        },
    }

    try {
        if (projectID) {
            if (action === "create") {
                const contentType = request.headers.get("Content-Type");
                let json: any = {};
                
                if (contentType?.includes(ContentTypes.JSON)) {
                    try {
                        json = await request.json();
                        logWebRequest(request, JSON.stringify(json));
                    } catch (error: any) {
                        logger.error(error instanceof Error? error.stack : error);
                        throw new ApplicationError(error instanceof Error? error.message : error);
                    }

                    if (json?.variableAccessKey && json?.variableType && json?.variableName) {
                        await createVariable(projectID, json);
                    } else {
                        throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
                    }
                } else {
                    throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                }
            } else if (action === "update") {
                const contentType = request.headers.get("Content-Type");
                let json: any = {};

                if (contentType?.includes(ContentTypes.JSON)) {
                    try {
                        json = await request.json();
                        logWebRequest(request, JSON.stringify(json));
                    } catch (error: any) {
                        logger.error(error instanceof Error? error.stack : error);
                        throw new ApplicationError(error instanceof Error? error.message : error);
                    }

                    const variableAccessKey = searchParams.get("accessKey");
                    const variableName = searchParams.get("name");
                    const target = searchParams.get("target");
                    if (variableAccessKey && variableName) {
                        if (target === "name") {
                            const { nameForUpdate } = json;
                            if (nameForUpdate) {

                            } else {
                                throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
                            }
                        } else if (target === "info") {
                            const { typeForUpdate, defaultForUpdate, descriptionForUpdate } = json;
                            if (typeForUpdate) {
                                await updateVariableInfo(projectID, variableAccessKey, variableName, {
                                    typeForUpdate: typeForUpdate, defaultForUpdate: defaultForUpdate,
                                    descriptionForUpdate: descriptionForUpdate
                                });
                            } else {
                                throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
                            }
                        } else {
                            throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
                        }
                    } else {
                        throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
                    }
                } else {
                    throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                }
            } else if (action === "delete") {
                logWebRequest(request);
                const variableAccessKey = searchParams.get("accessKey");
                const variableName = searchParams.get("name");
                
                if (variableAccessKey && variableName) {
                    await deleteVariable(projectID, variableAccessKey, variableName);
                } else {
                    throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
                }
            } else {
                throw new URLParamError(`Unsupported action parameter : [${action}]`);
            }
        } else {
            throw new URLParamError(`Invalid Project ID: ${projectID}`);
        }
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        const { name, code, message } = error;
        apiResponse = {
            code: code? code : ERR00000,
            message: message && name? `${name} - ${message}` : error
        }
        responseOptions.status = error instanceof ApplicationError? 400 : 500;
    }

    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    
    logWebResponse(webResponse, apiResponse);
    return webResponse;
}