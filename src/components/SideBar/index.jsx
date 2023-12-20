import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import React from "react";
import BlockPallete from "./BlockPallete";

function CustomTabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<Box
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
		</Box>
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
				marginInline: "0px",
				borderRight: "1px solid lightgray",
				flexDirection: "column",
			}}
		>
			<Tabs
				value={value}
				onChange={handleChange}
				variant="fullWidth"
				aria-label="SideBar Tabs"
				sx={{
					width: "var(--sidebar-width)",
					borderBottom: "1px solid"
				}}
			>
				<Tab label="BLOCK"></Tab>
				<Tab label="EXPLORER"></Tab>
			</Tabs>
			<CustomTabPanel value={value} index={0}>
				<BlockPallete />
			</CustomTabPanel>
			<CustomTabPanel value={value} index={1}>
			</CustomTabPanel>
		</Container>
	)
}