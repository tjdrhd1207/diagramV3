import { logWebRequest, logWebResponse, logger } from "@/consts/logging";
import { APIError, ApplicationError, ContentTypeError, DBError, ERR00000, IncorrectBodyError, PRE00000, PRE00002, URLParamError } from "@/consts/erros";
import { randomUUID } from "crypto";
import { createProject, deleteProject, getProjectInfos } from "@/service/fs/crud/project";

export const GET = async (request: Request) => {
    logWebRequest(request);

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    try {
        const projectInfos = getProjectInfos();
        let rowCount = projectInfos.length;;

        apiResponse = {
            projectInfos: projectInfos,
            rowCount: rowCount
        }
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        const { name, code, message } = error;
        apiResponse = {
            code: code? code : ERR00000,
            message: message && name? `${name} - ${message}` : error
        }
        responseOptions.status = 500;
    }

    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;
}

export const POST = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    let json, apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    };

    try {
        const contentType = request.headers.get("Content-Type");
        if (action === "create") {
            if (contentType === "application/json") {
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
            
            const { workspaceName, projectName, projectDescription } = json;
            if (workspaceName && projectName && projectDescription !== undefined) {
                const projectID = `prj-${randomUUID()}`;
                createProject({
                    projectID: projectID,
                    projectName: projectName,
                    workspaceName: workspaceName,
                    projectDescription: projectDescription,
                    designerVersion: "3"
                });

                apiResponse = {
                    projectID: projectID
                };
            } else {
                throw new IncorrectBodyError(`Incorrect Body : ${JSON.stringify(json)}`);
            }
        } else if (action === "delete") {
            const projectID = searchParams.get("id");
            if (projectID) {
                deleteProject(projectID);
            } else {
                throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
            }
        } else {
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