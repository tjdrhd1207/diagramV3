import { logWebRequest, logWebResponse } from "@/consts/logging";
import { emptyResponse } from "@/consts/server-object";
import { getSnapshotList } from "@/service/db";

export async function GET(request: Request) {
    logWebRequest(request);

    const apiResponse = emptyResponse();
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    try {
        const recordSet = await getSnapshotList();
        if (recordSet) {
            apiResponse.result = "OK";
            apiResponse.rows = recordSet;
        } else {
            throw "RecordSet is emplty";
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