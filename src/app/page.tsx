"use client"

import { Box, Card, CardActionArea, CardContent, CssBaseline, Grid, Stack, ThemeProvider, Typography, createTheme } from "@mui/material"
import React from "react"
import { Domain, DomainTwoTone, PolylineTwoTone } from "@mui/icons-material"
import { EllipsisLabel } from "@/components/common/typhography"
import { customTheme } from "@/consts/theme"

const Page = () => {
    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline>
                <Box width="100wh" height="100vh" paddingInline="10%">
                    <Grid container height="100%">
                        <Grid item xs={6}>
                            <Box width="100%" height="100%" padding="5%"
                                display="flex" alignItems="center" justifyContent="center"
                            >
                                <Card variant="outlined" sx={{ width: "50%", height: "30%" }}>
                                    <CardActionArea href="/manager" sx={{ height: "100%" }}>
                                        <CardContent sx={{ alignContent: "center", height: "100%" }}>
                                            <Stack alignItems="center" gap={1}>
                                                <DomainTwoTone fontSize="large" color="primary"/>
                                                <EllipsisLabel variant="h5">Project Manager</EllipsisLabel>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box width="100%" height="100%" padding="10%"
                                display="flex" alignItems="center" justifyContent="center"
                            >
                                <Card variant="outlined" sx={{ width: "50%", height: "30%" }}>
                                    <CardActionArea href="/designer" sx={{ height: "100%" }}>
                                        <CardContent sx={{ alignContent: "center", height: "100%" }}>
                                            <Stack alignItems="center" gap={1}>
                                                <PolylineTwoTone fontSize="large" color="primary" />
                                                <EllipsisLabel variant="h5">ScenarioDesigner</EllipsisLabel>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </CssBaseline>
        </ThemeProvider>
    )
}

export default Page