import { Box } from "@mui/material"


export const TabPanel = (
    props: {
        value: any;
        state: any;
        sx?: object;
        reMount?: boolean;
        children: React.ReactNode;
    }
) => {
    return (
        <Box hidden={props.state !== props.value} sx={props.sx}>
            {
                props.reMount? 
                    props.state === props.value && (
                        <Box sx={{ height: "100%" }}>{props.children}</Box>
                    ) 
                    : props.children
            }
        </Box>
    )
}