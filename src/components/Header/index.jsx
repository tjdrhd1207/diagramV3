import { AppBar, Divider, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { AccountTree, Menu } from '@mui/icons-material';
import MenuBar from "./MenuBar";
import React from "react";

const Header = () => {
	const [menuOpen, setMenuOpen] = React.useState(false);
	return (
		<>
			<AppBar 
				position="static"
			>
				<Toolbar
					variant="dense"
					sx={{
						minHeight: 'var(--header-height)',
					}}
				>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						<IconButton
							size="small"
							color="inherit"
							onClick={() => setMenuOpen(!menuOpen)}
							sx={{
								borderRadius: "10px",
								border: "1px solid",
								// borderColor: "lightgray",
							}}
						>
							<Menu />
						</IconButton>
						<AccountTree
							fontSize="medium"
							color="inherit"
						/>
						<Typography variant="h6" color="inherit">
							ScenarioDesigner v3
						</Typography>
						<MenuBar open={menuOpen} setOpen={setMenuOpen}/>
					</Stack>
				</Toolbar>
			</AppBar>
			
		</>
	)
}

export default Header