import { AppBar, Divider, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { AccountTree, Menu } from '@mui/icons-material';
import MenuBar from "./MenuBar";
import React from "react";

export default function Header() {
	const [menuOpen, setMenuOpen] = React.useState(false);
	return (
		<>
			<AppBar 
				position="static"
				style={{
					// backgroundColor: "white"
				}}
			>
				<Toolbar
					// disableGutters
					style={{
						backgroundColor: "white",
						minHeight: 'var(--header-height)',
						padding: '0 1',
					}}
				>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						<IconButton
							size="small"
							onClick={() => setMenuOpen(!menuOpen)}
							style={{
								borderRadius: "10px",
								border: "1px solid",
								borderColor: "lightgray",
							}}
						>
							<Menu />
						</IconButton>
						<AccountTree
							fontSize="medium"
							style={{
								color: "darkslategray",
							}}
						/>
						<Typography variant="h6" color="black">
							ScenarioDesigner v3
						</Typography>
						<MenuBar open={menuOpen} setOpen={setMenuOpen}/>
					</Stack>
				</Toolbar>
			</AppBar>
			
		</>
	)
}