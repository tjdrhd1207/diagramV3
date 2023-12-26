import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText, Collapse, List, Grid, Button } from "@mui/material";
import React, { useState } from "react";

const ToggleListItem = ({
	icon,
	title,
	children,
}) => {
	const [open, setOpen] = React.useState(false);
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

const ToggleSubListItem = ({
	submenus,
}) => {
	return (
		<List dense>
			{submenus.map(menu => {
				const {subtitle} = menu;
				return (
					<ListItemButton
						key={subtitle}
						sx={{
							borderRadius: "10px",
							marginBottom: "5px",
							marginInline: "10px",
						}}
					>
						<ListItemText secondary={subtitle}/>
					</ListItemButton>
				)
			})}
		</List>
	)
}

export {ToggleListItem}
export {ToggleSubListItem}
