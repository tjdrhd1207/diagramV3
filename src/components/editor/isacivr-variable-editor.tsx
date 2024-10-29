"use client"

import { Box, Button, Menu, MenuItem, MenuList, Stack } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridEventListener, GridRowEditStopReasons, GridRowId, GridRowModel, GridRowModes, GridRowModesModel, GridToolbar, GridToolbarContainer, GridToolbarQuickFilter, GridValidRowModel } from "@mui/x-data-grid";
import { CustomDataGrid } from "../common/grid";
import React from "react";
import { randomId, randomUserName } from "@mui/x-data-grid-generator";
import { DiffEditor } from "@monaco-editor/react";
import { createVariable, getVariableInfos, updateProjectVariable } from "@/service/fetch/crud/variables";
import { useProjectStore } from "@/store/workspace-store";
import { create } from "zustand";
import { AlertState, LoadingState, MenuPosition } from "@/store/_interfaces";
import { VariableInfo, UpdateVariableInfo } from "@/service/global";
import { DeleteVariableDialog, DeleteVariableDialogState } from "../dialog/DeleteVariableDialog";
import { CustomSnackbar } from "../custom-snackbar";
import { EllipsisLabel } from "../common/typhography";
import { NewVariableDialog, NewVariableDialogState } from "../dialog/NewVariableDialog";

