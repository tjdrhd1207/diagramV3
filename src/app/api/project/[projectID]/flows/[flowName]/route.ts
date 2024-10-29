import { ApplicationError, ContentTypeError, ERR00000, IncorrectBodyError, URLParamError } from "@/consts/erros";
import { logger, logWebRequest, logWebResponse } from "@/consts/logging";
import { ContentTypes } from "@/service/global";
import { deleteFlow, getFlowContents, updateFlowContents, updateFlowName, updateFlowTag } from "@/service/db/project";

export const GET = async (request: Request, { params }: { params: { projectID: string, flowName: string }}) => {
    const { projectID, flowName } = params;
    logWebRequest(request);

    let webResponse: Response;

    try {
        if (projectID && flowName) {
            const flowContents = await getFlowContents(projectID, flowName);

            webResponse = new Response(flowContents, { 
                headers: { 
                    "Content-Type": "application/xml"
                }
            });

            logWebResponse(webResponse, flowContents);
        } else {
            throw new URLParamError(`Invalid Project ID(${projectID}) or Flow Name(${flowName})`);
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

export const POST = async (request: Request, { params }: { params: { projectID: string, flowName: string }}) => {
    const { projectID, flowName } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    try {
        if (projectID && flowName) {
            switch (action) {
                case "update":
                    const target = searchParams.get("target");
                    const contentType = request.headers.get("Content-Type");
                    switch (target) {
                        case "contents":
                            if (contentType?.includes(ContentTypes.XML)) {
                                const flowContents = await request.text();
                                await updateFlowContents(projectID, flowName, flowContents);
                            } else {
                                throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                            }
                            break;
                        case "name":
                            if (contentType?.includes(ContentTypes.JSON)) {
                                const json = await request.json();
                                const { newFlowName } = json;
                                if (newFlowName) {
                                    await updateFlowName(projectID, flowName, newFlowName);
                                } else {
                                    throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
                                }
                            } else {
                                throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                            }
                            break;
                        case "tag":
                            if (contentType?.includes(ContentTypes.JSON)) {
                                const json = await request.json();
                                const { newFlowTag } = json;
                                if (newFlowTag) {
                                    await updateFlowTag(projectID, flowName, newFlowTag);
                                } else {
                                    throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
                                }
                            } else {
                                throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                            }
                            break;
                        default:
                            throw new URLParamError(`Unsupported target parameter : [${target}]`);
                    }
                    break;
                case "delete":
                    await deleteFlow(projectID, flowName);
                    break;
                default:
                    throw new URLParamError(`Unsupported action parameter : [${action}]`);
            }
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