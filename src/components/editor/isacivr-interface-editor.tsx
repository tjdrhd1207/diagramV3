import { useProjectStore } from "@/store/workspace-store";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Collapse, Divider, List, ListItemButton, ListItemText, Menu, MenuItem, MenuList, Stack, Tab, Tabs, Typography } from "@mui/material"
import { DataGrid, GridActionsCellItem, GridCallbackDetails, GridColDef, GridEventListener, GridRenderCellParams, GridRowEditStopReasons, GridRowId, GridRowModel, GridRowModes, GridRowModesModel, GridRowParams, GridToolbar, MuiEvent, useGridApiRef } from "@mui/x-data-grid";
import { create } from "zustand";
import React from "react";
import { AlertState, MenuPosition, TabState } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";
import { InterfaceInfo, InterfaceItemInfo } from "@/service/global";
import { createInterfaceCode, deleteInterfaceInfo, getInterfaceInfos, updateInterfaceCode, updateInterfaceName } from "@/service/fetch/crud/interfaces";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal";
import { FormText } from "../common/form";
import { Cancel, Edit, ExpandLess, ExpandMore, Save, ViewList } from "@mui/icons-material";
import { EllipsisLabel } from "../common/typhography";
import { UpdateInterfaceItemInfosDialog } from "../dialog/UpdateInterfaceItemsDialog";