const NoRowsContextMenu = (props: {
    onRefresh: () => void;
}) => {
    const { onRefresh } = props;

    const noRowsContextMenu = _useVariableEditorStore((state) => state.noRowsContextMenu);
    const setNoRowsContextMenu = _useVariableEditorStore((state) => state.setNoRowsContextMenu);

    const setOpenNewVariableDialog = _useNewVariableDialogStore((state) => state.setOpen);

    const handleClose = () => {
        setNoRowsContextMenu(null);
    };

    const handleAdd = () => {
        handleClose();
        setOpenNewVariableDialog(true);
    };

    const handleRefresh = () => {
        handleClose();
        onRefresh();
    };

    return (
        <Menu
            open={noRowsContextMenu !== null} onClose={handleClose} anchorReference="anchorPosition"
            anchorPosition={noRowsContextMenu !== null ? { top: noRowsContextMenu.mouseY, left: noRowsContextMenu.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
                <MenuItem onClick={handleRefresh}>Refesh</MenuItem>
            </MenuList>
        </Menu>
    )
}

const RowContextMenu = (props: {
    onRefresh: () => void;
}) => {
    const { onRefresh } = props;

    const infoRows = _useVariableEditorStore((state) => state.infoRows);
    const rowContextMenu = _useVariableEditorStore((state) => state.rowContextMenu);
    const setRowContextMenu = _useVariableEditorStore((state) => state.setRowContextMenu);

    const setOpenNewVariableDialog = _useNewVariableDialogStore((state) => state.setOpen);
    const setOpenDeleteVariableDialog = _useDeleteVariableDialogStore((state) => state.setOpen);

    const handleClose = () => {
        setRowContextMenu(null);
    };

    const handleAdd = () => {
        handleClose();
        setOpenNewVariableDialog(true);
    };

    const handleRefresh = () => {
        handleClose();
        onRefresh();
    };

    const handleDelete = () => {
        handleClose();
        if (rowContextMenu) {
            const { target } = rowContextMenu;
            if (target) {
                const found = infoRows.find((info) => info.variableName === target);
                if (found) {
                    setOpenDeleteVariableDialog(found);
                }
            } 
        }
    }

    return (
        <Menu
            open={rowContextMenu !== null} onClose={handleClose} anchorReference="anchorPosition"
            anchorPosition={rowContextMenu !== null ? { top: rowContextMenu.mouseY, left: rowContextMenu.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
                <MenuItem onClick={handleRefresh}>Refesh</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </MenuList>
        </Menu>
    )
}

interface GridContextMenuState {
    noRowsContextMenu: MenuPosition | null;
    setNoRowsContextMenu: (contextMenu: MenuPosition | null) => void;
    rowContextMenu: MenuPosition & { target: string } | null;
    setRowContextMenu: (contextMenu: MenuPosition & { target: string } | null) => void;
}

interface VariableEditorState {
    infoRows: VariableInfo[];
    setInfoRows: (variableInfos: VariableInfo[]) => void;
}

const _useVariableEditorStore = create<VariableEditorState & GridContextMenuState & LoadingState & AlertState>((set) => ({
    infoRows: [],
    setInfoRows: (variableInfos) => set({ infoRows: variableInfos }),
    noRowsContextMenu: null,
    setNoRowsContextMenu: (contextMenu) => set({ noRowsContextMenu: contextMenu }),
    rowContextMenu: null,
    setRowContextMenu: (contextMenu) => set({ rowContextMenu: contextMenu }),
    loading: false,
    loadingStart: () => set({ loading: true }),
    loadingDone: () => set({ loading: false }),
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false }),
}));

const _useNewVariableDialogStore = create<NewVariableDialogState>((set) => ({
    open: false,
    setOpen: (open) => set({ open: open })
}));

const _useDeleteVariableDialogStore = create<DeleteVariableDialogState>((set) => ({
    open: false,
    variableInfo: undefined,
    setOpen: (variableInfo) => {
        if (variableInfo) {
            set({ open: true, variableInfo: variableInfo });
        } else {
            set({ open: false });
        }
    }
}));

const variableInfoColumns: GridColDef[] = [
    {
        field: "variableType", headerName: "Type", headerAlign: "center", align: "center", flex: 0.1, editable: true,
        type: "singleSelect",
        valueOptions: [
            { label: "String", value: "string" },
            { label: "Boolean", value: "boolean" },
            { label: "Int64", value: "int64" },
        ],
    },
    { field: "variableName", headerName: "Name", headerAlign: "center", align: "center", flex: 0.1, editable: false },
    { field: "defaultValue", headerName: "Init", headerAlign: "center", align: "center", flex: 0.1, editable: true },
    { field: "variableDescription", headerName: "Description", headerAlign: "center", flex: 0.3, editable: true }
];

export const ISACIVRVariableEditor = () => {
    const projectID = useProjectStore((state) => state.projectID);

    const infoRows = _useVariableEditorStore((state) => state.infoRows);
    const setInfoRows = _useVariableEditorStore((state) => state.setInfoRows);
    const noRowsContextMenu = _useVariableEditorStore((state) => state.noRowsContextMenu);
    const setNoRowsContextMenu = _useVariableEditorStore((state) => state.setNoRowsContextMenu);
    const rowContextMenu = _useVariableEditorStore((state) => state.rowContextMenu);
    const setRowContextMenu = _useVariableEditorStore((state) => state.setRowContextMenu);

    const loading = _useVariableEditorStore((state) => state.loading);
    const loadingStart = _useVariableEditorStore((state) => state.loadingStart);
    const loadingDone = _useVariableEditorStore((state) => state.loadingDone);
    
    const alert = _useVariableEditorStore((state) => state.alert);
    const alertMessage = _useVariableEditorStore((state) => state.message);
    const showAlert = _useVariableEditorStore((state) => state.showAlert);
    const hideAlert = _useVariableEditorStore((state) => state.hideAlert);

    const openDeleteVariableDialog = _useDeleteVariableDialogStore((state) => state.open);
    const variableInfoforDelete = _useDeleteVariableDialogStore((state) => state.variableInfo);
    const setOpenDeleteVariableDialog = _useDeleteVariableDialogStore((state) => state.setOpen);

    const openNewVariableDialog = _useNewVariableDialogStore((state) => state.open);
    const setOpenNewVariableDialog = _useNewVariableDialogStore((state) => state.setOpen);

    const updateVariableInfos = () => {
        if (projectID) {
            loadingStart();
            getVariableInfos(projectID, {
                onOK: (data: any) => {
                    if (data) {
                        setInfoRows(data);
                    }
                    loadingDone();
                },
                onError: (message) => {
                    loadingDone();
                }
            })
        }
    };

    const handleRowContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const id = event.currentTarget.getAttribute("data-id");
        if (id) {
            setRowContextMenu(rowContextMenu === null ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, target: id } : null);
        }
    };

    const handleNoRowsContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setNoRowsContextMenu(noRowsContextMenu === null ? { mouseX: event.clientX - 2, mouseY: event.clientY } : null);
    };

    React.useEffect(() => {
        updateVariableInfos();
    }, []);

    const processRowUpdate = React.useCallback((newRow: GridRowModel, oldRow: GridRowModel) =>
        new Promise<GridRowModel>((resolve, reject) => {
            const { variableType: newVariableType, variableName: newVariableName,
                defaultValue: newDefaultValue, variableDescription: newVariableDescription
            } = newRow;
            const updateVariableInfo: UpdateVariableInfo = {};

            if (oldRow.variableName !== newRow.variableName) {
                updateVariableInfo.nameForUpdate = newRow.variableName
            } else if ((oldRow.variableType !== newRow.variableType) || (oldRow.defaultValue !== newRow.defaultValue)
                || (oldRow.variableDescription !== newRow.variableDescription)) {

            } else {
                resolve(oldRow);
            }

            updateProjectVariable(projectID, "app", newRow.variableName, updateVariableInfo, {
                onOK: (data) => {
                    resolve(newRow);
                    updateVariableInfos();
                },
                onError: (message) => {
                    resolve(oldRow);
                    updateVariableInfos();
                    showAlert("filled", "error", message);
                }
            });
        }),
        []
    );

    return (
        <Stack height="100%" width="100%" rowGap={1} paddingTop="1%" paddingInline="1%">
            <EllipsisLabel variant="h6">Variables</EllipsisLabel>
            <DataGrid
                rows={infoRows} columns={variableInfoColumns} getRowId={(row) => row.variableName}
                density="compact" disableColumnSelector disableDensitySelector disableRowSelectionOnClick
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        printOptions: { disableToolbarButton: true },
                        csvOptions: { disableToolbarButton: true }
                    },
                    row: {
                        onContextMenu: handleRowContextMenu
                    },
                    noRowsOverlay: {
                        onContextMenu: handleNoRowsContextMenu
                    }
                }}
            />
            <NoRowsContextMenu onRefresh={updateVariableInfos} />
            <RowContextMenu onRefresh={updateVariableInfos} />
            <CustomSnackbar open={alert} close={hideAlert} severity="error" message={alertMessage} />
            <NewVariableDialog 
                open={openNewVariableDialog} onClose={() => setOpenNewVariableDialog(false)}
                onCreate={updateVariableInfos}
            />
            <DeleteVariableDialog 
                open={openDeleteVariableDialog} variableInfo={variableInfoforDelete}
                onClose={() => setOpenDeleteVariableDialog(undefined)} onDelete={updateVariableInfos}
            />
        </Stack>
    )
}