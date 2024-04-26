import { Box, Link, Stack } from "@mui/material";

const Page = () => {
    return (
        <Stack paddingInline="5%" paddingTop="1%" width="100%" gap={2}>
            <Stack direction="row" width="100%" border="1px solid" borderColor="secondary.main" borderRadius="5px" padding="1%">
                <Link href="/manager" underline="hover" color="inherit">Home</Link>
            </Stack>
            <Box width="100%" height="100%"></Box>
        </Stack>
    )
}

export default Page;