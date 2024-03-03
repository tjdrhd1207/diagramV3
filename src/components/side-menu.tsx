import { useDialogState } from "@/store/dialog-store";
import { useMenuStore } from "@/store/menu-store"
import { Folder } from "@mui/icons-material";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { side_menu_width } from "./global/g-style-vars";

const sidemenuStyle = {
    height: "100vh",
    width: `${side_menu_width}`,
    paddingInline: "5px"
}

export const SideMenu = () => {
    const showMenu = useMenuStore((state) => state.showMenu);
    const closeMenu = useMenuStore((state) => state.closeMenu);
    
    const serviceMenu = [
        {
            group: "Project",
            subItems: [
                { title: "New Project", icon: <Folder />, setOpen: useDialogState((state) => state.openNewProjectDialog) },
                { title: "Open Project", icon: <Folder />, setOpen: useDialogState((state) => state.openOpenProjectDialog)},
                { title: "Import Project", icon: <Folder /> },
                { title: "Open Recent", icon: <Folder /> },
                { title: "Save", icon: <Folder /> },
                { title: "Save All", icon: <Folder /> },
                { title: "Close Project", icon: <Folder /> },
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
                {/* <Typography variant="body1">ScenarioDesigner v3</Typography> */}
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
                                        onClick={item.setOpen? () => {item.setOpen(), closeMenu()} : undefined}
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