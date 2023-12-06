import { CssBaseline, Box, CssVarsProvider } from "@mui/joy";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import FlowEditor from "./components/FlowEditor";

export default function WebDTemplate() {
	return (
		<CssVarsProvider disableTransitionOnChange>
			<CssBaseline />
			<Box 
				sx={{ display: 'flex', minHeight: '100dvh'}}
			>
				<Header />
				<SideBar />
				<Box
					component='main'
					className="MainContent"
					sx={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						minWidth: 0,
					}}
				>
					<FlowEditor />
				</Box>
			</Box>
		</CssVarsProvider>
	);
}