'use client'

import { NewPageDialog } from "@/components/dialog/NewPageDialog"
import { NewProjectDialog } from "@/components/dialog/NewProjectDialog"
import { OpenProjectDialog } from "@/components/dialog/OpenProjectDialog"
import { FlowEditor } from "@/components/flow-editor"
import { Header } from "@/components/header"
import { ProjectExplorer } from "@/components/projerct-explorer"
import { useDiagramMetaStore } from "@/store/workspace-store"
import { CssBaseline, Stack } from "@mui/material"
import React from "react"

const Page = () => {
    const meta = useDiagramMetaStore((state) => state.meta);
    const setMeta = useDiagramMetaStore((state) => state.setMeta);
    const setJumpableTagNames = useDiagramMetaStore((state) => state.setJumpableTagNames);

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
        <CssBaseline>
            <Header />
            <Stack direction="row">
                <ProjectExplorer />
                <FlowEditor />
                <>
                    <NewPageDialog />
                    <NewProjectDialog />
                    <OpenProjectDialog />
                </>
            </Stack>
        </CssBaseline>
    )
}

export default Page