import { Box, Container, CssBaseline, GlobalStyles, Stack } from "@mui/material";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import AttributeBar from "./components/AttributeBar";
import FlowEditor from "./components/FlowEditor";
import { createContext, useEffect, useState } from "react";
import axios from 'axios'

export const AppContext = createContext(null);

export default function App() {
	const [blockMeta, setBlockMeta] = useState();
	const blockMetaCtx = {
		meta: blockMeta,
		setMeta: setBlockMeta
	};

	useEffect(() => {
		axios
			.get('http://10.1.14.245:8090/meta')
			.then(res => {
				setBlockMeta(res.data);
			})
			.catch(e => {
	
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
				<Stack  direction="row" style={{ }} >
					<SideBar />
					<FlowEditor />
					<AttributeBar />
				</Stack>
			</CssBaseline>
		</AppContext.Provider>
	)
}