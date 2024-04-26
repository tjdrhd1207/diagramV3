import { logAPIRequest, logRawResponse, logWebRequest, logWebResponse, logger } from "@/consts/logging"
import { APIResponse, emptyResponse } from "@/consts/server-object";
import { deleteProject, exportProject } from "@/service/db";
import JSZip from "jszip";

export const POST = async (
    request: Request, 
    { params }: { params: { project_id: string }
}) => {
    logWebRequest(request);
    const project_id = params.project_id;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    let apiResponse: APIResponse = emptyResponse(), webResponse: Response;
    let responseOptions: ResponseInit;
    if (action === "export") {
        // const url = `http://10.1.14.245:8090/project/${project_id}?action=${action}`;
        // const fetchOptions: RequestInit = {
        //     method: "POST",
        //     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        // }
        // logAPIRequest(url, fetchOptions);

        // const fetchResponse = await fetch(url, fetchOptions);
        // const zip = await fetchResponse.blob();
        // logRawResponse(fetchResponse, zip);
        const recordSet = await exportProject({ project_id: project_id });

        const zip = new JSZip();
        recordSet.forEach((row) => {
            const { PAGE_FILE_NAME: fileName, PAGE_SOURCE: source } = row;
            if (fileName && source) {
                zip.file(fileName, source, { binary: false });
                logger.debug(`Page(${fileName}) added to ZIP file`);
            }
        });

        const zipFile = await zip.generateAsync({ type: "nodebuffer" });
        responseOptions = {
            headers: {
                "Content-Type": "application/zip; charset=utf-8",
            }
        }
        
        webResponse = new Response(zipFile, responseOptions);
        logWebResponse(webResponse, apiResponse);
        return webResponse;
    } else if (action === "delete") {
        responseOptions = {
            headers: {
                "Content-Type": "application/json",
            },
        }
        try {
            await deleteProject({ project_id: project_id });
            apiResponse.result = "OK";
            apiResponse.message = `프로젝트(${project_id}) 삭제가 완료되었습니다.`
        } catch (error: any) {
            let errorMessage = error instanceof Error? `${error.name} - ${error.message}` : error;
            apiResponse.result = "ERROR";
            apiResponse.message = errorMessage;
            responseOptions.status = 500;
        }
        webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    } else {
        apiResponse.result = "ERROR";
        apiResponse.message = `Invalid action parameter "${action}"`;
        responseOptions = {
            headers: {
                "Content-Type": "application/json",
            },
            status: 400
        }    
        webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    }

    logWebResponse(webResponse, apiResponse);

    return webResponse;
}