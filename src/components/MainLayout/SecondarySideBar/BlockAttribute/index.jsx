import React from "react";
import { FlowContext } from "../..";
import { Divider, Stack, Typography } from "@mui/material";

const BlockAttribute = () => {
	const flowCtx = React.useContext(FlowContext);
	const {mode, setMode} = flowCtx;
	
	return (
		<Stack
			sx={{
				width: "var(--attrbar-width)",
			}}
		>
			<Typography sx={{ marginBlock: "5px" }}>ATTRIBUTES</Typography>
			<Divider />
			{mode.mode === "edit" ? JSON.stringify(mode.attributes) : undefined}
		</Stack>
	)
}

export default BlockAttribute