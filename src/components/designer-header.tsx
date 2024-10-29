"use client"

import { useMenuStore } from "@/store/menu-store"
import { Menu, SearchTwoTone } from "@mui/icons-material";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { SideMenu } from "./designer-sidemenu";
import { useProjectStore } from "@/store/workspace-store";

const headerStyle = {
    height: "60px",
    width: "1",
    borderBlockEnd: "1px solid",
    paddingInline: "10px"
}

const Header = () => {
    const openMenu = useMenuStore((state) => state.openMenu);

    const projectID = useProjectStore((state) => state.projectID);

    return (
        <Stack width="100%" height="100%" direction="row" gap={1} sx={headerStyle}>
            <Box height="100%" alignContent="center">
                <IconButton onClick={openMenu} sx={{ borderRadius: "25%" }}>
                    <Menu />
                </IconButton>
            </Box>
            <Stack width="100%" height="100%" direction="row" gap={1}>
                <Box height="100%" display="flex" flexDirection="column" justifyContent="center">
                    <Typography variant="h6">ScenarioDesigner V3</Typography>
                </Box>
                <Box height="100%" width="30%" alignContent="center">
                    {
                        projectID && <Chip label={projectID} variant="outlined"/>
                    }
                </Box>
            </Stack>
            {/* <Box width="10%">
                <FormText formTitle="find" formValue="" onFormChanged={() => {}} endAdornment={<SearchTwoTone fontSize="small" />}/>
            </Box> */}
            <SideMenu />
        </Stack>
    )
}

export { Header }