"use client"

import { useMenuStore } from "@/store/menu-store"
import { Menu, SearchTwoTone } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { SideMenu } from "./designer-sidemenu";
import { FormText } from "./common/form";

const headerStyle = {
    height: "60px",
    width: "1",
    borderBlockEnd: "1px solid",
    paddingInline: "10px"
}

const Header = () => {
    const openMenu = useMenuStore((state) => state.openMenu);

    return (
        <Stack width="100%" direction="row" gap={1} alignItems="center" sx={headerStyle}>
            <Stack width="90%" direction="row">
                <IconButton onClick={openMenu} sx={{ borderRadius: "25%" }}>
                    <Menu />
                </IconButton>
                <Typography variant="h6">ScenarioDesigner V3</Typography>
            </Stack>
            <Box width="10%">
                <FormText formTitle="find" formValue="" onFormChanged={() => {}} endAdornment={<SearchTwoTone fontSize="small" />}/>
            </Box>
            <SideMenu />
        </Stack>
    )
}

export { Header }