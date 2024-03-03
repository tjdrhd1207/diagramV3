"use client"

import { useMenuStore } from "@/store/menu-store"
import { Menu } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import { SideMenu } from "./side-menu";

const headerStyle = {
    height: "60px",
    width: "1",
    borderBlockEnd: "1px solid",
    paddingInline: "10px"
}

const Header = () => {
    const openMenu = useMenuStore((state) => state.openMenu);

    return (
        <Stack direction="row" gap={1} alignItems="center" sx={headerStyle}>
            <IconButton onClick={openMenu} sx={{ borderRadius: "25%" }}>
                <Menu />
            </IconButton>
            <Typography variant="h6">ScenarioDesigner V3</Typography>
            <SideMenu />
        </Stack>
    )
}

export { Header }