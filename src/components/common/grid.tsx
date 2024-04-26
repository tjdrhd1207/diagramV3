import { DataGrid, GridCallbackDetails, GridColDef, GridDensity, GridEventListener, GridRowIdGetter, GridRowModesModel, GridToolbar, GridToolbarProps, GridValidRowModel, ToolbarPropsOverrides } from "@mui/x-data-grid"
import { JSXElementConstructor } from "react"

interface CustomDataGridProps {
    rows: any[];
    columns: GridColDef[];
    getRowId: GridRowIdGetter<GridValidRowModel>;
    rowModesModel?: GridRowModesModel;
    loading?: boolean;
    density?: GridDensity;
    customToolbar?: JSXElementConstructor<any>;
    customToolbarProps?: Partial<GridToolbarProps & ToolbarPropsOverrides>;
    quickFilterValues?: any[];
    onRowClick?: GridEventListener<"rowClick">;
    onRowEditStop?: GridEventListener<"rowEditStop">;
    onRowModesModelChange?: (rowModesModel: GridRowModesModel, details: GridCallbackDetails<any>) => void
    processRowUpdate?: (newRow: GridValidRowModel, oldRow: GridValidRowModel) => GridValidRowModel | Promise<GridValidRowModel>;
    sx?: object;
}

export const CustomDataGrid = (props: CustomDataGridProps) => {
    const { columns, rows, getRowId, rowModesModel,
        quickFilterValues, loading, density,
        customToolbar, customToolbarProps,
        onRowClick, onRowEditStop, processRowUpdate,
        onRowModesModelChange,
        sx } = props;

    return (
        <DataGrid
            rows={rows} getRowId={getRowId}
            columns={columns}
            autoPageSize
            // disableColumnFilter
            density={density ? density : "standard"}
            loading={loading}
            editMode="row"
            rowModesModel={rowModesModel}
            slots={{ toolbar: customToolbar ? customToolbar : undefined }}
            slotProps={{
                toolbar: customToolbarProps ? customToolbarProps : undefined
            }}
            initialState={{
                filter: {
                    filterModel: {
                        items: [],
                        quickFilterValues: quickFilterValues ? [...quickFilterValues] : []
                    }
                }
            }}
            processRowUpdate={processRowUpdate}
            onRowClick={onRowClick}
            onRowEditStop={onRowEditStop}
            onRowModesModelChange={onRowModesModelChange}
            sx={sx}
        />
    )
}