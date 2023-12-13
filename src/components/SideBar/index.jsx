import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import React from "react";
import BlockPallete from "./BlockPallete";

function CustomTabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<>
					{children}
				</>
			)}
		</div>
	);
}

export default function SideBar() {
	const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<Container
			disableGutters
			sx={{
				width: "var(--sidebar-width)",
				height: "calc(100vh - var(--header-height))",
				borderRight: "1px solid lightgray",
				flexDirection: "column",
			}}
		>
			<Box
				sx={{
					borderBottom: "1px solid",
					borderColor: "lightgray",
				}}
				>
				<Tabs
					value={value}
					onChange={handleChange}
					variant="fullWidth"
					aria-label="SideBar Tabs"
					sx={{
						width: "var(--sidebar-width)",
					}}
				>
					<Tab label="BLOCK"></Tab>
					<Tab label="EXPLORER"></Tab>
				</Tabs>
			</Box>
			<CustomTabPanel value={value} index={0}>
				<BlockPallete />
			</CustomTabPanel>
			<CustomTabPanel value={value} index={1}>
			</CustomTabPanel>
		</Container>
	)
}