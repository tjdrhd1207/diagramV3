import { Accordion, AccordionDetails, AccordionSummary, Box, Collapse, Container, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Typography } from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import EjectIcon from '@mui/icons-material/Eject';
import Inventory2Icon from '@mui/icons-material/Inventory2'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import SettingsIcon from "@mui/icons-material/Settings"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import React from "react";

const serviceMenu = [
	{
		title: "프로젝트 관리",
		submenuItem: ["새 프로젝트", "새 페이지", "프로젝트 열기", "최근 프로젝트", "저장", "모두 저장", "프로젝트 닫기"],
		icon: <FolderIcon />,
	},
	{
		title: "프로젝트 배포",
		submenuItem: ["배포", "소스 형상관리", "시뮬레이터"],
		icon: <EjectIcon />,
	},
	{
		title: "리소스 관리",
		submenuItem: ["멘트 관리", "서비스 코드 관리"],
		icon: <Inventory2Icon />,
	},
	{
		title: "도움말",
		submenuItem: ["버전 정보", "릴리즈 노트", "도움말", "단축기"],
		icon: <TipsAndUpdatesIcon />,
	},
	{
		title: "환경설정",
		submenuItem: [],
		icon: <SettingsIcon />,
	}
]

function ToggleListItem({
	icon,
	title,
	submenus,
}) {
	const [open, setOpen] = React.useState(false);
	return (
		<React.Fragment>
			<ListItemButton 
				onClick={() => setOpen(!open)}
				style={{
					borderRadius: 15,
				}}
			>
				<ListItemIcon>
					{icon}
				</ListItemIcon>
				<ListItemText secondary={title} />
				{open? <ExpandLessIcon /> : <ExpandMoreIcon />}
			</ListItemButton>
			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding dense>
					{submenus.map(menu => {
						return (
							<>
								<ListItemButton
									style={{
										borderRadius: 15
									}}
								>
									<ListItemText key={menu} secondary={menu} />
								</ListItemButton>
							</>
						)
					})}
				</List>
			</Collapse>
		</React.Fragment>
	)
}

export default function MenuBar(props) {
	const [open, setOpen] = React.useState(serviceMenu);
	return (
		// <Box
		// 	style={{
		// 		position: "absolute",
		// 		left: 'calc(var(--menu-width) * -1)',
		// 		transform: props.open? 'translateX(var(--menu-width))' : 'none',
		// 		transition: 'transform 0.4s',
		// 		height: "calc(100vh - var(--header-height))",
		// 		width: 'var(--menu-width)',
		// 		zIndex: 10000,
		// 		borderRight: '1px solid',
		// 		borderColor: 'divider',
		// 	}}
		// >


		// </Box>
		<Drawer
			anchor="left"
			open={props.open}
			onClose={() => props.setOpen(false)}
		>
			<Box
				role="presentation"
				style={{
					height: "100vh",
					width: 'var(--menu-width)',
					flexDirection: 'column',
					// borderRight: '1px solid',
					// borderColor: 'divider',
				}}
				// onClick={() => props.setOpen(false)}
				onKeyDown={() => props.setOpen(false)}
			>
				<List
					aira-aria-labelledby="menu-list"
					component="nav"
					subheader={
						<ListSubheader id="menu-list-subheader">
							ScenarioDesigner v3
						</ListSubheader>
					}
					style={{
						padding: 10
					}}
				>
					{
						serviceMenu.map(item => {
							const { icon, title, submenuItem } = item;
							return (
								<>
									<ToggleListItem icon={icon} title={title} submenus={submenuItem}/>
								</>
							)
						})

					}
				</List>
			</Box>
		</Drawer>
	)
}