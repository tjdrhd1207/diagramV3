import { XMLParser } from "fast-xml-parser";

export async function GET(
    request: Request, 
    { params }: { params: { project_id: string, page_file_name: string}}) {
    const project_id = params.project_id;
    const page_file_name = params.page_file_name;
    const url = `http://10.1.14.237:8080/data/${project_id}/${page_file_name}`

    const response = await fetch(url, {
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });
    const data = await response.text();
    // const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(data);

    return new Response(data, { headers: { "Content-Type": "text/xml"}});
}