import { CssBaseline, Box, CssVarsProvider } from "@mui/joy";
import Header from "./components/Header";
import MenuBar from "./components/MenuBar";
import FlowEditor from "./components/FlowEditor";

export default function WebDTemplate() {
	return (
		<CssVarsProvider disableTransitionOnChange>
			<CssBaseline />
			<Box 
				sx={{ display: 'flex', minHeight: '100dvh'}}
			>
				<Header />
				{/* <MenuBar /> */}
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