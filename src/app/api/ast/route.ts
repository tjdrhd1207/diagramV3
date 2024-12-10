import * as espree from "espree";

export const POST = async (request: Request) => {
    const source = await request.text();
    
    const ast = espree.parse(source, {
        ecmaVersion: 5,
        loc: true,
    });

    return Response.json(ast);
}
