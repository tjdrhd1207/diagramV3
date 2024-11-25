import { ApplicationError, ContentTypeError, ERR00000, URLParamError } from "@/consts/erros";
import { logger, logWebRequest, logWebResponse } from "@/consts/logging";
import { ContentTypes } from "@/service/global";
import { getVariableInfos, updateVariableInfos } from "@/service/fs/crud/variables";

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
            const variableInfos = getVariableInfos(projectID);

            apiResponse = {
                variableInfos: variableInfos,
                rowCount: variableInfos.length
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
            if (action === "update") {
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

                    updateVariableInfos(projectID, json);
                } else {
                    throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
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