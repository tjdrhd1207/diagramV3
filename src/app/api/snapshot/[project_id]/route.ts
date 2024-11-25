import { logWebRequest, logWebResponse } from "@/consts/logging";
import { APIResponse, emptyResponse } from "@/consts/server-object";

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
  
    webResponse = new Response(JSON.stringify(apiResponse), responseOptions)
    logWebResponse(webResponse, apiResponse);
    return webResponse;
}