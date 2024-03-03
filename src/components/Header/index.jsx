import { Box, Chip, IconButton, Stack, TextField, Typography } from "@mui/material";
import { AccountTree, Menu } from '@mui/icons-material';
import MenuBar from "./MenuBar";
import { useLocalStore } from "../../store/LocalStore";
import { useMenuStore } from "../../store/MenuStore";

const Header = () => {
	const projectInfo = useLocalStore(state => state.project_info);
	const setMenuOpen = useMenuStore(state => state.setMenuOpen);

	const handleMenuOpen = () => {
		setMenuOpen(true);
	}

	return (
		<Box
			sx={{
				height: 'var(--header-height)',
				borderBlockEnd: "1px solid",
				paddingInline: "10px"
			}}
		>
			<Stack
				direction="row"
				spacing={2}
				alignItems="center"
				sx={{
					height: "100%"
				}}
			>
				<IconButton onClick={handleMenuOpen}>
					<Menu />
				</IconButton>
				<AccountTree fontSize="medium"/>
				<Typography variant="h6">ScenarioDesigner v3</Typography>
				<TextField
					focused
					label="Project"
					size="small"
					color="secondary"
					value={projectInfo.project_name + "-" + projectInfo.project_id}
				/>
				<MenuBar />
			</Stack>
		</Box>
	)
}

export default Header