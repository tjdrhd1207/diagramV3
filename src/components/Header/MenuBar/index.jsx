import { Folder, Eject, Inventory2, TipsAndUpdates, Settings } from "@mui/icons-material";
import { Box, Collapse, Drawer, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import React from "react";
import { ToggleListItem, ToggleSubListItem } from "../../UI/Toggler";
import { DraggableDialog } from "../../UI/Dialog";

const ServiceMenu = [
	{
		title: "프로젝트 관리",
		submenuItem: [
			{subtitle: "새 프로젝트", dialog: undefined}, ,
			{subtitle: "새 페이지", dialog: undefined},
			{subtitle: "프로젝트 열기", dialog: "DraggableDialog"},
			{subtitle: "최근 프로젝트", dialog: undefined},
			{subtitle: "저장", dialog: undefined},
			{subtitle: "모두 저장", dialog: undefined},
			{subtitle: "프로젝트 닫기", dialog: undefined}
		],
		icon: <Folder />,
	},
	{
		title: "프로젝트 배포",
		submenuItem: [
			{subtitle: "배포", dialog: undefined},
			{subtitle: "소스 형상관리", dialog: undefined},
			{subtitle: "시뮬레이터", dialog: undefined},
		],
		icon: <Eject />,
	},
	{
		title: "리소스 관리",
		submenuItem: [
			{subtitle: "멘트 관리", dialog: undefined},
			{subtitle: "서비스 코드 관리", dialog: undefined},
		],
		icon: <Inventory2 />,
	},
	{
		title: "도움말",
		submenuItem: [
			{subtitle: "버전 정보", dialog: undefined},
			{subtitle: "릴리즈 노트", dialog: undefined},
			{subtitle: "도움말", dialog: undefined},
			{subtitle: "단축기", dialog: undefined},
		],
		icon: <TipsAndUpdates />,
	},
	{
		title: "환경설정",
		submenuItem: [],
		icon: <Settings />,
	}
]

export default function MenuBar(props) {
	return (
		<Drawer
			anchor="left"
			open={props.open}
			onClose={() => props.setOpen(false)}
		>
			<Box
				role="presentation"
				sx={{
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
					sx={{
						padding: "10px"
					}}
				>
					{
						ServiceMenu.map(item => {
							const { icon, title, submenuItem } = item;
							return (
								<ToggleListItem key={title} icon={icon} title={title}>
									<ToggleSubListItem submenus={submenuItem} />
								</ToggleListItem>
							)
						})

					}
				</List>
			</Box>
		</Drawer>
	)
}