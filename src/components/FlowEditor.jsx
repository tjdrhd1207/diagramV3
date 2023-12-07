import React, { useEffect } from 'react'
import { Popper } from '@mui/base/Popper';
import { Tabs, TabList, Tab, TabPanel, Box, Menu, MenuItem, MenuList, Sheet, GlobalStyles, Grid, Button, ButtonGroup, IconButton, Stack, Typography } from "@mui/joy";
import { styled } from '@mui/joy/styles';
import { AddBox, ArrowLeft, ArrowRight, Settings } from '@mui/icons-material';
import BlockPallete from './BlockPallete';

const Popup = styled(Popper)({
	zIndex: 1000,
});

export default function FlowEditor() {
	const [contextMenu, setContextMenu] = React.useState(null);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [pageList, setPageList] = React.useState(
		[
			{ pagename: "page1", contextmenu: (event) => handleContextMenu(event), },
			{ pagename: "page2", contextmenu: (event) => handleContextMenu(event), },
			{ pagename: "page3", contextmenu: (event) => handleContextMenu(event), },
			{ pagename: "page4", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page5", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page6", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page7", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page8", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page9", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page10", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page11", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page12", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page13", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page14", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page15", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page16", contextmenu: (event) => handleContextMenu(event), },
			// { pagename: "page17", contextmenu: (event) => handleContextMenu(event), },
		]
	)
	const [hideSideBar, setHideSideBar] = React.useState(false)

	useEffect(() => {
		window.addEventListener('resize', handleContextMenuClose);
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
		setPageList([...pageList, { pagename, contextmenu }]);
	}

	const delPage = () => {

	}

	return (
		<>
		<Sheet
			variant="soft"
			sx={{
				mt: 'var(--Header-height)',
				// ml: hideSideBar? undefined : 'var(--SideBar-width)',
				height: 'var(--Tab-height)',
				zIndex: 10005,
				overflow: 'clip',
				"&:hover": {
					overflow: 'unset'
				},
				display: 'none',
			}}
		>
			<Stack
				spacing={0}
				direction="row"
				flexWrap="wrap"
				useFlexGap
				sx={{
					
					height: '100%',
					textAlign: 'center',
				}}
			>
			<Box display='flex' alignItems='center' sx={{ height: '100%', }}><Typography width='100%'>Item 1</Typography></Box>
			<Box sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'} }>Lo~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ng Item 1</Box>
		</Stack>
		</Sheet >
			<Tabs
				defaultValue={0}
				variant="soft"
				sx={{
					// display: 'none',
					mt: 'var(--Header-height)',
					// ml: hideSideBar? undefined : 'var(--SideBar-width)',
					height: 'var(--Tab-height)'
				}}
				onClick={handleContextMenuClose}
			>
				<TabList
					tabFlex="auto"
					sx={{
						overflow: 'hidden',
						height: '100%',
						// '&::-webkit-scrollbar': { display: 'none' },
					}}
				>
					{pageList.map((page, index) => {
						const { pagename, contextmenu } = page;
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
					{/* <Button>1</Button> */}
					<Tab
						value={pageList.length}
						disableIndicator
						sx={{
						}}
					>
						<AddBox
							onClick={() => addNewPage("untitled-" + pageList.length, (event) => handleContextMenu(event))}
							sx={{
								transition: 'all ease 1s',
								"&:hover": {
									color: 'green',
									transform: 'rotate(90deg)'
								}
							}}
						/>
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
			<Sheet
				sx={{
					mt: 'calc(var(--Header-height))',
					position: 'absolute',
					top: '0px',
					width: 'var(--SideBar-width)',
					height: 'calc(100dvh - var(--Tab-height) - var(--Header-height))',
					display: 'flex',
					flexShrink: 0,
					flexDirection: 'column',
					// borderRight: '1px solid',
					// borderColor: 'divider',
					background: 'none'
				}}
			>
				<GlobalStyles
					styles={(theme) => ({
						':root': {
							'--SideBar-width': '200px',
							'--Tab-height': '40px',
						},
					})}
				/>
				<Grid container spacing={0} columns={20} sx={{ flexGrow: 1 }}>
					<Grid xs={19}>
						<Box
							sx={{
								display: 'flex',
								height: '100%',
								transform: {
									xs: hideSideBar ? 'translateX(calc(100% * -1))' : undefined,
								},
								// transition: 'transform 0.4s, width 0.4s',
								// borderRight: '1px solid',
								// borderColor: 'divider',
							}}
						>
							<BlockPallete />
						</Box>
					</Grid>
					<Grid xs={1}>
						<Box
							alignItems="center"
							justifyContent="center"
							sx={{
								display: 'flex',
								height: '100%',
								transform: {
									xs: hideSideBar ? 'translateX(calc((var(--SideBar-width) - 10px) * -1))' : undefined,
								},
								transition: 'transform 0.4s, width 0.4s',
								"&:hover": {
									background: 'lightgrey',
									// border: '1px inset'
								},
							}}
							onClick={() => setHideSideBar(!hideSideBar)}
						>
							{/* {!hideSideBar ? <ArrowLeft /> : <ArrowRight />} */}
						</Box>
					</Grid>
				</Grid>
			</Sheet>
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
					<MenuItem>새 페이지</MenuItem>
					<MenuItem>현재 페이지 닫기</MenuItem>
					<MenuItem>다른 페이지 모두 닫기</MenuItem>
					<MenuItem>모든 페이지 닫기</MenuItem>
				</MenuList>
			</Popup>
		</>
	)
}