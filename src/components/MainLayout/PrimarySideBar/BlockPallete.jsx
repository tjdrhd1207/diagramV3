import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import { ToggleListItemButton } from "../../UI/Toggler";
import React from "react";
import { FlowContext } from "..";
import { useLocalStore } from "../../../store/LocalStore";

const SearchBox = (props) => {
	return (
		<Autocomplete {...props} />
	)
}

const BlockItem = ({
	subblocks,
	meta,
	handleFlowState,
}) => {
	return (
		<>
			{
				subblocks ?
					<Grid container spacing={1} columns={3}>
						{
							subblocks.map(block => {
								return (
									<Grid item key={block} xs={1}>
										<Button
											fullWidth
											size="small"
											variant="contained"
											color="inherit"
											sx={{
												display: "flex",
												fontSize: "10px"
											}}
											onClick={() => handleFlowState(block)}
										>
											{meta.nodes[block].displayName}
										</Button>
									</Grid>
								)
							})
						}
					</Grid>
					:
					undefined
			}
		</>
	)
}

const BlockPallete = () => {
	const block_meta = useLocalStore(state => state.block_meta);

	const flowCtx = React.useContext(FlowContext);
	const { mode, setMode } = flowCtx;

	const handleEditMode = (block) => {
		setMode({ mode: "add", current: block });
	};

	let searchBoxOptions = [];
	if (block_meta) {
		block_meta.groups.map(group => {
			const { name, nodes } = group;
			nodes.map(node => {
				let displayName = block_meta.nodes[node].displayName
				searchBoxOptions = [...searchBoxOptions, { name, node, displayName }];
			})
		})
	}
	return (
		<Box
			sx={{
				paddingBlock: "15px",
				paddingInline: "var(--pallete-padding-inline)",
				height: "calc(100vh - var(--header-height) - 48px - var(--pallete-padding-inline))",
				overflow: "auto",
			}}
		>
			<SearchBox
				disablePortal
				size="small"
				id="block-search-box"
				renderInput={(params) => <TextField {...params} label={"블록 이름"} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "15px" } }} />}
				options={searchBoxOptions}
				groupBy={option => option.name}
				getOptionLabel={option => option.displayName}
				sx={{ marginBottom: "5px" }}
			/>
			{
				block_meta ? block_meta.groups.map(group => {
					const { name, nodes } = group;
					return (
						<ToggleListItemButton key={name} icon={undefined} title={name}>
							<BlockItem subblocks={nodes} meta={block_meta} handleFlowState={handleEditMode}/>
						</ToggleListItemButton>
					)
				}) : undefined
			}
		</Box>
	)
}

export default BlockPallete