'use client'

import { NewPageDialog } from "@/components/dialogs/NewPageDialog"
import { NewProjectDialog } from "@/components/dialogs/NewProjectDialog"
import { OpenProjectDialog } from "@/components/dialogs/OpenProjectDialog"
import { FlowEditor } from "@/components/flow-editor"
import { Header } from "@/components/header"
import { ProjectExplorer } from "@/components/projerct-explorer"
import { CssBaseline, Stack } from "@mui/material"

const Page = () => {

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