import { ERR00000, ApplicationError } from "@/consts/erros";
import { logWebRequest, logger, logWebResponse } from "@/consts/logging";
import { getReleaseServerInfos } from "@/service/fs/crud/release";

export const GET = async (request: Request) => {
    logWebRequest(request);

    let webResponse: Response;
    try {
        const releaseServerInfos = getReleaseServerInfos();
        const apiResponse = { releaseServerInfos };

        webResponse = new Response(JSON.stringify({ releaseServerInfos }), {
            headers: {
                "Content-Type": "application/json",
            }
        });

        logWebResponse(webResponse, apiResponse);
    } catch (error: any) {
        logger.error(error instanceof Error? error.stack : error);
        const { name, code, message } = error;

        const apiResponse = {
            code: code? code : ERR00000,
            message: message && name? `${name} - ${message}` : error
        }

        webResponse = new Response(JSON.stringify(apiResponse), {
            headers: {
                "Content-Type": "application/json",
            },
            status: error instanceof ApplicationError? 400 : 500
        });

        logWebResponse(webResponse, apiResponse);
    }

    return webResponse;
}