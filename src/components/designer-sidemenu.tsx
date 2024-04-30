"use client"

import { useDialogState } from "@/store/dialog-store";
import { useMenuStore } from "@/store/menu-store"
import { Folder } from "@mui/icons-material";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { side_menu_width } from "@/consts/g-style-vars";
import { useEditorTabState, useFlowEditState } from "@/store/flow-editor-store";
import { useProjectStore } from "@/store/workspace-store";
import { EllipsisLabel } from "./common/typhography";

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
    const projectName = useProjectStore((state) => state.projectName);

    const handleExportProject = () => {
        console.log(projectID, projectName);
        if (projectID && projectName) {
            fetch(`/api/project/${projectID}?action=export`, {
                    method: "POST",
                    cache: "no-cache"
                }).then((response) => response.blob()).then((blob) => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute("download", `${projectName}.zip`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                }).catch(error => console.error("파일 가져오기 중 오류:", error));
        }
    }

    const handleClean = () => {
        cleanEditMode();
        cleanEditorTab();
        cleanProject();
        cleanMeta();
    }
    
    const serviceMenu = [
        {
            group: "Project",
            subItems: [
                { title: "New Project", icon: <Folder />, onClick: useDialogState((state) => state.openNewProjectDialog), disable: false },
                { title: "Open Project", icon: <Folder />, onClick: useDialogState((state) => state.openOpenProjectDialog), disable: false},
                { title: "Import Project", icon: <Folder />, disable: true },
                { title: "Open Recent", icon: <Folder />, disable: true },
                { title: "Export Project", icon: <Folder />, disable: projectID? false : true, onClick: handleExportProject },
                { title: "Close Project", icon: <Folder />, disable: projectID? false : true, onClick: handleClean },
            ],
        },
        {
            group: "Edit",
            subItems: [
                { title: "Save", icon: <Folder />, disable: true },
                { title: "Save All", icon: <Folder />, disable: true },
                { title: "Find", icon: <Folder />, disable: false },
            ]
        },
        {
            group: "Resource",
        },
        {
            group: "Deploy & Debug",
            subItems: [
                { title: "Create Snapshot", icon: <Folder />, disable: true },
                { title: "Deploy", icon: <Folder />, disable: true },
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
                                    <ListItemButton key={item.title} disabled={item.disable}
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