const NoRowsContextMenu = (props: {
    onRefresh: () => void;
}) => {
    const { onRefresh } = props;

    const noRowsContextMenu = _useInterfaceInfoStore((state) => state.noRowsContextMenu);
    const setNoRowsContextMenu = _useInterfaceInfoStore((state) => state.setNoRowsContextMenu);

    const setOpenNewCodeDialog = _useNewCodeDialogStore((state) => state.setOpenNewCodeDialog);

    const handleClose = () => {
        setNoRowsContextMenu(null);
    };

    const handleAdd = () => {
        handleClose();
        setOpenNewCodeDialog(true);
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

    const infoRows = _useInterfaceEditorStore((state) => state.infoRows);
    const setCodeForView = _useInterfaceEditorStore((state) => state.setCodeForView);
    const setFixedItemRows = _useInterfaceEditorStore((state) => state.setFixedItemRows);
    const setIterativeItemRows = _useInterfaceEditorStore((state) => state.setIterativeItemRows);

    const rowContextMenu = _useInterfaceInfoStore((state) => state.rowContextMenu);
    const setRowContextMenu = _useInterfaceInfoStore((state) => state.setRowContextMenu);

    const setOpenNewCodeDialog = _useNewCodeDialogStore((state) => state.setOpenNewCodeDialog);
    const setOpenDeleteCodeDialog = _useAskBeforeDeleteDialogStore((state) => state.setOpen);
    const setOpenUpdateItemsDialog = _useUpdateInterfaceItemsStore((state) => state.setOpen);

    const handleClose = () => {
        setRowContextMenu(null);
    }

    const handleAdd = () => {
        handleClose();
        setOpenNewCodeDialog(true);
    };

    const handleView = () => {
        handleClose();
        if (rowContextMenu) {
            const { target } = rowContextMenu;
            if (target) {
                setCodeForView(target);
            }
        }
    }

    const handleEdit = () => {
        if (rowContextMenu) {
            const { target } = rowContextMenu;
            if (target) {
                const found = infoRows.find((row) => row.interfaceCode === target);
                if (found) {
                    handleClose();
                    setOpenUpdateItemsDialog(found);
                }
            }
        }
    }

    const handleRefresh = () => {
        handleClose();
        onRefresh();
    };

    const handleDelete = () => {
        handleClose();
        if (rowContextMenu?.target) {
            setOpenDeleteCodeDialog(rowContextMenu.target);
        }
    }

    return (
        <Menu
            open={rowContextMenu !== null} onClose={handleClose} anchorReference="anchorPosition"
            anchorPosition={rowContextMenu !== null ? { top: rowContextMenu.mouseY, left: rowContextMenu.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
                <MenuItem onClick={handleView}>View</MenuItem>
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem disabled>Copy</MenuItem>
                <MenuItem onClick={handleRefresh}>Refresh</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
                <Divider />
                <MenuItem disabled>Find All References</MenuItem>
            </MenuList>
        </Menu>
    )
}

interface InterfaceEditorState {
    infoRows: InterfaceInfo[];
    setInfoRows: (itemInfos: InterfaceInfo[]) => void;
    codeForView: string | undefined;
    setCodeForView: (code: string) => void;
    fixedItemRows: InterfaceItemInfo[];
    setFixedItemRows: (itemInfos: InterfaceItemInfo[]) => void;
    iterativeItemRows: InterfaceItemInfo[];
    setIterativeItemRows: (details: InterfaceItemInfo[]) => void;
}

const _useInterfaceEditorStore = create<InterfaceEditorState & AlertState>((set, get) => ({
    infoRows: [],
    setInfoRows: (infos) => set({ infoRows: infos }),
    codeForView: undefined,
    setCodeForView: (code) => set({ codeForView: code }),
    fixedItemRows: [],
    setFixedItemRows: (itemInfos) => set({ fixedItemRows: itemInfos }),
    iterativeItemRows: [],
    setIterativeItemRows: (itemInfos) => set({ iterativeItemRows: itemInfos }),
    openUpdateItemsDialog: false,
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false }),
}));

interface NewCodeDialogState {
    openNewCodeDialog: boolean;
    setOpenNewCodeDialog: (open: boolean) => void;
    interfaceCode: string;
    setInterfaceCode: (interfaceCode: string) => void;
    interfaceName: string;
    setInterfaceName: (interfaceName: string) => void;
}

const _useNewCodeDialogStore = create<NewCodeDialogState>((set) => ({
    openNewCodeDialog: false,
    setOpenNewCodeDialog: (open) => set({ openNewCodeDialog: open }),
    interfaceCode: "",
    setInterfaceCode: (interfaceCode) => set({ interfaceCode: interfaceCode }),
    interfaceName: "",
    setInterfaceName: (interfaceName) => set({ interfaceName: interfaceName }),
}));

const NewCodeDiaog = (props: {
    onOK: () => void;
}) => {
    const { onOK } = props;

    const projectID = useProjectStore((state) => state.projectID);

    const openNewCodeDialog = _useNewCodeDialogStore((state) => state.openNewCodeDialog);
    const setOpenNewCodeDialog = _useNewCodeDialogStore((state) => state.setOpenNewCodeDialog);
    const interfaceCode = _useNewCodeDialogStore((state) => state.interfaceCode);
    const setInterfaceCode = _useNewCodeDialogStore((state) => state.setInterfaceCode);
    const interfaceName = _useNewCodeDialogStore((state) => state.interfaceName);
    const setInterfaceName = _useNewCodeDialogStore((state) => state.setInterfaceName);

    const handleClose = () => {
        setOpenNewCodeDialog(false);
    };

    const handleTransitionEnter = () => {
        setInterfaceCode("");
        setInterfaceName("");
    };

    const handleCreate = () => {
        createInterfaceCode(projectID,
            { interfaceCode: interfaceCode, interfaceName: interfaceName, interfaceItems: { fixedItems: [], iterativeItems: [] } }, {
            onOK: () => {
                handleClose();
                onOK();
            },
            onError: () => { }
        });
    };

    return (
        <CustomModal open={openNewCodeDialog} onClose={handleClose} onTransitionEnter={handleTransitionEnter}>
            <CustomModalTitle title="New InterfaceCode" />
            <CustomModalContents>
                <FormText required autoFocus formTitle="Code" formValue={interfaceCode} onFormChanged={(value) => setInterfaceCode(value)} />
                <FormText formTitle="Name" formValue={interfaceName} onFormChanged={(value) => setInterfaceName(value)} />
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" disabled={!interfaceCode} onClick={handleCreate}>Create</Button>
                <Button size="small" onClick={handleClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}

interface AskBeforeSaveDialogState {
    open: boolean;
    oldInfo: InterfaceInfo | null;
    newInfo: InterfaceInfo | null;
    setOpen: (oldInfo: InterfaceInfo | null, newInfo: InterfaceInfo | null) => void;
}

const _useAskBeforeSaveDialogStore = create<AskBeforeSaveDialogState>((set) => ({
    open: false,
    oldInfo: null,
    newInfo: null,
    setOpen: (oldInfo, newInfo) => {
        if (oldInfo && newInfo) {
            set({ open: true, oldInfo: oldInfo, newInfo: newInfo });
        } else {
            set({ open: false });
        }
    }
}));

const AskBeforeSaveDialog = (props: {
    onOK: () => void;
}) => {
    const { onOK } = props;

    const open = _useAskBeforeSaveDialogStore((state) => state.open);
    const oldInfo = _useAskBeforeSaveDialogStore((state) => state.oldInfo);
    const newInfo = _useAskBeforeSaveDialogStore((state) => state.newInfo);
    const setOpen = _useAskBeforeSaveDialogStore((state) => state.setOpen);

    const handleClose = () => {
        setOpen(null, null);
    }

    const handleSave = () => {

    }

    return (
        <CustomModal open={open} onClose={handleClose}>
            <CustomModalTitle title="Review Changes"/>
            <CustomModalContents>
                {"The following changes have been detected. Would you like to save them?"}
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small">Save</Button>
                <Button size="small">Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}

interface AskBeforeDeleteDialogState {
    open: boolean;
    target: string | null;
    setOpen: (target: string | null) => void;
}

const _useAskBeforeDeleteDialogStore = create<AskBeforeDeleteDialogState>((set) => ({
    open: false,
    target: null,
    setOpen: (target) => {
        if (target) {
            set({ open: true, target: target });
        } else {
            set({ open: false });
        }
    }
}));

const AskBeforeDeleteDialog = (props: {
    onOK: () => void;
}) => {
    const { onOK } = props;
    const projectID = useProjectStore((state) => state.projectID);

    const open = _useAskBeforeDeleteDialogStore((state) => state.open);
    const target = _useAskBeforeDeleteDialogStore((state) => state.target);
    const setOpen = _useAskBeforeDeleteDialogStore((state) => state.setOpen);

    const handleClose = () => {
        setOpen(null);
    };

    const handleDelete = () => {
        if (target) {
            deleteInterfaceInfo(projectID, target, {
                onOK: () => {
                    handleClose();
                    onOK();
                },
                onError: () => { }
            });
        }
    };

    return (
        <CustomModal open={open} onClose={handleClose}>
            <CustomModalTitle title={`Are you sure delete ${target}`} />
            <CustomModalContents>
                ⚠️ You cannot restore this InterfaceCode
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                <Button size="small" onClick={handleClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}

interface InterfaceInfoState {
    noRowsContextMenu: MenuPosition | null;
    setNoRowsContextMenu: (contextMenu: MenuPosition | null) => void;
    rowContextMenu: MenuPosition & { target: string } | null;
    setRowContextMenu: (contextMenu: MenuPosition & { target: string } | null) => void;
}

const _useInterfaceInfoStore = create<InterfaceInfoState & AlertState>((set) => ({
    noRowsContextMenu: null,
    setNoRowsContextMenu: (contextMenu) => set({ noRowsContextMenu: contextMenu }),
    rowContextMenu: null,
    setRowContextMenu: (contextMenu) => set({ rowContextMenu: contextMenu }),
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false }),
}));

interface UpdateInterfaceItemsDialogState {
    open: boolean;
    setOpen: (info: InterfaceInfo | null) => void;
    infoForUpdate: InterfaceInfo | undefined;
    setInfoForUpdate: (info: InterfaceInfo) => void;
}

const _useUpdateInterfaceItemsStore = create<UpdateInterfaceItemsDialogState>((set) => ({
    open: false,
    setOpen: (info) => {
        if (info) {
            set({ open: true, infoForUpdate: info });
        } else {
            set({ open: false });
        }
    },
    infoForUpdate: undefined,
    setInfoForUpdate: (info) => set({ infoForUpdate: info })
}))

const infoColumns: GridColDef[] = [
    { field: "interfaceCode", headerName: "Code", flex: 0.2, editable: true },
    { field: "interfaceName", headerName: "Name", flex: 0.5, editable: true },
];

const InterfaceInfoGrid = () => {
    const projectID = useProjectStore((state) => state.projectID);

    const infoRows = _useInterfaceEditorStore((state) => state.infoRows);
    const setInfoRows = _useInterfaceEditorStore((state) => state.setInfoRows);
    const setCodeForView = _useInterfaceEditorStore((state) => state.setCodeForView);

    const openUpdateItemsDialog = _useUpdateInterfaceItemsStore((state) => state.open);
    const setOpenUpdateItemsDialog = _useUpdateInterfaceItemsStore((state) => state.setOpen);
    const infoForUpdate = _useUpdateInterfaceItemsStore((state) => state.infoForUpdate);
    const setInfoForUpdate = _useUpdateInterfaceItemsStore((state) => state.setInfoForUpdate);

    const noRowsContextMenu = _useInterfaceInfoStore((state) => state.noRowsContextMenu);
    const setNoRowsContextMenu = _useInterfaceInfoStore((state) => state.setNoRowsContextMenu);
    const rowContextMenu = _useInterfaceInfoStore((state) => state.rowContextMenu);
    const setRowContextMenu = _useInterfaceInfoStore((state) => state.setRowContextMenu);

    const alert = _useInterfaceInfoStore((state) => state.alert);
    const serverity = _useInterfaceInfoStore((state) => state.serverity);
    const alertMessage = _useInterfaceInfoStore((state) => state.message);
    const showAlert = _useInterfaceInfoStore((state) => state.showAlert);
    const hideAlert = _useInterfaceInfoStore((state) => state.hideAlert);

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const refreshInterfaceInfos = async () => {
        await getInterfaceInfos(projectID, {
            onOK: (data) => {
                if (data) {
                    setInfoRows(data);
                }
            },
            onError: () => { }
        })
    }

    React.useEffect(() => {
        refreshInterfaceInfos();
    }, []);

    // https://mui.com/x/react-data-grid/editing/#confirm-before-saving
    const processRowUpdate = React.useCallback((newRow: GridRowModel, oldRow: GridRowModel) =>
        new Promise<GridRowModel>((resolve, reject) => {
            if (newRow.interfaceCode !== oldRow.interfaceCode) {
                if (!newRow.interfaceCode) {
                    showAlert("filled", "error", "InterfaceCode cannot be empty");
                    resolve(oldRow);
                } else {
                    updateInterfaceCode(projectID, oldRow.interfaceCode, newRow.interfaceCode, {
                        onOK: () => {
                            resolve(oldRow);
                            refreshInterfaceInfos();
                        },
                        onError: (message) => {
                            showAlert("filled", "error", message);
                            resolve(oldRow);
                        }
                    });
                }
            } else if (newRow.interfaceName !== oldRow.interfaceName) {
                updateInterfaceName(projectID, oldRow.interfaceCode, newRow.interfaceName, {
                    onOK: () => {
                        resolve(newRow);
                        refreshInterfaceInfos();
                    },
                    onError: () => {
                        resolve(oldRow);
                    }
                })
            } else {
                resolve(oldRow);
            }
        }),
        []
    );

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

    const handleRowClick = (params: GridRowParams, event: MuiEvent, details: GridCallbackDetails) => {
        if (params.row) {
            setCodeForView(params.row.interfaceCode);
        }
    }

    const handleCloseUpdateItemsDialog = () => {
        setOpenUpdateItemsDialog(null);
    };

    return (
        <Stack width="30%" height="100%" rowGap={1}>
            <EllipsisLabel variant="h6">Interface Informations</EllipsisLabel>
            <DataGrid
                columns={infoColumns} rows={infoRows} getRowId={(row) => row.interfaceCode}
                density="compact" 
                // editMode="row" rowModesModel={infoModesModel}
                disableColumnSelector disableDensitySelector disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true
                    },
                    row: {
                        onContextMenu: handleRowContextMenu
                    },
                    noRowsOverlay: {
                        onContextMenu: handleNoRowsContextMenu
                    }
                }}
                processRowUpdate={processRowUpdate}
                // onRowModesModelChange={handleRowModesModelChange}
                // onRowClick={handleRowClick}
                onRowClick={handleRowClick}
                sx={{ width: "100%" }}
            />
            <NoRowsContextMenu onRefresh={refreshInterfaceInfos} />
            <RowContextMenu onRefresh={refreshInterfaceInfos} />
            <NewCodeDiaog onOK={refreshInterfaceInfos} />
            <AskBeforeDeleteDialog onOK={refreshInterfaceInfos} />
            <UpdateInterfaceItemInfosDialog
                open={openUpdateItemsDialog} interfaceInfo={infoForUpdate} setInterfaceInfo={setInfoForUpdate}
                onClose={handleCloseUpdateItemsDialog} onUpdate={refreshInterfaceInfos}
            />
            <CustomSnackbar open={alert} close={hideAlert} severity={serverity ? serverity : "success"} message={alertMessage} />
        </Stack>
    )
}

const itemColumns: GridColDef[] = [
    { field: "transferType", headerName: "TxRx", flex: 0.05, editable: false, headerAlign: "center", align: "center", },
    { field: "assignType", headerName: "Type", flex: 0.1, editable: false, headerAlign: "center", align: "center", },
    { 
        field: "assignValue", headerName: "Name", flex: 0.1, editable: false, headerAlign: "center", align: "center",
        renderCell: (params: GridRenderCellParams<InterfaceItemInfo, string>) => {
            if (params.row.assignType === "V") {
                if (params.value) {
                    return <Chip size="small" color="primary" variant="outlined" label={params.value} />
                } else {
                    return <></>
                }
            } else if (params.row.assignType === "C") {
                return (
                    <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                        <Typography variant="caption" fontStyle="italic">{params.value}</Typography>
                    </Box>
                )
            } else {
                return <></>
            }
            
        },
    },
    { field: "itemPosition", headerName: "Start", flex: 0.05, editable: false, type: "number", headerAlign: "center", },
    { field: "itemLength", headerName: "Length", flex: 0.05, editable: false, type: "number", headerAlign: "center", },
    { 
        field: "itemSort", headerName: "Sort", flex: 0.05, editable: false, headerAlign: "center", align: "center",
        valueFormatter: (value: string) => {
            if (value === "D") {
                return "Default";
            } else if (value === "L") {
                return "Left";
            } else if (value === "R") {
                return "Right";
            } else {
                return "";
            }
        }
    },
    { 
        field: "itemReplace", headerName: "Replace", flex: 0.1, editable: false, headerAlign: "center", align: "center",
        valueFormatter: (value: string) => {
            if (value === "") {
                return "Default";
            } else if (value === " ") {
                return "Space";
            } else if (value === "0") {
                return "Zero";
            } else {
                return "";
            }
        }
    },
    { field: "itemDescription", headerName: "Description", flex: 0.1, editable: false, headerAlign: "center", },
];

const IntrefaceItemGrid = () => {
    const infoRows = _useInterfaceEditorStore((state) => state.infoRows);
    const codeForView = _useInterfaceEditorStore((state) => state.codeForView);
    // const fixedItemRows = _useInterfaceEditorStore((state) => state.fixedItemRows);
    // const iterativeItemRows = _useInterfaceEditorStore((state) => state.iterativeItemRows);
    let fixedItems: InterfaceItemInfo[] = [];
    let iterativeItems: InterfaceItemInfo[] = [];

    if (infoRows && codeForView) {
        const found = infoRows.find((row) => row.interfaceCode === codeForView);
        if (found) {
            const { interfaceItems } = found;
            fixedItems = interfaceItems.fixedItems;
            iterativeItems = interfaceItems.iterativeItems;
        }
    }

    return (
        <Stack width="70%" height="100%" rowGap={1}>
            <EllipsisLabel variant="h6">Fixed Items <Chip label="Readonly" size="small" /></EllipsisLabel>
            <DataGrid
                rows={fixedItems} columns={itemColumns} getRowId={(row) => row.itemIndex}
                density="compact" disableColumnSelector disableDensitySelector disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        printOptions: { disableToolbarButton: true },
                        csvOptions: { disableToolbarButton: true }
                    }
                }}
            // sx={{ minHeight: "30vh" }}
            />
            <EllipsisLabel variant="h6">Itreative Items <Chip label="Readonly" size="small" /></EllipsisLabel>
            <DataGrid
                rows={iterativeItems} columns={itemColumns} getRowId={(row) => row.itemIndex}
                density="compact"
                disableColumnSelector disableDensitySelector disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        printOptions: { disableToolbarButton: true },
                        csvOptions: { disableToolbarButton: true }
                    }
                }}
            // sx={{ minHeight: "30vh" }}
            />
        </Stack>
    )
}

export const ISACIVRInterfaceEditor = () => {

    return (
        <Stack width="100%" height="100%" direction="row" columnGap={2} paddingTop="1%" paddingInline="1%" overflow="hidden">
            <InterfaceInfoGrid />
            <IntrefaceItemGrid />
        </Stack>
    )
}