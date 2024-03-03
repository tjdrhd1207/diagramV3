import { Box, Container, CssBaseline, GlobalStyles, Stack } from "@mui/material";
import Header from "./components/Header";
import MainLayout from "./components/MainLayout";
import React from "react";
import { getMetaJson } from "./api/interface";
import { useLocalStore } from "./store/LocalStore";
import { useShallow } from "zustand/react/shallow";
import DataExplorerDialog from "./components/Header/MenuBar/Dialogs/DataExplorerDialog";
import NewProjectDialog from "./components/Dialogs/NewProjectDialog";
import OpenProjectDialog from "./components/Dialogs/OpenProjectDialog";

const App = () => {
	const { block_meta, setBlockMeta } = useLocalStore(useShallow(state => state));

	React.useEffect(() => {
		if (!block_meta) {
			getMetaJson().then((response) => {
				setBlockMeta(response);
			})
		}
	}, []);

	return (
		<CssBaseline>
			<GlobalStyles
				styles={(theme) => ({
					':root': {
						'--header-height': '60px',
						'--menu-width': '250px',
						'--sidebar-width': '250px',
						'--pallete-padding-inline': '10px',
						'--attrbar-width': '0px',
					},
				})}
			/>
			<Header />
			<MainLayout />
			<NewProjectDialog />
			<OpenProjectDialog />
			<DataExplorerDialog />
		</CssBaseline>
	)
}

export default App