import { logWebRequest, logWebResponse } from "@/consts/logging";
import { APIResponse, emptyResponse } from "@/consts/server-object";
import { createSnapshot } from "@/service/db";

export const POST = async (
    request: Request, 
    { params }: { params: { project_id: string }
}) => {
    const project_id = params.project_id;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const json = await request.json();
    logWebRequest(request, JSON.stringify(json));

    let apiResponse: APIResponse = emptyResponse(), webResponse: Response;
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/zip",
        }
    }

    switch (action) {
        case "create":
            try {
                const { snapshot_version, snapshot_description } = json;
                await createSnapshot({ project_id: project_id, snapshot_version: snapshot_version, snapshot_description: snapshot_description })
                apiResponse.result = "OK";
                apiResponse.message = `스냅샷 (ID: ${project_id}, version: ${snapshot_version}) 이 생성되었습니다.`;
            } catch (error: any) {
                let errorMessage = error instanceof Error? `${error.name} - ${error.message}` : error;
                apiResponse.result = "ERROR";
                apiResponse.message = errorMessage;
                responseOptions.status = 500;
            }
            break;
        default:
            apiResponse.result = "ERROR";
            apiResponse.message = `Invalid action parameter "${action}"`;
            responseOptions.status = 400;
    }
        
    webResponse = new Response(JSON.stringify(apiResponse), responseOptions)
    logWebResponse(webResponse, apiResponse);
    return webResponse;
}