import { CssBaseline, Box, CssVarsProvider } from "@mui/joy";
import Header from "./components/Header";
import SideBar from "./components/SideBar";

export default function WebDTemplate() {
	return (
		<CssVarsProvider disableTransitionOnChange>
			<CssBaseline />
			<Box id="main-box" sx={{ display: 'flex', minHeight: '100dvh'}}>
				<Header />
				<SideBar />
			</Box>
		</CssVarsProvider>
	);
}