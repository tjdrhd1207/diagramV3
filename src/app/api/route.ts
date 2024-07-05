export async function GET(request: Request) {
    return Response.json({ result: process.env.DB_USER });
}