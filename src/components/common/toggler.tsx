import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, Stack, Typography } from "@mui/material"
import React from "react"

export const ToggleContents = (
    props: {
        title: string,
        children: React.ReactNode
    }
) => {
    const [expanded, setExpanded] = React.useState(false);

	const handleSetOpen = () => {
		setExpanded(!expanded);
	}

    return (
        <>
            <Stack direction="row" alignItems="center" onClick={handleSetOpen}>
                {expanded? <ExpandLess /> : <ExpandMore />}
                <Typography variant="body2">{props.title}</Typography>
            </Stack>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                {props.children}
            </Collapse>
        </>
    )
}