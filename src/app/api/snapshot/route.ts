import { logWebRequest, logWebResponse } from "@/consts/logging";
import { emptyResponse } from "@/consts/server-object";

export async function GET(request: Request) {
    logWebRequest(request);

    const apiResponse = emptyResponse();
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;
}