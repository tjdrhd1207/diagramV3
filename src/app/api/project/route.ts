import { logWebRequest, logWebResponse, logger } from "@/consts/logging";
import { emptyResponse } from "../../../consts/server-object";
import { createProject, getProjectList } from "@/service/db";

export async function GET(request: Request) {
    logWebRequest(request);

    let apiResponse = {};
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    try {
        const recordSet = await getProjectList();
        let projectInfos: any, rowCount = 0;

        if (recordSet) {
            projectInfos = recordSet;
            rowCount = recordSet.length;
        } else {
            projectInfos = [];
        }

        apiResponse = {
            projectInfos: projectInfos,
            rowCount: rowCount
        }
    } catch (error: any) {
        const { code, message } = error;
        apiResponse = {
            code: code? code : "ERROR",
            message: message? message : error
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
    const json = await request.json();
    logWebRequest(request, JSON.stringify(json));

    const apiResponse = emptyResponse();
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    switch (action) {
        case "create":
            const { workspaceName, projectName, projectDescription } = json;

            // const response = await fetch("http://10.1.14.245:8090/project?action=create", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            //     body: JSON.stringify(json)
            // });
            // const data = await response.json();
            // console.log(data);
            try {
                // const result = await createProject({
                //     project_name: project_name,
                //     workspace_name: workspace_name,
                //     description: description 
                // });
                apiResponse.result = "OK"
                apiResponse.message = `프로젝트 생성에 성공하였습니다. (${projectName})`
                apiResponse.rows = "result";
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (error: any) {
                let errorMessage = error instanceof Error? `${error.name} - ${error.message}` : error;
                apiResponse.result = "ERROR";
                apiResponse.message = errorMessage;
                responseOptions.status = 500;
            }
            break;
        default:
            apiResponse.result = "ERROR";
            apiResponse.message = `Unsupported action : [${action}]`;
            responseOptions.status = 400;
            break;
    }
    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;
}