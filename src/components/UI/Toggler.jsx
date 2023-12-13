import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText, Collapse, List, Grid, Button } from "@mui/material";
import React, { useState } from "react";
import { DraggableDialog } from "./Dialog";

export const ToggleListItem = ({
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

export const ToggleSubBlockItem = ({
	subblocks,
}) => {
	return (
		<>
			{
				subblocks ?
					<Grid container spacing={1} columns={1}>
						{
							subblocks.map(block => {
								return (
									<Grid item key={block} xs={1}>
										<Button fullWidth size="small" variant="outlined" sx={{ display: "flex", fontSize: "10px" }}>{block}</Button>
									</Grid>
								)
							})
						}
					</Grid>
					:
					undefined
			}
		</>
	)
}

const SubItem = ({
	name: subtitle,
	dialog,
}) => {
	const [open, setOpen] = useState(false);
	// console.log(subtitle, <DialogRef />);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<ListItemButton
				key={subtitle}
				sx={{
					borderRadius: "10px",
					marginBottom: "5px",
					marginInline: "10px",
				}}
			>
				<ListItemText key={subtitle} secondary={subtitle} onClick={dialog? handleClickOpen : undefined}/>
			</ListItemButton>
			{dialog? <DraggableDialog open={open} handleClose={handleClose} /> : ""}
		</>
	)
}

export const ToggleSubListItem = ({
	submenus
}) => {
	return (
		<List component="div" dense>
			{submenus.map(menu => {
				return (
					<SubItem key={menu.subtitle} name={menu.subtitle} dialog={menu.dialog} />
				)
			})}
		</List>
	)
}