import { Folder, Eject, Inventory2, TipsAndUpdates, Settings } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import React from "react";
import { ToggleListItem, ToggleSubListItem } from "../../UI/Toggler";
import NewProjectDialog from "./Dialogs/NewProjectDialog";

const ServiceMenu = [
	{
		title: "프로젝트 관리",
		submenuItem: [
			{ subtitle: "새 프로젝트", DialogRef: NewProjectDialog }, ,
			{ subtitle: "새 페이지", DialogRef: undefined },
			{ subtitle: "프로젝트 열기", DialogRef: undefined },
			{ subtitle: "최근 프로젝트", DialogRef: undefined },
			{ subtitle: "저장", DialogRef: undefined },
			{ subtitle: "모두 저장", DialogRef: undefined },
			{ subtitle: "프로젝트 닫기", DialogRef: undefined }
		],
		icon: <Folder />,
	},
	{
		title: "프로젝트 배포",
		submenuItem: [
			{ subtitle: "배포", DialogRef: undefined },
			{ subtitle: "소스 형상관리", DialogRef: undefined },
			{ subtitle: "시뮬레이터", DialogRef: undefined },
		],
		icon: <Eject />,
	},
	{
		title: "리소스 관리",
		submenuItem: [
			{ subtitle: "멘트 관리", DialogRef: undefined },
			{ subtitle: "서비스 코드 관리", DialogRef: undefined },
		],
		icon: <Inventory2 />,
	},
	{
		title: "도움말",
		submenuItem: [
			{ subtitle: "버전 정보", DialogRef: undefined },
			{ subtitle: "릴리즈 노트", DialogRef: undefined },
			{ subtitle: "도움말", DialogRef: undefined },
			{ subtitle: "단축기", DialogRef: undefined },
		],
		icon: <TipsAndUpdates />,
	},
	{
		title: "환경설정",
		submenuItem: [],
		icon: <Settings />,
	}
]

const SubListItem = ({
	submenus,
}) => {
	return (
		<List dense>
			{submenus.map(menu => {
				const { subtitle, DialogRef } = menu;
				if (DialogRef) {
					const [dialogOpen, setDialogOpen] = React.useState(false);

					const handleOnClick = (event) => {
						setDialogOpen(!dialogOpen);
					}

					const handleClose = () => {
						setDialogOpen(false);
					}

					return (
						<ListItem disablePadding key={subtitle}>
							<ListItemButton
								onClick={handleOnClick}
								sx={{
									borderRadius: "10px",
									marginBottom: "5px",
									marginInline: "10px",
								}}
							>
								<ListItemText secondary={subtitle} />
							</ListItemButton>
							<DialogRef open={dialogOpen} handleClose={handleClose} />
						</ListItem>
					)
				} else {
					return (
						<ListItem disablePadding key={subtitle}>
							<ListItemButton
								key={subtitle}
								sx={{
									borderRadius: "10px",
									marginBottom: "5px",
									marginInline: "10px",
								}}
							>
								<ListItemText secondary={subtitle} />
							</ListItemButton>
						</ListItem>
					)
				}
			})}
		</List>
	)
}

const MenuBar = (props) => {
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
				// onKeyDown={() => props.setOpen(false)}
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
									<SubListItem submenus={submenuItem} />
								</ToggleListItem>
							)
						})

					}
				</List>
			</Box>
		</Drawer>
	)
}

export default MenuBar