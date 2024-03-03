import { Stack } from "@mui/material";
import FlowEditor from "./FlowEditor";
import React from "react";
import AttributeBar from "./SecondarySideBar";
import PrimnarySideBar from "./PrimarySideBar";

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
				<PrimnarySideBar />
				<FlowEditor />
				{/* <AttributeBar /> */}
			</Stack>
		</FlowContext.Provider>
	)
}

export default MainLayout