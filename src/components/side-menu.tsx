"use client"

import { useDialogState } from "@/store/dialog-store";
import { useMenuStore } from "@/store/menu-store"
import { Folder } from "@mui/icons-material";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { side_menu_width } from "@/consts/g-style-vars";
import { useEditorTabState, useFlowEditState } from "@/store/flow-editor-store";
import { useProjectStore } from "@/store/workspace-store";

const sidemenuStyle = {
    height: "100vh",
    width: `${side_menu_width}`,
    paddingInline: "5px"
}

export const SideMenu = () => {
    const showMenu = useMenuStore((state) => state.showMenu);
    const closeMenu = useMenuStore((state) => state.closeMenu);

    const cleanEditMode = useFlowEditState((state) => state.clean);
    const cleanEditorTab = useEditorTabState((state) => state.clean);
    const cleanProject = useProjectStore((state) => state.clean);
    const cleanMeta = useProjectStore((state) => state.clean);

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
                { title: "New Project", icon: <Folder />, onClick: useDialogState((state) => state.openNewProjectDialog) },
                { title: "Open Project", icon: <Folder />, onClick: useDialogState((state) => state.openOpenProjectDialog)},
                { title: "Import Project", icon: <Folder /> },
                { title: "Open Recent", icon: <Folder /> },
                { title: "Save", icon: <Folder /> },
                { title: "Save All", icon: <Folder /> },
                { title: "Export Project", icon: <Folder /> },
                { title: "Close Project", icon: <Folder />, onClick: handleClean },
            ],
        },
        {
            group: "Resource",
        },
        {
            group: "Deploy",
        },
        {
            group: "Help",
        }
    ]

    return (
        <Drawer anchor="left" open={showMenu} sx={{ width: "240px" }} onClose={closeMenu}>
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
                                    <ListItemButton key={item.title} 
                                        onClick={item.onClick? () => {item.onClick(), closeMenu()} : undefined}
                                    >
                                        <ListItemIcon>
                                            {item.icon}
                                        </ListItemIcon>
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