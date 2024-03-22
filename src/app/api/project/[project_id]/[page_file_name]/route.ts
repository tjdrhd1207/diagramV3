export async function GET(
    request: Request, 
    { params }: { params: { project_id: string, page_file_name: string}}) {
    const project_id = params.project_id;
    const page_file_name = params.page_file_name;
    const url = `http://10.1.14.245:8090/project/${project_id}/${page_file_name}`

    const response = await fetch(url, {
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });
    const data = await response.text();
    // const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(data);

    return new Response(data, { headers: { "Content-Type": "text/xml"}});
}

export const POST = async (
    request: Request, 
    { params }: { params: { project_id: string, page_file_name: string}}) => {
        const project_id = params.project_id;
    const page_file_name = params.page_file_name;
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action");
    const text = await request.text();
    console.log("xml", text);
    switch (action) {
        case "save":
            const url = `http://10.1.14.245:8090/project/${project_id}/${page_file_name}?action=save`
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/xml",
                },
                cache: "no-cache",
                body: text
            })
            const data = await response.json();
            console.log("response", data);
            return Response.json(data);
        case "delete":
            return Response.json({});
        default:
            return Response.json({});
    }
}