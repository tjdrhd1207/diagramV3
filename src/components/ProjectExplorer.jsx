
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles"
import { Box } from "@mui/joy";

const rows = [
	{ id: 1, col1: 'Hello', col2: 'World' },
	{ id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
	{ id: 3, col1: 'MUI', col2: 'is Amazing' },
];

const columns = [
	{ field: 'col1', headerName: 'Column 1', width: 150 },
	{ field: 'col2', headerName: 'Column 2', width: 150 },
];

export default function ProjectExplorer() {
	// const theme = useTheme();
	// console.log(theme);
	return (
		// <CssBaseline>
			<Box sx={{ height: 300, width: '100%', border: '1px solid'}}>
				<DataGrid rows={rows} columns={columns} sx={{ border: '1px solid'}}/>
			</Box>
		// </CssBaseline>
	)
}