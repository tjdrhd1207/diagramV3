import { Box } from "@mui/material"

export interface TabState {
    tab: any,
    setTab: (value: any) => void,
}

export const TabPanel = (
    props: {
        value: any,
        state: any,
        sx?: object,
        children: React.ReactNode
    }
) => {
    return (
        <Box hidden={props.state !== props.value} sx={props.sx}>
            {
                props.state === props.value && (
                    <Box sx={{ height: "100%" }}>{props.children}</Box>
                )
            }
        </Box>
    )
}