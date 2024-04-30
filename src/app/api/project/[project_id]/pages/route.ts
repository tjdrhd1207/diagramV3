import { ApplicationError } from "@/consts/erros";
import { logWebRequest, logWebResponse } from "@/consts/logging";
import { emptyResponse } from "@/consts/server-object";
import { getProjectPageList } from "@/service/db";

export async function GET(
    request: Request, 
    { params }: { params: { project_id: string }}) {
    logWebRequest(request);
    const project_id = params.project_id;

    const apiResponse = emptyResponse();
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    };

    try {
        const recordSet = await getProjectPageList({ project_id: project_id });
        if (recordSet) {
            apiResponse.result = "OK";
            apiResponse.rows = recordSet;
        } else {
            throw new ApplicationError("RecordSet is emplty");
        }
    } catch (error: any) {
        let errorMessage = error instanceof Error? `${error.name} - ${error.message}` : error;
        apiResponse.result = "ERROR";
        apiResponse.message = errorMessage;
        responseOptions.status = 500;
    }

    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;

}