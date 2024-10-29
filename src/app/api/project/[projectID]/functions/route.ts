import { ApplicationError, ContentTypeError, ERR00000, URLParamError } from "@/consts/erros";
import { logger, logWebRequest, logWebResponse } from "@/consts/logging";
import { getProjectFunctions, updateProjectFunctions } from "@/service/db/functions";
import { ContentTypes } from "@/service/global";

export const GET = async (request: Request, { params }: { params: { projectID: string }}) => {
    logWebRequest(request);
    const { projectID } = params;

    let webResponse: Response;

    try {
        if (projectID) {
            const scriptSource = await getProjectFunctions(projectID);

            webResponse = new Response(scriptSource, { 
                headers: { 
                    "Content-Type": "application/javascript"
                }
            });
            logWebResponse(webResponse, scriptSource);
        } else {
            throw new URLParamError(`Invalid Project ID: ${projectID}`);
        }
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        const { name, code, message } = error;
        const apiResponse = {
            code: code? code : ERR00000,
            message: message && name? `${name} - ${message}` : error
        }

        webResponse = new Response(JSON.stringify(apiResponse), {
            headers: {
                "Content-Type": "application/json",
            },
            status: error instanceof ApplicationError? 400 : 500
        });

        logWebResponse(webResponse, apiResponse);
    }

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
                if (contentType?.includes(ContentTypes.JS)) {
                    const scriptSource = await request.text();
                    await updateProjectFunctions(projectID, scriptSource);
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