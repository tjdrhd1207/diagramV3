import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import FolderIcon from '@mui/icons-material/Folder';
import EjectIcon from '@mui/icons-material/Eject';
import Inventory2Icon from '@mui/icons-material/Inventory2'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import SettingsIcon from "@mui/icons-material/Settings"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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

export default function MenuBar(props) {
	const [open, setOpen] = React.useState(serviceMenu);
	console.log(open, setOpen);
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
					// borderRight: '1px solid',
					// borderColor: 'divider',
				}}
				// onClick={() => props.setOpen(false)}
				onKeyDown={() => props.setOpen(false)}
			>
				<List
					aira-aria-labelledby="menu-list"
					subheader={
						<ListSubheader id="menu-list-subheader">
							WebD v2
						</ListSubheader>
					}
					
				>
					{
						serviceMenu.map(item => {
							let icon = item.icon
							let title = item.title;
							let submenuItem = item.submenuItem;
							return (
								<ListItemButton key={title}>
									<ListItemIcon>
										{icon}
									</ListItemIcon>
									<ListItemText primary={title} />
								</ListItemButton>
							)
						})

					}
				</List>
			</Box>
		</Drawer>
	)
}