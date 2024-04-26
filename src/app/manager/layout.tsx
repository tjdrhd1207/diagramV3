"use client"

import { SideMenu } from "@/components/manager-sidemenu";
import { customTheme } from "@/consts/theme";
import { Box, CssBaseline, Link, Stack, ThemeProvider } from "@mui/material";

const ManagerLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline>
                <Stack direction="row" width="100vw">
                    <Box width="calc(100vw * 0.15)">
                        <SideMenu />
                    </Box>
                    {/* <Stack paddingInline="5%" paddingTop="1%" width="100%" gap={2}>
                        <Box width="100%" border="1px solid" borderColor="secondary.main" borderRadius="5px" padding="1%">
                            <Link href="/manager" underline="hover" color="inherit">Home</Link>
                        </Box>
                        <section>
                            {children}
                        </section>
                    </Stack> */}
                    <Box width="calc(100vw * 0.85)" height="100vh">
                        {children}
                    </Box>
                </Stack>
            </CssBaseline>
        </ThemeProvider>
    ) 
}

export default ManagerLayout;