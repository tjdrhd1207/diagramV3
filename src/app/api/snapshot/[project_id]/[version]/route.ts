import { logWebRequest, logWebResponse } from "@/consts/logging";
import { APIResponse, emptyResponse } from "@/consts/server-object";

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

    webResponse = new Response(JSON.stringify(apiResponse), responseOptions)
    logWebResponse(webResponse, apiResponse);
    return webResponse;
}