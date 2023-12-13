import { Autocomplete, Box, Button, Stack, TextField } from "@mui/material";
import { AppContext } from "../../App";
import { ToggleListItem, ToggleSubBlockItem } from "../UI/Toggler";

const SearchBox = (props) => {
	return (
		<Autocomplete {...props} />
	)
}

export default function BlockPallete() {
	return (
		<AppContext.Consumer>
			{blockMetaCtx => {
				const {meta} = blockMetaCtx;
				let searchBoxOptions = [];
				if (meta) {
					meta.groups.map(group => {
						const {name, nodes} = group;
						nodes.map(node => {
							let displayName = meta.nodes[node].displayName
							searchBoxOptions = [...searchBoxOptions, {name, displayName}];
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
							renderInput={(params) => <TextField {...params} label={"블록 이름"} sx={{ "& .MuiOutlinedInput-root": { borderRadius:"15px" } }}/>}
							options={searchBoxOptions}
							groupBy={option => option.name}
							getOptionLabel={option => option.displayName}
							sx={{ marginBottom: "5px" }}
						/>
						
						{
							meta? meta.groups.map(group => {

								return (
									<ToggleListItem key={group.name} icon={undefined} title={group.name}>
										<ToggleSubBlockItem subblocks={group.nodes} />
									</ToggleListItem>
								)
							}) : undefined
						}
					</Box>
				)
			}}
		</AppContext.Consumer>
	)
}