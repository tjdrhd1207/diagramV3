import React, { useEffect } from 'react'
import { Popper } from '@mui/base/Popper';
import { Tabs, TabList, Tab, TabPanel, Box, Menu, MenuItem, MenuList } from "@mui/joy";
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
			{pagename: "ivrmain", contextmenu: (event) => handleContextMenu(event), },
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

	return (
		<Box
			onClick={handleContextMenuClose}
			onResize={handleContextMenuClose}
			sx={{
				// flexGrow: 1,
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
					// width: "500px",
					mt: 'var(--Header-height)',
				}}
			>
				<TabList
					sx={{
						overflow: 'scroll',
						scrollSnapType: 'x mandatory',
						scrollSnapAlign: 'end',
						'&::-webkit-scrollbar': { display: 'none' },
					}}
				>
					{pageList.map((page, index) => {
						const {pagename, contextmenu} = page;
						return (
							<Tab 
								key={pagename} 
								onContextMenu={contextmenu}
								sx={{
									flex: 'none',
									
								}}
							>
								{pagename}
							</Tab>
						)
					})}
					
					<Tab>
						<AddBox onClick={() => addNewPage("untitled-" + pageList.length, (event) => handleContextMenu(event))} />
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
		</Box>
	)
}