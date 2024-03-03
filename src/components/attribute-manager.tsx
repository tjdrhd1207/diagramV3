import { Box, Button, Divider, Grid, IconButton, Stack, Typography } from "@mui/material"
import { attribute_manager_width, editor_tab_height, header_height } from "./global/g-style-vars"
import { red } from "@mui/material/colors"
import { Close } from "@mui/icons-material"


export const AttributeManager = () => {
    return (
        <Box 
            sx={{ 
                width: attribute_manager_width, height: `calc(100vh - ${header_height} - ${editor_tab_height})`, 
                position: "absolute", top: `calc(${header_height} + ${editor_tab_height})`, left: "100%", transform: "translate(-100%, 0%)",
                borderInlineStart: "1px solid",
                bgcolor: "background.paper",
            }}
        >
            <Stack direction="row" sx={{ padding: "6px"}}>
                <Typography variant="body1"
                    sx={{ padding: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >Attribute Manager</Typography>
                <Button sx={{ padding: "8px" }}>save</Button>
                <IconButton sx={{ padding: "8px", borderRadius: "25%", textAlign: "center" }}>
                    <Close fontSize="small" />
                </IconButton>
            </Stack>
            <Divider variant="fullWidth"/>
        </Box>
    )
}