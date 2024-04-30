import { ProjectListGrid } from "@/components/grid/project-list";
import { Box, Link, Stack, Typography } from "@mui/material";

const Page = () => {
    return (
        <Stack width="100%" height="100%" gap={2}>
            <Stack direction="row" width="100%" borderBottom="1px solid" padding="1%">
                <Link href="/manager" underline="hover" color="inherit">Home</Link>
            </Stack>
            <Stack width="100%" height="100%" padding="15px" gap={3}>
                <Typography variant="h4" fontWeight={600}>Projects</Typography>
                <ProjectListGrid />
            </Stack>
        </Stack>
    )
}

export default Page;