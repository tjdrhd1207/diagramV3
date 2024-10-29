import { ERR00000, ApplicationError, URLParamError, ContentTypeError, IncorrectBodyError } from "@/consts/erros";
import { logger, logWebRequest, logWebResponse } from "@/consts/logging";
import { createInterfaceCode, deleteInterfaceInfo, getInterfaceInfos, updateInterfaceCode, updateInterfaceItems, updateInterfaceName } from "@/service/db/interfaces";
import { ContentTypes } from "@/service/global";

export const GET = async (request: Request, { params }: { params: { projectID: string }}) => {
    logWebRequest(request);
    const projectID = params.projectID;
    const { searchParams } = new URL(request.url);

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    try {
        if (projectID) {
            const interfaceInfos = await getInterfaceInfos(projectID);

            apiResponse = { 
                interfaceInfos: interfaceInfos,
            };
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
    const projectID = params.projectID;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const target = searchParams.get("target");
    const interfaceCode = searchParams.get("code");

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        },
    };

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
                    
                    if (json.interfaceCode && json.interfaceName !== undefined) {
                        await createInterfaceCode(projectID, json);
                    } else {
                        throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
                    }
                } else {
                    throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                }
            } else if (action === "update") {
                if (interfaceCode) {
                    const contentType = request.headers.get("Content-Type");
                    let json: any = {};

                    if (target === "info") {
                        if (contentType?.includes(ContentTypes.JSON)) {
                            try {
                                json = await request.json();
                                logWebRequest(request, JSON.stringify(json));
                            } catch (error: any) {
                                logger.error(error instanceof Error? error.stack : error);
                                throw new ApplicationError(error instanceof Error? error.message : error);
                            }
    
                            const { codeForUpdate, nameForUpdate } = json;
                            if (codeForUpdate) {
                                await updateInterfaceCode(projectID, interfaceCode, codeForUpdate);
                            } else {
                                await updateInterfaceName(projectID, interfaceCode, nameForUpdate);
                            } 
                        } else {
                            throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                        }
                    } else if (target === "items") {
                        if (contentType?.includes(ContentTypes.JSON)) {
                            try {
                                json = await request.json();
                                logWebRequest(request, JSON.stringify(json));
                            } catch (error: any) {
                                logger.error(error instanceof Error? error.stack : error);
                                throw new ApplicationError(error instanceof Error? error.message : error);
                            }

                            const { itemsForUpdate } = json;
                            if (itemsForUpdate) {
                                await updateInterfaceItems(projectID, interfaceCode, itemsForUpdate);
                            } else {
                                throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
                            }
                        } else {
                            throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                        }
                    } else {
                        throw new URLParamError(`Unsupported target parameter : [${target}]`);
                    }
                } else {
                    throw new URLParamError(`Unsupported code parameter : [${interfaceCode}]`);
                }
            } else if (action === "delete") {
                if (interfaceCode) {
                    await deleteInterfaceInfo(projectID, interfaceCode);
                } else {
                    throw new URLParamError(`Unsupported code parameter : [${interfaceCode}]`);
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