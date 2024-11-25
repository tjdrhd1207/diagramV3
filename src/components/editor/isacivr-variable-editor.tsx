import { Box, Menu, MenuItem, MenuList, Stack } from "@mui/material";
import { DataGrid, GridColDef, GridRowModel, GridToolbar } from "@mui/x-data-grid";
import React from "react";
import { getVariableInfos, updateVariableInfo, updateVariableInfos } from "@/service/fetch/crud/variables";
import { useProjectStore } from "@/store/workspace-store";
import { create } from "zustand";
import { AlertState, LoadingState, MenuPosition } from "@/store/_interfaces";
import { VariableInformation, UpdateVariableInfo } from "@/service/global";
import { DeleteVariableDialog, DeleteVariableDialogState } from "../dialog/DeleteVariableDialog";
import { CustomSnackbar } from "../custom-snackbar";
import { EllipsisLabel } from "../common/typhography";
import { NewVariableDialog, NewVariableDialogState } from "../dialog/NewVariableDialog";

const NoRowsContextMenu = () => {
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

    return (
        <Menu
            open={noRowsContextMenu !== null} onClose={handleClose} anchorReference="anchorPosition"
            anchorPosition={noRowsContextMenu !== null ? { top: noRowsContextMenu.mouseY, left: noRowsContextMenu.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
            </MenuList>
        </Menu>
    )
}

const RowContextMenu = (props: {
    variableInfos: VariableInformation[];
}) => {
    const { variableInfos } = props;

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

    const handleDelete = () => {
        handleClose();
        if (rowContextMenu) {
            const { target } = rowContextMenu;
            if (target) {
                const found = variableInfos.find((info) => info.variableName === target);
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


const _useVariableEditorStore = create<GridContextMenuState & LoadingState & AlertState>((set) => ({
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
    setOpen: (open) => set({ open })
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
        field: "variableType", headerName: "Type", headerAlign: "center", align: "center", flex: 0.05, editable: false,
        type: "singleSelect",
        valueOptions: [
            { label: "String", value: "string" },
            { label: "Boolean", value: "boolean" },
            { label: "Int64", value: "int64" },
        ],
    },
    { field: "variableName", headerName: "Name", headerAlign: "center", align: "center", flex: 0.1, editable: true },
    { field: "defaultValue", headerName: "Default", headerAlign: "center", align: "center", flex: 0.1, editable: true },
    { field: "variableDescription", headerName: "Description", headerAlign: "center", flex: 0.3, editable: true }
];

export const ISACIVRVariableEditor = (props: {
    variableInfos: VariableInformation[];
    setTabModified: (variableInfos: VariableInformation[]) => void;
}) => {
    const { variableInfos, setTabModified } = props;
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

    const openNewVariableDialog = _useNewVariableDialogStore((state) => state.open);
    const setOpenNewVariableDialog = _useNewVariableDialogStore((state) => state.setOpen);

    const openDeleteVariableDialog = _useDeleteVariableDialogStore((state) => state.open);
    const variableInfoforDelete = _useDeleteVariableDialogStore((state) => state.variableInfo);
    const setOpenDeleteVariableDialog = _useDeleteVariableDialogStore((state) => state.setOpen);

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

    React.useEffect(() => {}, []);

    const handleCreate = (info: VariableInformation) => {
        setTabModified([ ...variableInfos, info ]);
    }

    const handleDelete = (infoForDelete: VariableInformation) => {
        setTabModified([ ...variableInfos.filter((info) => info.variableName !== infoForDelete.variableName) ]);
    }

    const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => 
        new Promise<GridRowModel>((resolve) => {
            const { variableType: newType, variableName: newName,
                defaultValue: newDefault, variableDescription: newDescription
            } = newRow;
            const { variableType: oldType, variableName: oldName,
                defaultValue: oldDefault, variableDescription: oldDescription
            } = oldRow;

            if (!newName) {
                showAlert("filled", "error", "VariableName cannot be empty");
                resolve(oldRow);
            } else {
                const newVariableInfos = [
                    ...variableInfos.map((info) => {
                        if (info.variableName === oldName) {
                            return { ...info, variableName: newName, defaultValue: newDefault, variableDescription: newDescription };
                        } else {
                            return info;
                        }
                    })
                ];

                setTabModified(newVariableInfos);
                resolve(newRow);
            }

    });

    return (
        <Stack width="100%" height="100%" rowGap={1} padding="1%">
            <EllipsisLabel variant="h6">Variables</EllipsisLabel>
            <DataGrid
                rows={variableInfos} columns={variableInfoColumns} getRowId={(row) => row.variableName}
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
                processRowUpdate={processRowUpdate}
            />
            <NoRowsContextMenu />
            <RowContextMenu variableInfos={variableInfos} />
            <CustomSnackbar open={alert} close={hideAlert} severity="error" message={alertMessage} />
            <NewVariableDialog 
                open={openNewVariableDialog} onClose={() => setOpenNewVariableDialog(false)}
                variableInfos={variableInfos} onCreate={handleCreate}
            />
            <DeleteVariableDialog 
                open={openDeleteVariableDialog} variableInfo={variableInfoforDelete}
                onClose={() => setOpenDeleteVariableDialog(undefined)} onDelete={handleDelete}
            />
        </Stack>
    )
}