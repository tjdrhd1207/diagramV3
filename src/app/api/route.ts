"use server"

import { getProjectPageList } from "@/service/db";

export async function GET() {
    await getProjectPageList({ project_id: "prj-a66b2b57-83a4-4767-9630-58fbb0520151" });
    return Response.json({ result: "ok" });
}