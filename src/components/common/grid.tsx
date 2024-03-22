import { DataGrid, GridColDef, GridDensity, GridEventListener, GridRowIdGetter, GridToolbar, GridToolbarProps, GridValidRowModel, ToolbarPropsOverrides } from "@mui/x-data-grid"
import { JSXElementConstructor } from "react"

interface CustomDataGridProps {
    columns: GridColDef[];
    rows: any[];
    getRowId: GridRowIdGetter<GridValidRowModel>;
    onRowClick?: GridEventListener<"rowClick">;
    quickFilterValues?: any[];
    loading?: boolean;
    density?: GridDensity;
    customToolbar? : JSXElementConstructor<any>;
    customToolbarProps?: Partial<GridToolbarProps & ToolbarPropsOverrides>;
    processRowUpdate?: (newRow: GridValidRowModel, oldRow: GridValidRowModel) => GridValidRowModel | Promise<GridValidRowModel>;
    sx?: object;
}

export const CustomDataGrid = (props: CustomDataGridProps) => {
    const { columns, rows, getRowId, onRowClick, 
            quickFilterValues, loading, density, 
            customToolbar, customToolbarProps, processRowUpdate,
            sx } = props;

    return (
        <DataGrid
            autoPageSize
            disableColumnFilter
            density={density? density : "standard"} 
            loading={loading}
            columns={columns}
            rows={rows} getRowId={getRowId} onRowClick={onRowClick}
            editMode="row"
            slots={{ toolbar: customToolbar? customToolbar : undefined }}
            slotProps={{
                toolbar: customToolbarProps? customToolbarProps : undefined
            }}
            initialState={{
                filter: {
                    filterModel: {
                        items: [],
                        quickFilterValues: quickFilterValues? [ ...quickFilterValues] : []
                    }
                }
            }}
            processRowUpdate={processRowUpdate}
            sx={sx}
        />
    )
}