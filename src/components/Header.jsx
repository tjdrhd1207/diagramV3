import { Box, GlobalStyles, IconButton, Sheet } from "@mui/joy";
import MenuIcon from '@mui/icons-material/Menu';
import MenuBar from "./MenuBar";
import React from "react";

export default function Header() {
	const [menuOpen, setMenuOpen] = React.useState(false);
	return (
		<Sheet
			sx={{
				display: { xs: 'flex' },
				alignItems: 'center',
				position: 'fixed',
				top: 0,
				width: '100vw',
				height: 'var(--Header-height)',
				zIndex: 9995,
				p: 1,
				gap: 1,
				borderBottom: '1px solid',
				borderColor: 'background.level1',
				boxShadow: 'sm',
			}}
		>
			<GlobalStyles
				styles={(theme) => ({
					':root': {
						'--Header-height': '52px',
					},
				})}
			/>
			<IconButton
				variant="outlined"
				color="neutral"
				size="sm"
				onClick={() => setMenuOpen(!menuOpen)}
			>
				<MenuIcon />
			</IconButton>
			<MenuBar open={menuOpen} setOpen={setMenuOpen} />
			<Box
				sx={{
					display: menuOpen? 'flex' : 'none',
					position: 'fixed',
					zIndex: 9998,
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					backgroundColor: 'var(--joy-palette-background-backdrop)',
				}}
				onClick={() => setMenuOpen(!menuOpen)}
			>

			</Box>
		</Sheet>
	)
}