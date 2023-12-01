import { Box, Drawer, useMediaQuery, useTheme, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import PropTypes from 'prop-types';

export default function SideBar({ window }) {
	const theme = useTheme();
	const matchUpMd = useMediaQuery(theme.breakpoints.up('md'))

	const container = window !== undefined ? () => window.document.body : undefined;
	return (
		<>
			<Box component="nav" sx={{ width: 'auto' }}>
				<Drawer
					container={container}
					variant="persistent"
					anchor="left"
					open={true}
					sx={{
						"& .MuiDrawer-paper": {
							width: "248px",
							top: "88px"
						}
					}}
				>
					<Box sx={{ overflow: 'auto' }}>
						<List disablePadding>
							{['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
							<ListItem key={text} disablePadding>
								<ListItemButton>
								<ListItemIcon>
									{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
								</ListItemIcon>
								<ListItemText primary={text} />
								</ListItemButton>
							</ListItem>
							))}
						</List>
					</Box>
				</Drawer>
			</Box>
		</>
	);
}

SideBar.propTypes = {
	window: PropTypes.object
}