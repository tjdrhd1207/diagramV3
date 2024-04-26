"use client"

import { ProjectListGrid } from "@/components/grid/project-list"
import { SnapShotList } from "@/components/grid/snapshot-list"
import { Box, Link, Stack } from "@mui/material"

const renderSlugs = (slug: string) => {
    switch (slug) {
        case "project-mng":
            return (
                <Box width="100%" height="90%">
                    <ProjectListGrid />
                </Box>
            )
        case "snapshot-mng":
            return (
                <Box width="100%" height="90%">
                    <SnapShotList />
                </Box>
            )
        default:
            return <></>
    }
}

const Page = ({ params }: { params: { slug: string}}) => {
    const { slug } = params;
    return (
        <Stack paddingInline="5%" paddingTop="1%" width="100%" height="100vh" gap={2}>
            <Stack direction="row" width="100%" border="1px solid" borderColor="secondary.main" borderRadius="5px" padding="1%" gap={1}>
                <Link href="/manager" underline="hover" color="inherit">Home</Link>
                {" / "}
                <Link href="#" underline="hover" color="inherit">{slug}</Link>
            </Stack>
            {
                renderSlugs(slug)
            }
        </Stack>
    );
}

export default Page