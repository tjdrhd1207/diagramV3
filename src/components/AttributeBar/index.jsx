import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";

export default function AttributeBar() {
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
				<Stack
					sx={{
						width: "var(--attrbar-width)",
					}}
				>
					<Typography sx={{ marginBlock: "5px"}}>ATTRIBUTES</Typography>
					<Divider />
				</Stack>
			</Container>
		</>
	)
}