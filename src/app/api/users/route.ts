import { APIError, DBError } from "@/consts/erros";
import { logWebRequest, logWebResponse } from "@/consts/logging";

export async function GET(request: Request) {
    logWebRequest(request);

    let apiResponse;
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    try {
        apiResponse = {
            users: []
        }
    } catch(error: any) {
        apiResponse = {
            code: "ERROR",
            message: "Internal Error"
        };
        responseOptions.status = 500;
    }

    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const json = await request.json();
    logWebRequest(request, JSON.stringify(json));

    let apiResponse;
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    try {
        if (action === "create") {
            const { userName, password } = json;

            if (userName && password) {
                apiResponse = {
                    affectedRows: 1
                };
            } else {
                throw new APIError("ERROR", "Invalid username or password.");
            }
        } else if (action === "update") {
            const user = searchParams.get("user");

            if (user) {
                const { enable, password, assignedRole } = json;
                let affectedRows = 0;
                if (enable || password || assignedRole) {
                    affectedRows = 1;
                }
                apiResponse = {
                    affectedRows: affectedRows
                }
            } else {
                throw new APIError("ERROR", "Invalid username");
            }
        } else if (action === "delete") {
            const user = searchParams.get("user");

            if (user) {
                apiResponse = {
                    affectedRows: 1
                }
            } else {
                throw new APIError("ERROR", "Invalid username");
            }
        } else {
            throw new APIError("ERROR", `Unsupported action parameter ${action}`);
        }
    } catch (error: any) {
        let errorCode, errorMessage;
        if (error instanceof APIError) {
            errorCode = error.code,
            errorMessage = error.message
            responseOptions.status = 400;
        } else if (error instanceof DBError) {
            errorCode = "ERROR";
            errorMessage = error.message;
        } else {
            errorCode = "ERROR";
            errorMessage = error.message;
        }
        apiResponse = {
            code: errorCode,
            message: errorMessage
        }
    }
    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;
}