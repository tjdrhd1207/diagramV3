import { DataGrid, GridColDef, GridDensity, GridEventListener, GridRowIdGetter, GridToolbar, GridValidRowModel } from "@mui/x-data-grid"
import { JSXElementConstructor } from "react"

export const QuickFilteredDataGrid = (
    props: {
        columns: GridColDef[],
        rows: any[],
        getRowId: GridRowIdGetter<GridValidRowModel>,
        onRowClick?: GridEventListener<"rowClick">,
        quickFilterValues?: any[],
        loading?: boolean,
        density?: GridDensity,
        customToolbar? : JSXElementConstructor<any>
        sx?: object
    }
) => {
    return (
        <DataGrid 
            disableColumnFilter
            density={props.density? props.density : "standard"} 
            loading={props.loading}
            columns={props.columns}
            rows={props.rows} getRowId={props.getRowId} onRowClick={props.onRowClick}
            editMode="row"
            slots={{ toolbar: props.customToolbar? props.customToolbar : undefined }}
            slotProps={{
                toolbar: {
                    showQuickFilter: true,
                },
            }}
            initialState={{
                filter: {
                    filterModel: {
                        items: [],
                        quickFilterValues: props.quickFilterValues? [ ...props.quickFilterValues] : []
                    }
                }
            }}
            sx={props.sx}
        />
    )
}