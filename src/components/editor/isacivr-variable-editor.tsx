"use client"

import { $ValueEditorColumns, $Variable_Description_Tag, $Variable_InitValue_Tag, $Variable_Name_Tag, $Variable_Tag, $Variable_Type_Tag } from "@/consts/flow-editor";
import { Add, Cancel, Delete, Edit, Save } from "@mui/icons-material";
import { Box, Button, Stack } from "@mui/material";
import { GridActionsCellItem, GridColDef, GridEventListener, GridRowEditStopReasons, GridRowId, GridRowModel, GridRowModes, GridRowModesModel, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { CustomDataGrid } from "../common/grid";
import React from "react";
import { NodeWrapper } from "@/lib/diagram";
import { randomId, randomUserName } from "@mui/x-data-grid-generator";
import { DiffEditor } from "@monaco-editor/react";


interface RowProps {
    id: string;
    type: string;
    name: string;
    initValue: any;
    description: string;
}

interface EditToolbarProps {
    handleAddVariable: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const EditToolbar = (props: EditToolbarProps) => {
    const { handleAddVariable } = props;

    // const handleAddVariable = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     setRows((oldRows) => [...oldRows, { id: randomId(), type: "", name: randomUserName().slice(1), initValue: "", description: "" }])
    // }

    return (
        <GridToolbarContainer sx={{ width: "100%" }}>
            <Stack direction="row" flex={1}>
                <Box sx={{ width: "100%" }}>
                    <Button color="secondary" startIcon={<Add />} onClick={handleAddVariable}>Add</Button>
                </Box>
                <GridToolbarQuickFilter fullWidth sx={{ width: "100%" }} />
            </Stack>
        </GridToolbarContainer>
    )
}

interface ISACIVRVarEditorProps {
    origin: string;
    variables: string;
    setModified: (value: string) => void;
}

export const ISACIVRVarEditor = (props: ISACIVRVarEditorProps) => {
    const { origin, variables, setModified } = props;
    let varList: Array<RowProps> = [];
    if (origin) {
        const wrapper = NodeWrapper.parseFromXML(origin);
        wrapper.children($Variable_Tag).forEach((v) => {
            varList.push({
                id: randomId(),
                type: v.child($Variable_Type_Tag).value(),
                name: v.child($Variable_Name_Tag).value(),
                initValue: v.child($Variable_InitValue_Tag).value(),
                description: v.child($Variable_Description_Tag).value()
            })
        })
    }
    const [rows, setRows] = React.useState<Array<GridRowModel>>([ ...varList ]);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

    React.useEffect(() => {
        setModified(getModifiedXML());
    }, [rows])

    const handleAddVariable = (event: React.MouseEvent<HTMLButtonElement>) => {
        const id = randomId();
        setRows((oldRows) => [ 
            ...oldRows,
            { id: id, type: "string", name: randomUserName().slice(1), initValue: "", description: "", isNew: true }
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
        }));
    };

    const getModifiedXML = () => {
        const xml = NodeWrapper.parseFromXML(variables);
        xml.removeChild($Variable_Tag);
        rows.forEach((r) => {
            const row = r as RowProps;
            const child = xml.appendChild($Variable_Tag);
            child.appendChild($Variable_Type_Tag).value(row.type);
            child.appendChild($Variable_Name_Tag).value(row.name);
            child.appendChild($Variable_InitValue_Tag).value(row.initValue);
            child.appendChild($Variable_Description_Tag).value(row.description);
        })
        return xml.toString(false);
    }

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
        setModified(getModifiedXML());
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        const updatedRow = { ...newRow };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow!.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const ValueEditorColumns: Array<GridColDef> = [
        {
            field: "type", headerName: "Type", headerAlign: "center", align: "center", flex: 0.1, editable: true,
            type: "singleSelect",
            valueOptions: [
                { label: "String", value: "string" },
                { label: "Boolean", value: "boolean" },
                { label: "Int64", value: "int64" },
            ]
        },
        { field: "name", headerName: "Name", headerAlign: "center", align: "center", flex: 0.1, editable: true },
        { field: "initValue", headerName: "Init", headerAlign: "center", align: "center", flex: 0.1, editable: true },
        { field: "description", headerName: "Description", headerAlign: "center", flex: 0.3, editable: true },
        {
            field: "actions", headerName: "Actions", headerAlign: "center", flex: 0.1,
            type: "actions",
            cellClassName: "actions",
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<Save fontSize="small" />}
                            label="save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<Cancel fontSize="small" />}
                            label="cancel"
                            onClick={handleCancelClick(id)}
                        />
                        
                    ]
                } else {
                    return [
                        <GridActionsCellItem
                            icon={<Edit fontSize="small" />}
                            label="edit"
                            onClick={handleEditClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<Delete fontSize="small" />}
                            label="delete"
                            onClick={handleDeleteClick(id)}
                        />
                        
                    ]
                }
            }
        }
    ]

    return (
        <Box height="100%" width="100%" >
            <Box height="70%" width="100%" padding={1}>
                <CustomDataGrid
                    rows={rows}
                    columns={ValueEditorColumns}
                    getRowId={(row) => row.id}
                    rowModesModel={rowModesModel}
                    density="compact"
                    customToolbar={EditToolbar}
                    customToolbarProps={{ handleAddVariable }}
                    onRowEditStop={handleRowEditStop}
                    onRowModesModelChange={handleRowModesModelChange}
                    processRowUpdate={processRowUpdate}
                    sx={{}}
                />
            </Box>
            <Box height="30%" width="100%" padding={1}>
                <DiffEditor
                    original={origin} originalLanguage="xml"
                    modified={variables} modifiedLanguage="xml"
                />
            </Box>
        </Box>
    )
}