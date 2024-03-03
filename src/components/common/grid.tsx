import { DataGrid, GridColDef, GridEventListener, GridRowIdGetter, GridToolbar, GridValidRowModel } from "@mui/x-data-grid"

export const QuickFilteredDataGrid = (
    props: {
        columns: GridColDef[],
        rows: any[],
        getRowId: GridRowIdGetter<GridValidRowModel>,
        onRowClick?: GridEventListener<"rowClick">,
        quickFilterValues?: any[],
        loading?: boolean,
        sx?: object
    }
) => {
    return (
        <DataGrid disableColumnFilter disableColumnSelector loading={props.loading}
            columns={props.columns}
            rows={props.rows} getRowId={props.getRowId} onRowClick={props.onRowClick}
            slots={{ toolbar: GridToolbar }}
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