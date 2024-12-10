import { logWebRequest, logWebResponse, logger } from "@/consts/logging";
import { ApplicationError, ContentTypeError, ERR00000, IncorrectBodyError, URLParamError } from "@/consts/erros";
import { randomUUID } from "crypto";
import { createProject, deleteProject, exportProject, getProjectInfos } from "@/service/fs/crud/project";
import { buildProject, releaseProject, validateProject } from "@/service/fs/functional/project";

export const GET = async (request: Request) => {
    logWebRequest(request);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    
    let webResponse: Response;

    try {
        if (action === "export") {
            const projectID = searchParams.get("id");
            if (projectID) {
                const zipFile = await exportProject(projectID);
                webResponse = new Response(zipFile, { 
                    headers: { 
                        "Content-Type": "application/zip",
                        "Content-Disposition": "attachment; filename=download.zip"
                    }
                });

                logWebResponse(webResponse);
            } else {
                throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
            }
        } else {
            const projectInfos = getProjectInfos();
            let rowCount = projectInfos.length;;
    
            const apiResponse = {
                projectInfos: projectInfos,
                rowCount: rowCount
            }

            webResponse = new Response(JSON.stringify(apiResponse), {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            logWebResponse(webResponse, apiResponse);
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
            logWebRequest(request);
            const projectID = searchParams.get("id");
            if (projectID) {
                deleteProject(projectID);
            } else {
                throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
            }
        } else if (action === "validate") {
            logWebRequest(request);
            const projectID = searchParams.get("id");
            if (projectID) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/block-meta.json`, {
                    cache: "no-cache"
                });
                if (response.ok) {
                    const meta = await response.json();
                    apiResponse = {
                        faultReport: validateProject(projectID, meta)
                    }
                } else {
                    throw new ApplicationError("Invalid meta object");
                }
            } else {
                throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
            }
        } else if (action === "build") {
            logWebRequest(request);
            const projectID = searchParams.get("id");
            if (projectID) {
                buildProject(projectID);
            } else {
                throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
            }
        } else if (action === "release") {
            logWebRequest(request);
            const projectID = searchParams.get("id");
            if (projectID) {
                if (contentType === "application/json") {
                    try {
                        json = await request.json();
                        logWebRequest(request, JSON.stringify(json));
                    } catch (error: any) {
                        logger.error(error instanceof Error? error.stack : error);
                        throw new ApplicationError(error instanceof Error? error.message : error);
                    }

                    const { releaseServerAlias, releaseDescription } = json;
                    const scenarioKey = await releaseProject(projectID, releaseServerAlias, releaseDescription);
                    apiResponse = { scenarioKey };
                } else {
                    throw new ContentTypeError(`Invaild Content-Type : ${contentType}`);
                }
            } else {
                throw new URLParamError(`Invalid query parameter : [${searchParams}]`);
            }
        } else {
            logWebRequest(request);
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