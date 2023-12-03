import { AccountTree } from "@mui/icons-material";
import { Box, GlobalStyles, IconButton, Sheet, Typography } from "@mui/joy";
import ColorSchemeToggle from "./ColorSchemeToggle";
// https://codesandbox.io/p/sandbox/crazy-mestorf-gj5kmz?file=%2Fcomponents%2FSidebar.tsx%3A82%2C16

export default function SideBar() {
	return (
		<Sheet
			className="SideBar"
			sx={{
				position: { xs: 'fixed', md: 'sticky' },
				transform: {
					xs: 'translateX(calc(100% * -1))',
					md: 'none'
				},
				transition: 'transform 0.4s, width 0.4s',
				p: 2,
				zIndex: 10000,
				height: '100dvh',
				width: 'var(--Sidebar-width)',
				display: 'flex',
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
						'--Sidebar-width': '220px',
						[theme.breakpoints.up('lg')]: {
							'--Sidebar-width': '240px',
						},
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
		</Sheet>
	)
}