export async function GET() {
    //const url = "http://10.1.14.237:8080/data/block-meta.json";
    const url = "https://gist.githubusercontent.com/kimjji/517373e7068d7bb4492771b38f1264ed/raw/294dc7263718580dd35cdbe011bd2187df73c2d6/block-meta.json";

    const response = await fetch(url, {
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });
    const data = await response.json();
    return Response.json(data)
}