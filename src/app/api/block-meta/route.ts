import fetch from 'node-fetch';

export const GET = async (request: Request) => {
    //const url = "http://10.1.14.237:8080/data/block-meta.json";
    //const url = "https://gist.githubusercontent.com/kimjji/517373e7068d7bb4492771b38f1264ed/raw/ff2ba92edbc9af9a8fae5fb12f421d748334efa0/block-meta.json";

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/block-meta.json`, {});
    const data = await response.json();
    return Response.json(data)
}

export const POST = async (request: Request) => {}