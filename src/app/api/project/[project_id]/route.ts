import { logAPIRequest, logRawResponse, logWebRequest, logWebResponse } from "@/consts/logging"
import { APIResponse } from "@/consts/server-object";

export const POST = async (
    request: Request, 
    { params }: { params: { project_id: string }
}) => {
    logWebRequest(request);
    const project_id = params.project_id;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    
    let apiResponse: APIResponse, webResponse: Response;
    if (action === "export") {
        const url = `http://10.1.14.245:8090/project/${project_id}?action=${action}`;
        const fetchOptions: RequestInit = {
            method: "POST",
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        }
        logAPIRequest(url, fetchOptions);

        const fetchResponse = await fetch(url, fetchOptions);
        const zip = await fetchResponse.blob();
        logRawResponse(fetchResponse, zip);
    
        const responseOptions: ResponseInit = {
            headers: {
                "Content-Type": "application/zip",
            }
        }
        webResponse = new Response(zip, responseOptions);
        logWebResponse(webResponse, responseOptions);
    } else {
        apiResponse = { result: "error", message: `Invalid action parameter "${action}"`, rows: [] };
        webResponse = new Response(JSON.stringify({ result: "error", message: `Invalid action parameter "${action}"` }))
        logWebResponse(webResponse, apiResponse);
    }

    return webResponse;
}