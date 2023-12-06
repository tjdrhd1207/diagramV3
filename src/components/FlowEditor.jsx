import React, { useEffect } from 'react'
import { Popper } from '@mui/base/Popper';
import { Tabs, TabList, Tab, TabPanel, Box, Menu, MenuItem, MenuList, Sheet } from "@mui/joy";
import { styled } from '@mui/joy/styles';
import { AddBox } from '@mui/icons-material';

const Popup = styled(Popper)({
	zIndex: 1000,
});

export default function FlowEditor() {
	const [contextMenu, setContextMenu] = React.useState(null);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [pageList, setPageList] = React.useState(
		[
			{pagename: "page1", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page2", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page3", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page4", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page5", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page6", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page7", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page8", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page9", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page10", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page11", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page12", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page13", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page14", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page15", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page16", contextmenu: (event) => handleContextMenu(event), },
			{pagename: "page17", contextmenu: (event) => handleContextMenu(event), },
		]
	)

	useEffect(() => {
		window.addEventListener('resize', handleContextMenuClose);
		return () => {
			window.addEventListener('resize', handleContextMenuClose);
		}
	}, []);

	const handleContextMenu = (event) => {
		event.preventDefault();
		// setContextMenu(
		// 	contextMenu === null
		// 	? {
		// 		mouseX: event.clientX,
		// 		mouseY: event.clientY,
		// 	} : null,
		// );
		setContextMenu(
			{
				mouseX: event.clientX,
				mouseY: event.clientY,
			}
		);
		setAnchorEl(event.currentTarget);
	}

	const handleContextMenuClose = () => {
		setContextMenu(null);
		setAnchorEl(null);
	};

	const addNewPage = (pagename, contextmenu) => {
		setPageList([...pageList , {pagename, contextmenu}]);
	}

	const delPage = () => {

	}

	return (
		<>
			<Tabs
				aria-label="Basic tabs"
				defaultValue={0}
				variant="soft"
				sx={{
					mt: 'var(--Header-height)',
				}}
				onClick={handleContextMenuClose}
			>
				<TabList
					sx={{
						overflow: 'auto',
						// scrollSnapType: 'x mandatory',
						'&::-webkit-scrollbar': { 
							// display: 'none' 
						},
					}}
				>
					{pageList.map((page, index) => {
						const {pagename, contextmenu} = page;
						return (
							<Tab 
								key={pagename} 
								value={index}
								sx={{
									flex: 'none',
								}}
								onContextMenu={contextmenu}
							>
								{pagename}
							</Tab>
						)
					})}
					
					<Tab onClick={() => addNewPage("untitled-" + pageList.length, (event) => handleContextMenu(event))} >
						<AddBox />
					</Tab>
				</TabList>
				{/* <TabPanel value={0}>
					<b>First</b> tab panel
				</TabPanel>
				<TabPanel value={1}>
					<b>Second</b> tab panel
				</TabPanel>
				<TabPanel value={2}>
					<b>Third</b> tab panel
				</TabPanel> */}
			</Tabs>
			<Popup
				id='tab-menu'
				size='sm'
				open={contextMenu !== null}
				onClose={handleContextMenuClose}
				onClick={handleContextMenuClose}
				anchorEl={anchorEl}
				disablePortal
				transition
			>
				<MenuList
					size='sm'
					sx={
						contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
					}
					onContextMenu={(event) => event.preventDefault()}
				>
					<MenuItem>현재 페이지 닫기</MenuItem>
					<MenuItem>다른 페이지 모두 닫기</MenuItem>
					<MenuItem>모든 페이지 닫기</MenuItem>
				</MenuList>
			</Popup>
		</>
	)
}