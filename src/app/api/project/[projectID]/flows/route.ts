import { ApplicationError, ContentTypeError, ERR00000, IncorrectBodyError, URLParamError } from "@/consts/erros";
import { logger, logWebRequest, logWebResponse } from "@/consts/logging";
import { ContentTypes, FlowInformation } from "@/service/global";
import { createFlow, getFlowContents, getFlowInfos } from "@/service/fs/crud/flows";

export const GET = async (request: Request, { params }: { params: { projectID: string }}) => {
    logWebRequest(request);
    const { projectID } = params;
    const { searchParams } = new URL(request.url);
    const includeXML = searchParams.get("includeXML");

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    try {
        if (projectID) {
            const flowInfos = getFlowInfos(projectID);

            if (includeXML === "true") {
                flowInfos.forEach((info) => {
                    const { flowName } = info;
                    info.flowSource = getFlowContents(projectID, flowName);
                });
            }

            apiResponse = {
                flowInfos: flowInfos,
                rowCount: flowInfos.length
            };
        } else {
            throw new URLParamError(`Invalid URL parameters: ${JSON.stringify(params)}`);
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
    let webResponse: Response;
    try {
        if (projectID) {
            const contentType = request.headers.get("Content-Type");

            if (action === "create") {
                if (contentType === ContentTypes.JSON) {
                    let json: FlowInformation;
                    try {
                        json = await request.json();
                        logWebRequest(request, JSON.stringify(json));
                    } catch (error: any) {
                        logger.error(error instanceof Error? error.stack : error);
                        throw new ApplicationError(error instanceof Error? error.message : error);
                    }

                    const { flowName, flowTag } = json;
                    if (flowName) {
                        const flowContents = createFlow(projectID, flowName, flowTag? flowTag : "");
                        webResponse = new Response(flowContents, { 
                            headers: { 
                                "Content-Type": "application/xml"
                            }
                        });
            
                        logWebResponse(webResponse, flowContents);
                    } else {
                        throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
                    }
                } else {
                    throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                }
            } else if (action === "update") {
                const action = searchParams.get("update");

                webResponse = new Response(JSON.stringify(apiResponse), { 
                    headers: { 
                        "Content-Type": "application/xml"
                    }
                });
    
                logWebResponse(webResponse, apiResponse);
            } else {
                throw new URLParamError(`Unsupported action parameter : [${action}]`);
            }
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