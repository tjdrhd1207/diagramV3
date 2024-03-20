import { logWebRequest, logAPIResponse, logAPIRequest, logWebResponse } from "@/consts/logging";
import { APIResponse } from "../../../consts/server-object";

export async function GET(request: Request) {
    logWebRequest(request);
    const url = "http://10.1.14.245:8090/project";
    const fetchOptions: RequestInit = {
        method: "GET",
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    }
    logAPIRequest(url, fetchOptions);
    const fetchResponse = await fetch(url, fetchOptions);
    const apiResponse: APIResponse = await fetchResponse.json();
    logAPIResponse(fetchResponse, apiResponse);
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }
    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;
}

export const POST = async (request: Request) => {
    const url = request.url;
    const { searchParams } = new URL(url)
    const action = searchParams.get("action");
    const json = await request.json();
    console.log(json);
    switch (action) {
        case "create":
            const response = await fetch("http://10.1.14.245:8090/project?action=create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                body: JSON.stringify(json)
            });
            const data = await response.json();
            console.log(data);
            return Response.json(data);
        default:
            return Response.json({});
    }
}