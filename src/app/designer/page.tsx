"use client"

import { NewPageDialog } from "@/components/dialog/NewPageDialog"
import { NewProjectDialog } from "@/components/dialog/NewProjectDialog"
import { OpenProjectDialog } from "@/components/dialog/OpenProjectDialog"
import { FlowEditor } from "@/components/flow-editor"
import { Header } from "@/components/designer-header"
import { ProjectExplorer } from "@/components/projerct-explorer"
import { customTheme } from "@/consts/theme"
import { useDiagramMetaStore, useProjectStore } from "@/store/workspace-store"
import { Card, CardContent, CssBaseline, Stack, ThemeProvider, Typography } from "@mui/material"
import React from "react"
import { header_height } from "@/consts/g-style-vars"
import { useSearchParams } from "next/navigation"



const Page = () => {
    const meta = useDiagramMetaStore((state) => state.meta);
    const setMeta = useDiagramMetaStore((state) => state.setMeta);
    const setJumpableTagNames = useDiagramMetaStore((state) => state.setJumpableTagNames);

    const projectID = useProjectStore((state) => state.projectID);

    // const searchParams = useSearchParams();
    // const id = searchParams.get("id");

    // if (id) {

    // }

    React.useEffect(() => {
        if (!meta) {
            const url = "/api/block-meta";
            fetch(url).then((response) => response.json()).then((json) => {
                setMeta(json)
                let jumpableTagNames: Array<string> = [];
                const nodes = json.nodes;
                if (nodes) {
                    Object.entries<any>(nodes).forEach(([ key, value ]) => {
                        if (value.isJumpable) {
                            jumpableTagNames.push(value.buildTag);
                        }
                    })
                }
                setJumpableTagNames(jumpableTagNames);
            });
        }
    }, [])
    
    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline>
                <Header />
                <Stack width="100%" height={`calc(100vh - ${header_height})`} direction="row">
                    <ProjectExplorer />
                    <FlowEditor />
                    <>
                        <NewPageDialog />
                        <NewProjectDialog />
                        <OpenProjectDialog />
                    </>
                </Stack>
            </CssBaseline>
        </ThemeProvider>
    )
}

export default Page