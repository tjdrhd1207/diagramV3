import { Box, Container, Tab, Tabs } from "@mui/material";
import React from "react";
import BlockPallete from "./BlockPallete";
import ProjectExplorer from "./ProjectExplorer";

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

export default function PrimnarySideBar() {
	const [value, setValue] = React.useState(0);

	const handleChange = (event, value) => {
		setValue(value);
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
					borderBottom: "1px solid",
				}}
			>
				<Tab label="EXPLORER" />
				<Tab label="BLOCK" />
			</Tabs>
			<CustomTabPanel value={value} index={0}>
				<ProjectExplorer />
			</CustomTabPanel>
			<CustomTabPanel value={value} index={1}>
				<BlockPallete />
			</CustomTabPanel>
		</Container>
	)
}