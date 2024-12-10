"use client"

import { NewFlowDialog } from "@/components/dialog/NewFlowDialog"
import { NewProjectDialog } from "@/components/dialog/NewProjectDialog"
import { OpenProjectDialog } from "@/components/dialog/OpenProjectDialog"
import { FlowEditor } from "@/components/flow-editor"
import { Header } from "@/components/designer-header"
import { ProjectExplorer } from "@/components/projerct-explorer"
import { customTheme } from "@/consts/theme"
import { FlowInfo, useDiagramMetaStore, useProjectStore } from "@/store/workspace-store"
import { Box, Card, CardContent, CssBaseline, Stack, ThemeProvider, Typography } from "@mui/material"
import React from "react"
import { header_height } from "@/consts/g-style-vars"
import { useSearchParams } from "next/navigation"
import { getFlowInfos } from "@/service/fetch/crud/flows"
import { KeywordSearchDialog } from "@/components/dialog/KeywordSearchDialog"
import { RelaseProjectDialog } from "@/components/dialog/ReleaseProjectDialog"
import { FaultReport } from "@/service/global"
import { validateFlows } from "@/service/all/validate"
import { useBottomPanelStore, useFaultReportStore } from "@/store/flow-editor-store"

const Page = () => {
    const meta = useDiagramMetaStore((state) => state.meta);
    const setMeta = useDiagramMetaStore((state) => state.setMeta);
    const setJumpableTagNames = useDiagramMetaStore((state) => state.setJumpableTagNames);

    const projectID = useProjectStore((state) => state.projectID);
    const setProjectID = useProjectStore((state) => state.setProjectID);
    const setProjectName = useProjectStore((state) => state.setProjectName);
    const setProjectFlows = useProjectStore((state) => state.setProjectFlows);

    const setFaultReport = useFaultReportStore((state) => state.setFaultReport);
    const setBottomPanelTab = useBottomPanelStore((state) => state.setBottomPanelTab);

    React.useEffect(() => {
        const searchParams = useSearchParams();
        const id = searchParams.get("id");

        if (id) {
            setProjectID(id);
        }

        if (!meta) {
            const url = "/api/block-meta";
            fetch(url).then((response) => response.json()).then((json) => {
                setMeta(json)
                let jumpableTagNames: Array<string> = [];
                const nodes = json.nodes;
                if (nodes) {
                    Object.entries<any>(nodes).forEach(([key, value]) => {
                        if (value.isJumpable) {
                            jumpableTagNames.push(value.buildTag);
                        }
                    })
                }
                setJumpableTagNames(jumpableTagNames);
            });
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.shiftKey) {
                if (event.key === "P") {
                    console.log("Key pressed:", event.key);
                }
            }
        };

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // window.alert("!!!!!!!!!!!!!!");
            event.preventDefault();
        };

        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [])

    const handleOpenProject = (projectID: string | undefined, projectName: string | undefined) => {
        if (projectID && projectName) {
            setProjectID(projectID);
            setProjectName(projectName);
            getFlowInfos(projectID, true, {
                onOK: (data: any) => {
                    if (data) {
                        const faultReport: FaultReport = {
                            flowFaultList: [],
                            functionFaultList: []
                        }

                        setProjectFlows(data);

                        faultReport.flowFaultList = validateFlows(data, meta);
                        if (faultReport.flowFaultList.length > 0 || faultReport.functionFaultList.length > 0) {
                            setFaultReport(faultReport);
                            setBottomPanelTab("problems");
                        }
                    }
                },
                onError: (message) => {
                    
                }
            });
        }
    };

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline>
                <Box width="100vw" height="100vh">
                    <Header />
                    <Stack width="100%" height={`calc(100vh - ${header_height})`} direction="row">
                        <ProjectExplorer />
                        <FlowEditor />
                        <>
                            <NewFlowDialog />
                            <NewProjectDialog onOK={(projectID, projectName) => handleOpenProject(projectID, projectName)}/>
                            <OpenProjectDialog onOK={(projectID, projectName) => handleOpenProject(projectID, projectName)}/>
                            <KeywordSearchDialog />
                            <RelaseProjectDialog />
                        </>
                    </Stack>
                </Box>
            </CssBaseline>
        </ThemeProvider>
    )
}

export default Page