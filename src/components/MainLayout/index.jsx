import { Stack } from "@mui/material";
import FlowEditor from "./FlowEditor";
import SideBar from "./PrimarySideBar";
import React from "react";
import AttributeBar from "./SecondarySideBar";

export const FlowContext = React.createContext(null);

const MainLayout = () => {
	const [editMode, setEditMode] = React.useState({
		mode: undefined,
		current: undefined,
		attributes: {},
	});
	
	const flowCtx = {
		mode: editMode,
		setMode: setEditMode,
	};

	return (
		<FlowContext.Provider value={flowCtx}>
			<Stack direction="row" style={{}} >
				<SideBar />
				<FlowEditor />
				<AttributeBar />
			</Stack>
		</FlowContext.Provider>
	)
}

export default MainLayout