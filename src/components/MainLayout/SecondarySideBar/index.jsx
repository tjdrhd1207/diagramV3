import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { FlowContext } from "..";
import React from "react";
import BlockAttribute from "./BlockAttribute";

export default function AttributeBar() {
	const flowCtx = React.useContext(FlowContext);
	const {mode, setMode} = flowCtx;
	
	return (
		<>
			<Container
				disableGutters
				sx={{
					width: "var(--attrbar-width)",
					height: "calc(100vh - var(--header-height))",
					margin: "0",
					padding: "10px",
					borderLeft: "1px solid lightgray",
					display: "flex",
				}}
				>
				<BlockAttribute />
			</Container>
		</>
	)
}