import { Box, Container, Tab, Tabs } from "@mui/material";
import React from "react";

export default function FlowEditor() {
	const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<>
			<Container
				disableGutters
				sx={{
					height: "calc(100vh - var(--header-height))",
					width: "calc(100vw - var(--sidebar-width) - var(--attrbar-width))",
					// zIndex: -1,
				}}
			>
				<Box>
					<Tabs
						value={value}
						onChange={handleChange}
						variant="scrollable"
						scrollButtons="auto"
						aria-label="scrollable auto page tabs"
					>
						<Tab label="Item One" />
						<Tab label="Item Two" />
						<Tab label="Item Three" />
						<Tab label="Item Four" />
						<Tab label="Item Five" />
						<Tab label="Item Six" />
						<Tab label="Item Seven" />
					</Tabs>
				</Box>
			</Container>
		</>
	)
}