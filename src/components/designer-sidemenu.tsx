"use client"

import { useDialogState } from "@/store/dialog-store";
import { useMenuStore } from "@/store/menu-store"
import { Folder } from "@mui/icons-material";
import { Box, Drawer, List, ListItemButton, ListItemText, ListSubheader } from "@mui/material";
import { useBottomPanelStore, useEditorTabState, useFaultReportStore, useFlowEditState, useSearchReportStore } from "@/store/flow-editor-store";
import { useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";
import { getFlowInfos } from "@/service/fetch/crud/flows";
import { buildProject, validateProject } from "@/service/fetch/crud/project";
import { validateFlows, validateScript } from "@/service/all/validate";
import { FaultReport } from "@/service/global";
import { getFunctionsScript } from "@/service/fetch/crud/functions";
import { parseScriptSource } from "@/service/fetch/func/ast";

const sidemenuStyle = {
    height: "100vh",
    width: "calc(100vw * 0.15)",
    // paddingInline: "5px"
}

export const SideMenu = () => {
    const showMenu = useMenuStore((state) => state.showMenu);
    const closeMenu = useMenuStore((state) => state.closeMenu);

    const cleanEditMode = useFlowEditState((state) => state.clean);
    const cleanEditorTab = useEditorTabState((state) => state.clean);
    const cleanProject = useProjectStore((state) => state.clean);
    const cleanSearchReport = useSearchReportStore((state) => state.clean);
    const cleanFaultReport = useFaultReportStore((state) => state.clean);

    const projectID = useProjectStore((state) => state.projectID);
    const meta = useDiagramMetaStore((state) => state.meta);

    const setBottomPanelTab = useBottomPanelStore((state) => state.setBottomPanelTab);

    const setFaultReport = useFaultReportStore((state) => state.setFaultReport);

    const setOpenKeywordSearchDialog = useDialogState((state) => state.setOpenKeywordSearchDialog);
    const setOpenReleaseProjectDialog = useDialogState((state) => state.setOpenReleaseProjectDialog);

    const handleKeywordSearch = () => {
        setOpenKeywordSearchDialog(true);
    };

    const handleBuildProject = async () => {
        const faultReport: FaultReport = {
            flowFaultList: [],
            functionFaultList: []
        };
        
        await validateProject(projectID, {
            onOK: (data: any) => {
                if (data) {
                    const { faultReport } = data;
                    if (faultReport) {
                        const { flowFaultList, functionFaultList } = faultReport;
                        faultReport.flowFaultList = flowFaultList? [...flowFaultList] : [];
                        faultReport.functionFaultList = functionFaultList? [...functionFaultList] : [];
                    }
                }
            },
            onError: (message) => {}
        });

        if (faultReport.flowFaultList.length > 0 || faultReport.functionFaultList.length > 0) {
            console.log(faultReport);
            setFaultReport(faultReport);
        }
        setBottomPanelTab("problems");

        await buildProject(projectID, {
            onOK: (data: any) => {

            },
            onError: (message) => {}
        })
    }

    const handleReleaseProject = () => {
        setOpenReleaseProjectDialog(true);
    }

    const handleClean = () => {
        cleanEditMode();
        cleanEditorTab();
        cleanProject();
        cleanSearchReport();
        cleanFaultReport();
    };
    
    const serviceMenu = [
        {
            group: "Project",
            subItems: [
                { title: "New Project", icon: <Folder />, onClick: useDialogState((state) => state.openNewProjectDialog), disable: false },
                { title: "Open Project", icon: <Folder />, onClick: useDialogState((state) => state.openOpenProjectDialog), disable: false},
                { title: "Import Project", icon: <Folder />, disable: true },
                { title: "Open Recent", icon: <Folder />, disable: true },
                { title: "Export Project", icon: <Folder />, disable: projectID? false : true, onClick: () => closeMenu(),
                    href: `/api/project?action=export&id=${projectID}`
                },
                { title: "Close Project", icon: <Folder />, disable: projectID? false : true, onClick: handleClean },
            ],
        },
        {
            group: "Edit",
            subItems: [
                { title: "Save", icon: <Folder />, disable: true },
                { title: "Save All", icon: <Folder />, disable: true },
                { title: "Keyword Search", icon: <Folder />, disable: projectID? false : true, onClick: handleKeywordSearch },
            ]
        },
        {
            group: "Resource",
        },
        {
            group: "Deploy & Debug",
            subItems: [
                { title: "Build Project", icon: <Folder />, disable: projectID? false : true, onClick: handleBuildProject },
                { title: "Release & Deploy", icon: <Folder />, disable: projectID? false : true, onClick: handleReleaseProject },
            ]
        },
        {
            group: "Help",
            subItems: [
                { title: "Keyboard shortcuts", icon: <Folder />, disable: true }
            ]
        }
    ]

    return (
        <Drawer anchor="left" open={showMenu} onClose={closeMenu}>
            <Box sx={sidemenuStyle}>
                {
                    serviceMenu.map((menu) =>
                        <List dense key={menu.group}
                            subheader={
                                <ListSubheader>{menu.group}</ListSubheader>
                            }
                        >
                            {
                                menu.subItems?.map((item) =>
                                    <ListItemButton key={item.title} disabled={item.disable} href={item.href? item.href : ""}
                                        onClick={item.onClick? () => {item.onClick(), closeMenu()} : undefined}
                                    >
                                        {/* <ListItemIcon>
                                            {item.icon}
                                        </ListItemIcon> */}
                                        <ListItemText primary={item.title} />
                                    </ListItemButton>
                                )
                            }
                        </List>
                    )
                }
            </Box>
        </Drawer>
    )
}