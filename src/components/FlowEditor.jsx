import React from 'react'
import { Tabs, TabList, Tab, TabPanel, Box, Menu, MenuItem } from "@mui/joy";

export default function FlowEditor() {
	const [contextMenu, setContextMenu] = React.useState(null);

	const handleContextMenu = (event) => {
		event.preventDefault();
		setContextMenu(
			{
				mouseX: event.clientX + 2,
				mouseY: event.clientY - 6,
			},
		);
	}

	const handleContextMenuClose = () => {
		setContextMenu(null);
	};

	return (
		<Box
			sx={{
				flexGrow: 1,
			}}
		>
			<Tabs
				aria-label="Basic tabs"
				defaultValue={0}
				variant="soft"
				sx={{
					"--Tab-indicatorThickness": "4px",
					flexGrow: 1,
					height: "100vh",
					mt: 'var(--Header-height)',
				}}

			>
				<TabList
					onContextMenu={handleContextMenu}
				>
					<Tab>First tab</Tab>
					<Tab>Second tab</Tab>
					<Tab>Third tab</Tab>
				</TabList>
				<TabPanel value={0}>
					<b>First</b> tab panel
				</TabPanel>
				<TabPanel value={1}>
					<b>Second</b> tab panel
				</TabPanel>
				<TabPanel value={2}>
					<b>Third</b> tab panel
				</TabPanel>
			</Tabs>
			<Menu
				open={contextMenu !== null}
				onClose={handleContextMenuClose}
				onClick={handleContextMenuClose}
			>
				<MenuItem>현재 페이지 닫기</MenuItem>
				<MenuItem>다른 페이지 모두 닫기</MenuItem>
				<MenuItem>모든 페이지 닫기</MenuItem>
			</Menu>
		</Box>
	)
}