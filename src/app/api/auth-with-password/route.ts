import { logWebRequest, logWebResponse } from "@/consts/logging";

export async function GET(request: Request) {}

export async function POST(request: Request) {
    const json = await request.json();
    logWebRequest(request, JSON.stringify(json));

    let apiResponse;
    const responseOptions: ResponseInit = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    const { userName, password } = json;
    if (userName === "user" && password === "1") {
        responseOptions.status = 200;
        apiResponse = {};
    } else {
        apiResponse = {
            code: "ERROR",
            message: "Incorrect username or password."
        }
        responseOptions.status = 400;
    }
    
    const webResponse = new Response(JSON.stringify(apiResponse), responseOptions);
    logWebResponse(webResponse, apiResponse);

    return webResponse;
}