import { ApplicationError, ERR00000, URLParamError } from "@/consts/erros";
import { logger, logWebRequest, logWebResponse } from "@/consts/logging";

export const GET = async (request: Request, { params }: { params: { projectID: string }}) => {
    logWebRequest(request);
    const projectID = params.projectID;
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
            switch (action) {
                case "details":
                    break;
                default:
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

export const POST = async (request: Request, { params }: { params: { projectID: string }}) => {
    logWebRequest(request);
    const projectID = params.projectID;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    try {
        switch (action) {
            case "update":
                break;
            case "delete":
                break;
            default:
                throw new URLParamError(`Unsupported action parameter : [${action}]`);
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