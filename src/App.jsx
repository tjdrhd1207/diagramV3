import { Box, Container, CssBaseline, GlobalStyles, Stack } from "@mui/material";
import Header from "./components/Header";
import axios from 'axios'
import MainLayout from "./components/MainLayout";
import React from "react";
import { GET_BLOCK_META_URL } from "./api/serverinfo";

export const AppContext = React.createContext(null);

const App = ()  => {
	const [blockMeta, setBlockMeta] = React.useState();
	const blockMetaCtx = {
		meta: blockMeta,
		setMeta: setBlockMeta
	};

	React.useEffect(() => {
		axios
			.get(GET_BLOCK_META_URL)
			.then(res => {
				setBlockMeta(res.data);
			})
			.catch(e => {
				console.log(e);
			});
	}, [])
	return (
		<AppContext.Provider value={blockMetaCtx}>
			<CssBaseline>
				<GlobalStyles
					styles={(theme) => ({
						':root': {
							'--header-height': '52px',
							'--menu-width': '250px',
							'--sidebar-width': '250px',
							'--pallete-padding-inline': '10px',
							'--attrbar-width': '300px',
						},
					})}
				/>
				<Header />
				{/* <Stack  direction="row" style={{ }} >
					<SideBar />
					<FlowEditor />
					<AttributeBar />
				</Stack> */}
				<MainLayout />
			</CssBaseline>
		</AppContext.Provider>
	)
}

export default App