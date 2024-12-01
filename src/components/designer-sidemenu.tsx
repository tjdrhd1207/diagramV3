"use client"

import { useDialogState } from "@/store/dialog-store";
import { useMenuStore } from "@/store/menu-store"
import { Folder } from "@mui/icons-material";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { side_menu_width } from "@/consts/g-style-vars";
import { useEditorTabState, useFlowEditState } from "@/store/flow-editor-store";
import { useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";
import { EllipsisLabel } from "./common/typhography";
import { getFlowInfos } from "@/service/fetch/crud/flows";
import { searchFromFlows } from "@/service/all/search";
import { buildProject } from "@/service/fetch/crud/project";

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
    const cleanMeta = useProjectStore((state) => state.clean);

    const projectID = useProjectStore((state) => state.projectID);

    const setOpenKeywordSearchDialog = useDialogState((state) => state.setOpenKeywordSearchDialog);
    const setOpenReleaseProjectDialog = useDialogState((state) => state.setOpenReleaseProjectDialog);

    const handleKeywordSearch = () => {
        setOpenKeywordSearchDialog(true);
    };

    const handleBuildProject = () => {
        buildProject(projectID, {
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
        cleanMeta();
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