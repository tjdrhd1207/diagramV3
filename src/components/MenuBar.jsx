import React from 'react'
import { AccountTree } from "@mui/icons-material";
import { Box, Chip, GlobalStyles, IconButton, Input, List, ListItem, ListItemButton, ListItemContent, Modal, ModalClose, ModalDialog, Sheet, Typography, listItemButtonClasses } from "@mui/joy";
import ColorSchemeToggle from "./ColorSchemeToggle";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Folder from '@mui/icons-material/Folder';
import Eject from '@mui/icons-material/Eject';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates'
import Inventory2 from '@mui/icons-material/Inventory2'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Settings } from '@mui/icons-material'
import DataManager from './DataManager';
// https://codesandbox.io/p/sandbox/crazy-mestorf-gj5kmz?file=%2Fcomponents%2FSidebar.tsx%3A82%2C16

const serviceMenu = [
	{
		title: "프로젝트 관리",
		submenuItem: ["새 프로젝트", "새 페이지", "프로젝트 열기", "최근 프로젝트", "저장", "모두 저장", "프로젝트 닫기"],
		icon: <Folder />
	},
	{
		title: "프로젝트 배포",
		submenuItem: ["배포", "소스 형상관리", "시뮬레이터"],
		icon: <Eject />
	},
	{
		title: "리소스 관리",
		submenuItem: ["멘트 관리", "서비스 코드 관리"],
		icon: <Inventory2 />
	},
	{
		title: "도움말",
		submenuItem: ["버전 정보", "릴리즈 노트", "도움말", "단축기"],
		icon: <TipsAndUpdates />
	},
	{
		title: "환경설정",
		submenuItem: [],
		icon: <Settings />
	}
]

function Toggler({
	defaultExpanded = false,
	renderToggle,
	children,
}) {
	const [open, setOpen] = React.useState(defaultExpanded);
	return (
		<React.Fragment>
			{renderToggle({ open, setOpen })}
			<Box
				sx={{
					display: 'grid',
					gridTemplateRows: open ? '1fr' : '0fr',
					transition: '0.2s ease',
					'& > *': {
						overflow: 'hidden',
					},
				}}
			>
				{children}
			</Box>
		</React.Fragment>
	);
}



/**
 * @param {string} title
 * @param {string[]} submenuItem
 * @param {JSX.Element} icon
 */
function menuItem(
	title,
	submenuItem,
	icon = <Folder />
) {
	const [dmOpen, dmSetOpen] = React.useState(false)
	return (
		<Toggler
			renderToggle={({ open, setOpen }) => (
				<ListItemButton onClick={() => setOpen(!open)}>
					{icon}
					<ListItemContent>
						<Typography level="title-sm">{title}</Typography>
					</ListItemContent>
					<KeyboardArrowDownIcon
						sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
					/>
				</ListItemButton>
			)}
		>
			<List sx={{ gap: 0.5 }}>
				{submenuItem.map((item, index) => {
					return (
						<ListItem key={item} sx={{ mt: index == 0  ? 0.5 : 'none' }}>
							<ListItemButton onClick={
									item == "데이터 정의" ? () => dmSetOpen(true) : undefined
								}
							>{item}</ListItemButton>
						</ListItem>
					)
				})}
			</List>
			<DataManager open={dmOpen} setOpen={dmSetOpen} />
		</Toggler>
	);
}

export default function MenuBar(props) {
	return (
		<Sheet
			className="MenuBar"
			sx={{
				display: 'flex',
				position: 'fixed',
				top: 0,
				left: 'calc(var(--MenuBar-width) * -1)',
				transform: props.open? 'translateX(var(--MenuBar-width))' : 'none',
				transition: 'transform 0.4s',
				p: 2,
				zIndex: 10000,
				height: '100dvh',
				width: 'var(--MenuBar-width)',
				flexShrink: 0,
				flexDirection: 'column',
				gap: 2,
				borderRight: '1px solid',
				borderColor: 'divider',
			}}
		>
			<GlobalStyles
				styles={(theme) => ({
					':root': {
						'--MenuBar-width': '220px',
					},
				})}
			/>
			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
				<IconButton variant="soft" color="primary" size="sm">
					<AccountTree />
				</IconButton>
				<Typography level="title-lg">WebD v3</Typography>
				<ColorSchemeToggle sx={{ ml: 'auto' }} />
			</Box>
			{/* <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" /> */}
			<Box
				sx={{
					minHeight: 0,
					overflow: 'hidden auto',
					flexGrow: 1,
					display: 'flex',
					flexDirection: 'column',
					[`& .${listItemButtonClasses.root}`]: {
						gap: 1.5,
					},
				}}
			>
				<List
					size="sm"
					sx={{
						gap: 1,
						'--List-nestedInsetStart': '30px',
						'--ListItem-radius': (theme) => theme.vars.radius.sm,
					}}
				>
					{serviceMenu.map(menu => {
						const {title, submenuItem, icon} = menu;
						return (
							submenuItem.length != 0 ?
							<ListItem nested key={title}>
								{menuItem(title, submenuItem, icon)}
							</ListItem> : 
							<ListItemButton key={title}>
								{icon}
								<ListItemContent>
									<Typography level="title-sm">{title}</Typography>
								</ListItemContent>
							</ListItemButton>
							
						);
					})}
				</List>
			</Box>
		</Sheet>
	)
}