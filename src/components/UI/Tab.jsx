import { Box } from "@mui/material";

const TabPanel = (props) => {
	const { children, value, index, ...other } = props;

	return (
		<Box
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			{...other}
		>
			{value === index && (
				<Box>
					{children}
				</Box>
			)}
		</Box>
	)
}

export { TabPanel }