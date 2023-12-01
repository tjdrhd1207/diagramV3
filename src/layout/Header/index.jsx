import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Logo from '../../assets/logo.svg'

export default function Header() {
	const theme = useTheme();
	
	return (
		<>
			{/* LOGO SECTION */}
			<Box id="logo-box"
				sx={{
					// width: 228,
					height: "88px",
					display: 'flex',
					[theme.breakpoints.down('md')]: {
						width: 'auto'
					},
				}}
			>
				<img src={Logo} alt="logo" width={120}></img>
			</Box>
		</>
	);
}