import React from 'react'
import { Tabs, TabList, Tab, TabPanel, Box, Menu, MenuItem } from "@mui/joy";

export default function FlowEditor() {
	const [contextMenu, setContextMenu] = React.useState(null);
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleContextMenu = (event) => {
		event.preventDefault();
		console.log(contextMenu === null);
		setContextMenu(
			contextMenu === null ?
			{
				mouseX: event.clientX,
				mouseY: event.clientY,
			} : null
		);
		setAnchorEl(event.currentTarget);
		console.log(contextMenu);
	}

	const handleContextMenuClose = () => {
		setContextMenu(null);
		setAnchorEl(null);
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
				id='tab-menu'
				size='sm'
				open={contextMenu !== null}
				onClose={handleContextMenuClose}
				onClick={handleContextMenuClose}
				anchorEl={anchorEl}
				// transition
				// sx={
				// 	contextMenu !== null ? { top: contextMenu.mouseX, left: contextMenu.mouseY } : undefined
				// }
			>
				<MenuItem>현재 페이지 닫기</MenuItem>
				<MenuItem>다른 페이지 모두 닫기</MenuItem>
				<MenuItem>모든 페이지 닫기</MenuItem>
			</Menu>
		</Box>
	)
}