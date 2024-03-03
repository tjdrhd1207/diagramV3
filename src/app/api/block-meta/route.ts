export async function GET() {
    const url = "http://10.1.14.237:8080/data/block-meta.json";

    const response = await fetch(url, {
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });
    const data = await response.json();
    return Response.json(data)
}