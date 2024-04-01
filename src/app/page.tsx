"use client"

import { NewPageDialog } from "@/components/dialog/NewPageDialog"
import { NewProjectDialog } from "@/components/dialog/NewProjectDialog"
import { OpenProjectDialog } from "@/components/dialog/OpenProjectDialog"
import { FlowEditor } from "@/components/flow-editor"
import { Header } from "@/components/header"
import { ProjectExplorer } from "@/components/projerct-explorer"
import { useDiagramMetaStore } from "@/store/workspace-store"
import { Box, Card, CardActionArea, CardContent, CssBaseline, Grid, Stack, ThemeProvider, Typography, createTheme } from "@mui/material"
import { blue, green, red, yellow } from "@mui/material/colors"
import React from "react"
import { Domain, DomainTwoTone, PolylineTwoTone } from "@mui/icons-material"
import { EllipsisLabel } from "@/components/common/typhography"
import { customTheme } from "@/consts/theme"

const Page = () => {
    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline>
                <Box width="100wh" height="100vh" paddingInline="25%">
                    <Grid container height="100%">
                        <Grid item xs={6}>
                            <Box width="100%" height="100%" padding="10%"
                                display="flex" alignItems="center" justifyContent="center"
                            >
                                <Card variant="outlined">
                                    <CardActionArea>
                                        <CardContent>
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
                                <Card variant="outlined">
                                    <CardActionArea href="/designer">
                                        <CardContent>
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