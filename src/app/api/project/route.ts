export async function GET(request: Request) {
    const response = await fetch("http://10.1.14.245:8090/project", {
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });
    const data = await response.json();
    console.log(data);
    return Response.json(data);
}

export const POST = async (request: Request) => {
    const { searchParams } = new URL(request.url)
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
    return Response.json({});
}