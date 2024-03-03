import { DataGrid, GridToolbar } from "@mui/x-data-grid"
import React from "react"

const QuickFilteredDataGrid = ({
	columns,
	rows,
	getRowId,
	onRowClick,
	quickFilterValues = undefined,
	...props
}) => {
	return (
		<DataGrid
			// autoHeight
			disableColumnFilter
			disableColumnSelector
			// disableDensitySelector
			columns={columns}
			rows={rows? rows : []}
			getRowId={getRowId}
			onRowClick={onRowClick}
			initialState={{
				filter: {
					filterModel: {
						items: [],
						quickFilterValues: [quickFilterValues],
					},
				},
			}}
			slots={{ toolbar: GridToolbar }}
			slotProps={{
				toolbar: {
					showQuickFilter: true,
				},
			}}
			{...props}
		/>
	)
}

export { QuickFilteredDataGrid }