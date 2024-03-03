export async function GET(request: Request) {
    const response = await fetch("http://10.1.14.237:8080/data/projects.json", {
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });
    const data = await response.json();
    return Response.json(data);
}