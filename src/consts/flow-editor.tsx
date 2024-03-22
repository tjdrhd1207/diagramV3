import { GridColDef } from "@mui/x-data-grid";

export const $Functions_Tab_Name = "@Functions";
export const $Variables_Tab_Name = "@Variables";
export const $Messages_Tab_Name = "@Messages";

export const $ValueEditorColumns: Array<GridColDef> = [
    {
        field: "type", headerName: "Type", headerAlign: "center", align: "center", flex: 0.1, editable: true,
        type: "singleSelect",
        valueOptions: [
            { label: "String", value: "string" },
            { label: "Boolean", value: "boolean" },
            { label: "Int64", value: "int64" },
        ]
    },
    { field: "name", headerName: "Name", headerAlign: "center", align: "center", flex: 0.2, editable: true },
    { field: "initValue", headerName: "Init", headerAlign: "center", align: "center", flex: 0.1, editable: true },
    { field: "description", headerName: "Description", headerAlign: "center", flex: 0.3, editable: true },
]