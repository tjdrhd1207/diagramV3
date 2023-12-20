import { Stack } from "@mui/material";
import AttributeBar from "../AttributeBar";
import FlowEditor from "../FlowEditor";
import SideBar from "../SideBar";
import React from "react";

export const FlowContext = React.createContext(null);

export default function MainLayout() {
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