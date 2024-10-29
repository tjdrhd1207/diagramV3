import { ApplicationError, ContentTypeError, ERR00000, IncorrectBodyError, URLParamError } from "@/consts/erros";
import { logger, logWebRequest, logWebResponse } from "@/consts/logging";
import { ContentTypes } from "@/service/global";
import { createFlow, getFlowNames } from "@/service/db/project";

export const GET = async (request: Request, { params }: { params: { projectID: string }}) => {
    logWebRequest(request);
    const { projectID } = params;

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    try {
        if (projectID) {
            const recordSet = await getFlowNames(projectID);
            let flowInfos: any[] = [], rowCount = 0;

            if (recordSet) {
                recordSet.map((row: any) => {
                    const {
                        FLOW_NAME: flowName,
                        START_FLOW: startFlow,
                        FLOW_TAG: flowTag,
                        UPDATE_DATE: updateDate,
                        UPDATE_TIME: updateTime
                    } = row;
                    flowInfos.push({
                        flowName: flowName,
                        startFlow: startFlow,
                        flowTag: flowTag,
                        updateDate: updateDate,
                        updateTime: updateTime
                    });
                });
                rowCount = recordSet.length;
            }

            apiResponse = {
                flowInfos: flowInfos,
                rowCount: rowCount
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

    let webResponse: Response;
    try {
        if (projectID) {
            const contentType = request.headers.get("Content-Type");
            let json;

            if (contentType === ContentTypes.JSON) {
                try {
                    json = await request.json();
                    logWebRequest(request, JSON.stringify(json));
                } catch (error: any) {
                    logger.error(error instanceof Error? error.stack : error);
                    throw new ApplicationError(error instanceof Error? error.message : error);
                }
            } else {
                throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
            }

            const { flowName, flowTag } = json;
            if (flowName) {
                const flowContents = await createFlow(projectID, flowName, flowTag? flowTag : "");
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
            throw new URLParamError(`Invalid URL parameters: ${JSON.stringify(params)}`);
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