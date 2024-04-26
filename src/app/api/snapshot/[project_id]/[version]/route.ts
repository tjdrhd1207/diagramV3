import { logWebRequest, logWebResponse } from "@/consts/logging";
import { APIResponse, emptyResponse } from "@/consts/server-object";
import { changeSnapshotStatus } from "@/service/db";

export const POST = async (
    request: Request, 
    { params }: { params: { project_id: string, version: string }
}) => {
    logWebRequest(request);
    const { project_id, version } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    
    let apiResponse: APIResponse = emptyResponse(), webResponse: Response;
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/zip",
        }
    }

    if (action === "enable" || action === "disable") {
        try {
            await changeSnapshotStatus({ project_id: project_id, project_version: version, disable: action === "disable"? true : false });
            apiResponse.result = "OK";
            apiResponse.message = `스냅샷(ID: ${project_id}, Version: ${version}) 의 상태가 변경되었습니다. (to ${action})`
        } catch (error: any) {
            let errorMessage = error instanceof Error? `${error.name} - ${error.message}` : error;
            apiResponse.result = "ERROR";
            apiResponse.message = errorMessage;
            responseOptions.status = 500;
        }
    } else {
        apiResponse.result = "ERROR";
        apiResponse.message = `Invalid action parameter "${action}"`;
        responseOptions.status = 400;
    }

    webResponse = new Response(JSON.stringify(apiResponse), responseOptions)
    logWebResponse(webResponse, apiResponse);
    return webResponse;
}