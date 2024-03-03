import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText, Collapse, List, Grid, Button, Stack, Typography } from "@mui/material";
import React, { useState } from "react";

const ToggleListItemButton = ({
	icon,
	title,
	children,
}) => {
	const [open, setOpen] = React.useState(true);
	return (
		<React.Fragment>
			<ListItemButton
				onClick={() => setOpen(!open)}
				sx={{
					borderRadius: "10px",
					marginBlock: "5px"
				}}
			>
				{
					icon ?
						<ListItemIcon>
							{icon}
						</ListItemIcon>
						:
						undefined
				}
				<ListItemText primary={title} />
				{open ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>
			<Collapse in={open} timeout="auto" unmountOnExit>
				{children}
			</Collapse>
		</React.Fragment>
	)
}

const ToggleContents = ({
	title,
	children
}) => {
	const [expanded, setExpanded] = React.useState(false);

	const handleSetOpen = () => {
		setExpanded(!expanded);
	}

	return (
		<Stack>
			<Stack
				direction="row"
				alignItems="center"
				onClick={handleSetOpen}
			>
				{expanded ? <ExpandLess /> : <ExpandMore />}
				<Typography variant="button">
					{title}
				</Typography>
			</Stack>
			<Collapse
					in={expanded}
					timeout="auto"
					unmountOnExit
			>
					{children}
			</Collapse>
		</Stack>
	)
}

export { ToggleListItemButton }
export { ToggleContents }