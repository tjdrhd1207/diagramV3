"use client"

import { ProjectListGrid } from "@/components/grid/project-list"
import { SnapShotList } from "@/components/grid/snapshot-list"
import { Box, Link, Stack, Typography } from "@mui/material"

const renderSlugs = (slug: string) => {
    switch (slug) {
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
        <Stack width="100%" height="100%" gap={2}>
            <Stack direction="row" width="100%" borderBottom="1px solid" padding="1%" gap={1}>
                <Link href="/manager" underline="hover" color="inherit">Home</Link>
                {" / "}
                <Link href="#" underline="hover" color="inherit">{slug}</Link>
            </Stack>
            <Stack width="100%" height="100%" padding="15px" gap={3}>
                <Typography variant="h4" fontWeight={600}>SnapShots</Typography>
                {
                    renderSlugs(slug)
                }
            </Stack>
        </Stack>
    );
}

export default Page