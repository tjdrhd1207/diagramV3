export async function GET() {
    //const url = "http://10.1.14.237:8080/data/block-meta.json";
    const url = "https://gist.githubusercontent.com/kimjji/517373e7068d7bb4492771b38f1264ed/raw/af22fe0c5c0f0f380e640cf22cac147c0e3603e6/block-meta.json";

    const response = await fetch(url, {
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    });
    const data = await response.json();
    return Response.json(data)
}