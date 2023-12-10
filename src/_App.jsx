import { CssBaseline, GlobalStyles } from "@mui/material";
import Header from "./_components/Header";

export default function App() {
	return (
		<CssBaseline>
			<GlobalStyles
				styles={(theme) => ({
					':root': {
						'--header-height': '52px',
						'--menu-width': '250px',
						'--sidebar-width': '200px',
					},
				})}
			/>
			<Header />
		</CssBaseline>
	)
}