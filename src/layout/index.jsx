import { AppBar, Box, CssBaseline, Toolbar } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
import Header from "./Header";
import SideBar from "./SideBar";

export default function MainLayout() {
	// const theme = useTheme();

	return (
		<Box id="main-layout" sx={{ display: 'flex' }}>
			<CssBaseline />
			<AppBar
				enableColorOnDark
				position="fixed"
				color="default"
				elevation={0}
				sx={{
					// bgcolor: theme.palette.background.default,
					// transition: leftDrawerOpened ? theme.transitions.create('width') : 'none'
					height: "88px"
				}}
			>
				<Toolbar>
					<Header />
				</Toolbar>
			</AppBar>
			<SideBar />
		</Box>
	)
}