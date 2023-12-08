import { AppBar, GlobalStyles, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { AccountTree, Menu } from '@mui/icons-material';
import MenuBar from "./MenuBar";
import React from "react";

export default function Header() {
	const [menuOpen, setMenuOpen] = React.useState(false);
	return (
		<>
			<AppBar 
				position="static"
				color="transparent"
				style={{
					// zIndex: '0'
				}}
			>
				<Toolbar
					// disableGutters
					style={{
						minHeight: 'var(--header-height)'
					}}
				>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						<AccountTree 
							color="inherit"
							opacity="0.7"
							fontSize="large"
						/>
						<Typography variant="h5">WebD v3</Typography>
						<IconButton
							size="medium"
							onClick={() => setMenuOpen(!menuOpen)}
						>
							<Menu />
						</IconButton>
						<MenuBar open={menuOpen} setOpen={setMenuOpen}/>
					</Stack>
				</Toolbar>
			</AppBar>
			
		</>
	)
}