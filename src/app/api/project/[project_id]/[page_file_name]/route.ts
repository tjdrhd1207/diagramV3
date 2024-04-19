import { DBError } from "@/consts/erros";
import { logAPIRequest, logAPIResponse, logRawResponse, logWebRequest, logWebResponse, logger } from "@/consts/logging";
import { APIResponse, emptyResponse } from "@/consts/server-object";
import { createPageFile, deletePageFile, openProjectFile, updateProjectFile } from "@/service/db";
import { MSSQLError } from "mssql";

export async function GET(
    request: Request, 
    { params }: { params: { project_id: string, page_file_name: string}}) {
    logWebRequest(request);
    const project_id = params.project_id;
    const page_file_name = params.page_file_name;
    // const url = `http://10.1.14.245:8090/project/${project_id}/${page_file_name}`
    // const fetchOptions: RequestInit = {
    //     method: "GET",
    //     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    // }
    // logAPIRequest(url, fetchOptions);

    // const fetchResponse = await fetch(url, fetchOptions);
    // const xml = await fetchResponse.text();
    // logRawResponse(fetchResponse, xml);
    let xml: string | undefined = undefined;
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/xml",
        }
    }
    try {
        xml = await openProjectFile({ project_id: project_id, page_file_name: page_file_name })
    } catch (error: any) {
        responseOptions.status = 500;
    }

    const webResponse = new Response(xml, responseOptions);
    logWebResponse(webResponse, responseOptions);

    return webResponse;
}

export const POST = async (
    request: Request, 
    { params }: { params: { project_id: string, page_file_name: string}
}) => {
    const project_id = params.project_id;
    const page_file_name = params.page_file_name;
    const { searchParams } = new URL(request.url)
    const text = await request.text();
    logWebRequest(request, text);
    const action = searchParams.get("action");

    let apiResponse: APIResponse = emptyResponse(), errorMessage: string = "";
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    try {
        switch (action ) {
            case "create":
                await createPageFile({ project_id: project_id, page_file_name: page_file_name });
                apiResponse.result = "OK";
                break;
            case "save":
                await updateProjectFile({ project_id: project_id, page_file_name: page_file_name, page_source: text })
                apiResponse.result = "OK";
                break;
            case "delete":
                await deletePageFile({ project_id: project_id, page_file_name: page_file_name })
                apiResponse.result = "OK";
                break;
            default:
                errorMessage = `Unsupported action : [${action}]`;
                logger.warn(errorMessage)
                apiResponse.result = "ERROR";
                apiResponse.message = errorMessage;
        }
    } catch (error: any) {
        errorMessage = error instanceof Error? `${error.name} - ${error.message}` : error;
        apiResponse.result = "ERROR";
        apiResponse.message = errorMessage;
        responseOptions.status = 500;
    }
    // if ((action === "create") || (action === "save") || (action === "delete")) {
    //     const url = `http://10.1.14.245:8090/project/${project_id}/${page_file_name}?action=${action}`
    //     const fetchOptions: RequestInit = {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/xml",
    //         },
    //         cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //         body: text
    //     }
    //     logAPIRequest(url, fetchOptions);
    
    //     const fetchResponse = await fetch(url, fetchOptions);
    //     apiResponse = await fetchResponse.json();
    //     console.log(JSON.stringify(apiResponse));
    //     logAPIResponse(fetchResponse, apiResponse);
    

    //     webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    //     logWebResponse(webResponse, apiResponse);
    // } else {
    //     apiResponse = { result: "error", message: `Invalid action parameter "${action}"`, rows: [] };
    //     webResponse = new Response(JSON.stringify({ result: "error", message: `Invalid action parameter "${action}"` }))
    // }
    
    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;
}