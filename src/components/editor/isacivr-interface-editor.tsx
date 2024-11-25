import { useProjectStore } from "@/store/workspace-store";
import { Box, Button, Chip, Divider, FormControl, Menu, MenuItem, MenuList, Select, SelectChangeEvent, Stack, TextField, Typography } from "@mui/material"
import { DataGrid, GridCallbackDetails, GridColDef, GridEventListener, GridRenderCellParams, GridRenderEditCellParams, GridRowEditStopReasons, GridRowModel, GridRowParams, GridToolbar, MuiEvent, useGridApiContext } from "@mui/x-data-grid";
import { create } from "zustand";
import React, { ReactNode } from "react";
import { AlertState, MenuPosition } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";
import { InterfaceInformation, InterfaceItem, VariableInformation } from "@/service/global";
import { EllipsisLabel } from "../common/typhography";
import { NewInterfaceDialog, NewInterfaceDialogState } from "../dialog/NewInterfaceDialog";
import { DeleteInterfaceDailogState, DeleteInterfaceDialog } from "../dialog/DeleteInterfaceDialog";
import { getVariableInfos } from "@/service/fetch/crud/variables";
import { GridContextMenuState } from "../common/grid";
import _ from "lodash";

const InfoGridRowMenu = (props: {
    position: MenuPosition & { target: string } | null;
    onClose: () => void;
    onAdd: () => void;
    onDelete: (interfaceCode: string) => void;
}) => {
    const { position, onClose, onAdd, onDelete } = props;

    const handleAdd = () => {
        onClose();
        onAdd();
    };

    const handleDelete = () => {
        onClose();
        if (position?.target) {
            onDelete(position?.target);
        }
    }

    return (
        <Menu
            open={position !== null} onClose={onClose} anchorReference="anchorPosition"
            anchorPosition={position !== null ? { top: position.mouseY, left: position.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
                <MenuItem disabled>Copy</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
                <Divider />
                <MenuItem disabled>Find All References</MenuItem>
            </MenuList>
        </Menu>
    )
}

const InfoGridNoRowsMenu = (props: {
    position: MenuPosition | null;
    onClose: () => void;
    onAdd: () => void;
}) => {
    const { position, onClose, onAdd } = props;

    const handleAdd = () => {
        onClose();
        onAdd();
    };

    return (
        <Menu
            open={position !== null} onClose={onClose} anchorReference="anchorPosition"
            anchorPosition={position !== null ? { top: position.mouseY, left: position.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
            </MenuList>
        </Menu>
    )
}

interface InterfaceEditorState {
    codeForView: string | undefined;
    setCodeForView: (code: string) => void;
    variableInfos: VariableInformation[] | undefined;
    setVariableInfos: (variableInfos: VariableInformation[]) => void,
    fixedItemRows: InterfaceItem[];
    setFixedItemRows: (itemInfos: InterfaceItem[]) => void;
    iterativeItemRows: InterfaceItem[];
    setIterativeItemRows: (details: InterfaceItem[]) => void;
}

const _useInterfaceEditorStore = create<InterfaceEditorState & AlertState>((set, get) => ({
    codeForView: undefined,
    setCodeForView: (code) => set({ codeForView: code }),
    variableInfos: undefined,
    setVariableInfos: (variableInfos) => set({ variableInfos }),
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

interface InterfaceInfoGridState {
    noRowsMenuPosition: MenuPosition | null;
    setNoRowsMenuPosition: (contextMenu: MenuPosition | null) => void;
    rowMenuPosition: MenuPosition & { target: string } | null;
    setRowMenuPosition: (contextMenu: MenuPosition & { target: string } | null) => void;
}

const _useInterfaceInfoGridStore = create<InterfaceInfoGridState & AlertState>((set) => ({
    noRowsMenuPosition: null,
    setNoRowsMenuPosition: (contextMenu) => set({ noRowsMenuPosition: contextMenu }),
    rowMenuPosition: null,
    setRowMenuPosition: (contextMenu) => set({ rowMenuPosition: contextMenu }),
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false }),
}));

const _useNewInterfaceDialogStore = create<NewInterfaceDialogState>((set) => ({
    open: false,
    setOpen: (open) => set({ open })
}));

const _useDeleteInterfaceDialogStore = create<DeleteInterfaceDailogState>((set) => ({
    open: false,
    interfaceInfo: undefined,
    setOpen: (interfaceInfo) => {
        if (interfaceInfo) {
            set({ open: true, interfaceInfo });
        } else {
            set({ open: false });
        }
    }
}));

const infoColumns: GridColDef[] = [
    { field: "interfaceCode", headerName: "Code", flex: 0.2, editable: true },
    { field: "interfaceName", headerName: "Name", flex: 0.5, editable: true },
];

const InterfaceInfoGrid = (props: {
    interfaceInfos: InterfaceInformation[];
    onCreate: (info: InterfaceInformation) => void;
    onUpdate: (oldInfo: InterfaceInformation, newInfo: InterfaceInformation) => void;
    onDelete: (interfaceCode: string) => void;
}) => {
    const { interfaceInfos, onCreate, onUpdate, onDelete } = props;

    const projectID = useProjectStore((state) => state.projectID);

    const setCodeForView = _useInterfaceEditorStore((state) => state.setCodeForView);
    const variableInfos = _useInterfaceEditorStore((state) => state.variableInfos);
    const setVariableInfos = _useInterfaceEditorStore((state) => state.setVariableInfos);

    const openNewInterfaceDialog = _useNewInterfaceDialogStore((state) => state.open);
    const setOpenNewInterfaceDialog = _useNewInterfaceDialogStore((state) => state.setOpen);
    const noRowsMenuPosition = _useInterfaceInfoGridStore((state) => state.noRowsMenuPosition);
    const setNoRowsMenuPosition = _useInterfaceInfoGridStore((state) => state.setNoRowsMenuPosition);
    const rowMenuPosition = _useInterfaceInfoGridStore((state) => state.rowMenuPosition);
    const setRowMenuPosition = _useInterfaceInfoGridStore((state) => state.setRowMenuPosition);

    const alert = _useInterfaceInfoGridStore((state) => state.alert);
    const serverity = _useInterfaceInfoGridStore((state) => state.serverity);
    const alertMessage = _useInterfaceInfoGridStore((state) => state.message);
    const showAlert = _useInterfaceInfoGridStore((state) => state.showAlert);
    const hideAlert = _useInterfaceInfoGridStore((state) => state.hideAlert);

    const openDeleteInterfaceDialog = _useDeleteInterfaceDialogStore((state) => state.open);
    const infoForDelete = _useDeleteInterfaceDialogStore((state) => state.interfaceInfo);
    const setOpenDeleteInterfaceDialog = _useDeleteInterfaceDialogStore((state) => state.setOpen);

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    React.useEffect(() => { }, []);

    // https://mui.com/x/react-data-grid/editing/#confirm-before-saving
    const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {

        if (newRow.interfaceCode !== oldRow.interfaceCode) {
            if (!newRow.interfaceCode) {
                showAlert("filled", "error", "InterfaceCode cannot be empty");
            } else {
                onUpdate(oldRow as InterfaceInformation, newRow as InterfaceInformation);
            }
        }

        if (newRow.interfaceName !== oldRow.interfaceName) {
            onUpdate(oldRow as InterfaceInformation, newRow as InterfaceInformation);
        }

        return newRow;
    };

    const handleRowMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const id = event.currentTarget.getAttribute("data-id");
        if (id) {
            setRowMenuPosition(rowMenuPosition === null ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, target: id } : null);
        }
    };

    const handleRowMenuClose = () => {
        setRowMenuPosition(null);
    };

    const handleNoRowsMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setNoRowsMenuPosition(noRowsMenuPosition === null ? { mouseX: event.clientX - 2, mouseY: event.clientY } : null);
    };

    const handleNoRowsMenuClose = () => {
        setNoRowsMenuPosition(null);
    };

    const handleRowClick = (params: GridRowParams, event: MuiEvent, details: GridCallbackDetails) => {
        if (params.row) {
            setCodeForView(params.row.interfaceCode);
            if (!variableInfos) {
                getVariableInfos(projectID, {
                    onOK: (data) => {
                        setVariableInfos(data);
                    },
                    onError: (message) => { }
                });
            }
        }
    }

    const handleAdd = () => {
        setOpenNewInterfaceDialog(true)
    };

    const handleDelete = (interfaceCode: string) => {
        const found = interfaceInfos.find((info) => info.interfaceCode === interfaceCode);
        if (found) {
            setOpenDeleteInterfaceDialog(found);
        }
    };

    return (
        <Stack width="30%" height="100%" rowGap={1}>
            <EllipsisLabel variant="h6">Interface Informations</EllipsisLabel>
            <DataGrid
                columns={infoColumns} rows={interfaceInfos} getRowId={(row) => row.interfaceCode}
                density="compact" disableColumnSelector disableDensitySelector
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true
                    },
                    row: {
                        onContextMenu: handleRowMenu
                    },
                    noRowsOverlay: {
                        onContextMenu: handleNoRowsMenu
                    }
                }}
                processRowUpdate={processRowUpdate}
                onRowClick={handleRowClick}
            />
            <InfoGridRowMenu position={rowMenuPosition} onClose={handleRowMenuClose} onAdd={handleAdd} onDelete={handleDelete} />
            <InfoGridNoRowsMenu position={noRowsMenuPosition} onClose={handleNoRowsMenuClose} onAdd={handleAdd} />
            <NewInterfaceDialog
                open={openNewInterfaceDialog} onClose={() => setOpenNewInterfaceDialog(false)}
                interfaceInfos={interfaceInfos} onCreate={onCreate}
            />
            <DeleteInterfaceDialog
                open={openDeleteInterfaceDialog} onClose={() => setOpenDeleteInterfaceDialog(undefined)}
                interfaceInfo={infoForDelete} onDelete={onDelete}
            />
            <CustomSnackbar open={alert} close={hideAlert} severity={serverity ? serverity : "success"} message={alertMessage} />
        </Stack>
    )
}

const ItemGridRowMenu = (props: {
    position: MenuPosition & { target: string } | null;
    onClose: () => void;
    onAdd: (itemIndex: string) => void;
    onDelete: (itemIndex: string) => void;
}) => {
    const { position, onClose, onAdd, onDelete } = props;

    const handleAdd = () => {
        onClose();
        if (position?.target) {
            onAdd(position?.target);
        }
    };

    const handleDelete = () => {
        onClose();
        if (position?.target) {
            onDelete(position?.target);
        }
    };

    return (
        <Menu
            open={position !== null} onClose={onClose} anchorReference="anchorPosition"
            anchorPosition={position !== null ? { top: position.mouseY, left: position.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
                <MenuItem disabled>Copy</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </MenuList>
        </Menu>
    )
}

const ItemGridNoRowMenu = (props: {
    position: MenuPosition | null;
    onClose: () => void;
    onAdd: () => void;
}) => {
    const { position, onClose, onAdd } = props;

    const handleAdd = () => {
        onClose();
        onAdd();
    };

    return (
        <Menu
            open={position !== null} onClose={onClose} anchorReference="anchorPosition"
            anchorPosition={position !== null ? { top: position.mouseY, left: position.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
            </MenuList>
        </Menu>
    )
}

const VValueComponent = (props: GridRenderEditCellParams) => {
    const { id, value, field, hasFocus } = props;
    const apiRef = useGridApiContext();
    const ref = React.useRef<HTMLInputElement>(null);

    const variableInfos = _useInterfaceEditorStore((state) => state.variableInfos);

    React.useLayoutEffect(() => {
        if (hasFocus && ref.current) {
            ref.current.focus();
        }
    }, [hasFocus]);

    const handleValueChange = (event: SelectChangeEvent<any>, child: ReactNode) => {
        const newValue = event.target.value;
        apiRef.current.setEditCellValue({ id, field, value: newValue });
    };

    return (
        <FormControl fullWidth size="small">
            <Select value={value} defaultOpen onChange={handleValueChange}>
                {
                    variableInfos?.map((info) => (
                        <MenuItem key={info.variableName} value={info.variableAccessKey + "." + info.variableName}>
                            {info.variableName}
                        </MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )
}

const CValueComponent = (props: GridRenderEditCellParams) => {
    const { id, value, field, hasFocus } = props;
    const apiRef = useGridApiContext();
    const ref = React.useRef<HTMLInputElement>(null);

    React.useLayoutEffect(() => {
        if (hasFocus && ref.current) {
            ref.current.focus();
        }
    }, [hasFocus]);

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        apiRef.current.setEditCellValue({ id, field, value: newValue });
    };

    return (
        <TextField autoFocus size="small" value={value} onChange={handleValueChange} />
    )
}

const itemColumns: GridColDef[] = [
    {
        field: "itemIndex", headerName: "Index", flex: 0.03, editable: false, type: "number", headerAlign: "center", align: "center"
    },
    {
        field: "transferType", headerName: "TxRx", flex: 0.05, editable: true, headerAlign: "center", align: "center",
        type: "singleSelect", valueOptions: ["both", "tx", "rx"]
    },
    {
        field: "assignType", headerName: "Type", flex: 0.05, editable: true, headerAlign: "center", align: "center",
        type: "singleSelect", valueOptions: ["V", "C", "S"]
    },
    {
        field: "assignValue", headerName: "Name", flex: 0.1, editable: true, headerAlign: "center", align: "center",
        renderCell: (params: GridRenderCellParams<InterfaceItem, string>) => {
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
        renderEditCell: (params: GridRenderEditCellParams) => {
            if (params.row.assignType === "V") {
                return <VValueComponent {...params} />
            } else if (params.row.assignType === "C") {
                return <CValueComponent {...params} />
            } else {
                <></>
            }
        },
    },
    { field: "itemPosition", headerName: "Start", flex: 0.05, editable: true, type: "number", headerAlign: "center", },
    { field: "itemLength", headerName: "Length", flex: 0.05, editable: true, type: "number", headerAlign: "center", },
    {
        field: "itemSort", headerName: "Sort", flex: 0.07, editable: true, headerAlign: "center", align: "center",
        type: "singleSelect", valueOptions: [{ value: "D", label: "Default" }, { value: "L", label: "Left" }, { value: "R", label: "Right" }]
    },
    {
        field: "itemReplace", headerName: "Replace", flex: 0.07, editable: true, headerAlign: "center", align: "center",
        type: "singleSelect", valueOptions: [{ value: "", label: "Default" }, { value: " ", label: "Space" }, { value: "0", label: "Zero" }]
    },
    { field: "itemDescription", headerName: "Description", flex: 0.1, editable: true, headerAlign: "center", }
];

const InterfaceItemGrid = (props: {
    interfaceItems: InterfaceItem[];
    onUpdate: (newItems: InterfaceItem[]) => void;
} & GridContextMenuState) => {
    const { interfaceItems, onUpdate, rowMenuPosition, setRowMenuPosition, noRowsMenuPosition, setNoRowsMenuPosition } = props;

    const handleRowMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const id = event.currentTarget.getAttribute("data-id");
        if (id) {
            setRowMenuPosition(rowMenuPosition === null ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, target: id } : null);
        }
    };

    const handleRowMenuClose = () => {
        setRowMenuPosition(null);
    };

    const handleNoRowsMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setNoRowsMenuPosition(noRowsMenuPosition === null ? { mouseX: event.clientX - 2, mouseY: event.clientY } : null);
    };

    const handleNoRowsMenuClose = () => {
        setNoRowsMenuPosition(null);
    };

    const handleAdd = (currentRowID?: string) => {
        if (currentRowID) {
            const itemIndex = parseInt(currentRowID);
            const currentRow = interfaceItems.find((item) => item.itemIndex === itemIndex);
            if (currentRow) {
                const newInterfaceItems: InterfaceItem[] = [];
                interfaceItems.forEach((item) => {
                    if (item.itemIndex < itemIndex) {
                        newInterfaceItems.push(item);
                    } else if (item.itemIndex === itemIndex) {
                        newInterfaceItems.push(item);
                        newInterfaceItems.push({
                            itemIndex: currentRow.itemIndex + 1, transferType: currentRow.transferType, assignType: "V", assignValue: "",
                            itemPosition: 0, itemLength: 0, itemSort: "", itemReplace: "", itemDescription: ""
                        });
                    } else {
                        newInterfaceItems.push({ ...item, itemIndex: item.itemIndex + 1 });
                    }
                });
                onUpdate(newInterfaceItems);
            }
        } else {
            onUpdate([...interfaceItems, {
                itemIndex: 0, transferType: "both", assignType: "V", assignValue: "",
                itemPosition: 0, itemLength: 0, itemSort: "", itemReplace: "", itemDescription: ""
            }]);
        }
    };

    const handleDelete = (currentRowID?: string) => {
        if (currentRowID) {
            const itemIndex = parseInt(currentRowID);
            const newInterfaceItems: InterfaceItem[] = [];
            interfaceItems.forEach((item) => {
                if (item.itemIndex < itemIndex) {
                    newInterfaceItems.push(item);
                } else if (item.itemIndex === itemIndex) {
                    return;
                } else {
                    newInterfaceItems.push({ ...item, itemIndex: item.itemIndex - 1});
                }
            });
            onUpdate(newInterfaceItems);
        }
    };

    const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
        let editedRow: any = {};

        if (newRow.assignType !== oldRow.assignType) {
            editedRow = { ...newRow, assignValue: "" };
        } else {
            editedRow = newRow;
        }

        if (interfaceItems) {
            onUpdate([ ...interfaceItems.map((item) => {
                if (item.itemIndex === oldRow.itemIndex) {
                    return editedRow;
                } else {
                    return item;
                }
            })]);
        }
        return editedRow;
    }

    return (
        <>
            <DataGrid
                rows={interfaceItems} columns={itemColumns} getRowId={(row) => row.itemIndex}
                density="compact" disableColumnSelector disableDensitySelector disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        printOptions: { disableToolbarButton: true },
                        csvOptions: { disableToolbarButton: true }
                    },
                    row: {
                        onContextMenu: handleRowMenu
                    },
                    noRowsOverlay: {
                        onContextMenu: handleNoRowsMenu
                    }
                }}
                processRowUpdate={processRowUpdate}
            />
            <ItemGridRowMenu position={rowMenuPosition} onClose={handleRowMenuClose} onAdd={handleAdd} onDelete={handleDelete} />
            <ItemGridNoRowMenu position={noRowsMenuPosition} onClose={handleNoRowsMenuClose} onAdd={handleAdd} />
        </>
    )
}

const _useInterfaceFixedItemGridStore = create<GridContextMenuState>((set) => ({
    noRowsMenuPosition: null,
    setNoRowsMenuPosition: (contextMenu) => set({ noRowsMenuPosition: contextMenu }),
    rowMenuPosition: null,
    setRowMenuPosition: (contextMenu) => set({ rowMenuPosition: contextMenu })
}));

const _useInterfaceIterativeItemGridStore = create<GridContextMenuState>((set) => ({
    noRowsMenuPosition: null,
    setNoRowsMenuPosition: (contextMenu) => set({ noRowsMenuPosition: contextMenu }),
    rowMenuPosition: null,
    setRowMenuPosition: (contextMenu) => set({ rowMenuPosition: contextMenu })
}));

const IntrefaceItemGrids = (props: {
    interfaceInfos: InterfaceInformation[];
    interfaceCode: string | undefined;
    onUpdate: (oldInfo: InterfaceInformation, newInfo: InterfaceInformation) => void;
}) => {
    const { interfaceInfos, interfaceCode, onUpdate } = props;

    const fixedNoRowsMenuPosition = _useInterfaceFixedItemGridStore((state) => state.noRowsMenuPosition);
    const setFiexedNoRowsMenuPosition = _useInterfaceFixedItemGridStore((state) => state.setNoRowsMenuPosition);
    const fixedRowsMenuPosition = _useInterfaceFixedItemGridStore((state) => state.rowMenuPosition);
    const setFiexedRowsMenuPosition = _useInterfaceFixedItemGridStore((state) => state.setRowMenuPosition);

    const iterativeNoRowsMenuPosition = _useInterfaceIterativeItemGridStore((state) => state.noRowsMenuPosition);
    const setIterativeNoRowsMenuPosition = _useInterfaceIterativeItemGridStore((state) => state.setNoRowsMenuPosition);
    const iterativeRowsMenuPosition = _useInterfaceIterativeItemGridStore((state) => state.rowMenuPosition);
    const setIterativeRowsMenuPosition = _useInterfaceIterativeItemGridStore((state) => state.setRowMenuPosition);

    let interfaceInfo = interfaceInfos.find((row) => row.interfaceCode === interfaceCode);
    let fixedItems: InterfaceItem[] | undefined = undefined;
    let iterativeItems: InterfaceItem[] | undefined = undefined;

    if (interfaceInfo) {
        const found = interfaceInfos.find((row) => row.interfaceCode === interfaceCode);
        if (found) {
            const { interfaceItems } = interfaceInfo;
            fixedItems = interfaceItems.fixedItems;
            iterativeItems = interfaceItems.iterativeItems;
        }
    }

    const handleFixedItemUpdate = (newFixedItems: InterfaceItem[]) => {
        if (interfaceInfo && fixedItems && iterativeItems) {
            onUpdate(interfaceInfo, { ...interfaceInfo, interfaceItems: { fixedItems: newFixedItems, iterativeItems: [...iterativeItems] } });
        }
    }

    const handleIterativeItemsUpdate = (newIterativeItems: InterfaceItem[]) => {
        if (interfaceInfo && fixedItems && iterativeItems) {
            onUpdate(interfaceInfo, { ...interfaceInfo, interfaceItems: { fixedItems: [...fixedItems], iterativeItems: newIterativeItems } });
        }
    }

    return (
        <Stack width="70%" height="100%" rowGap={1}>
            <EllipsisLabel variant="h6">Fixed Items</EllipsisLabel>
            <InterfaceItemGrid
                interfaceItems={fixedItems? fixedItems : []} onUpdate={handleFixedItemUpdate}
                noRowsMenuPosition={fixedNoRowsMenuPosition} setNoRowsMenuPosition={setFiexedNoRowsMenuPosition}
                rowMenuPosition={fixedRowsMenuPosition} setRowMenuPosition={setFiexedRowsMenuPosition}
            />
            <EllipsisLabel variant="h6">Itreative Items</EllipsisLabel>
            <InterfaceItemGrid
                interfaceItems={iterativeItems? iterativeItems : []} onUpdate={handleIterativeItemsUpdate}
                noRowsMenuPosition={iterativeNoRowsMenuPosition} setNoRowsMenuPosition={setIterativeNoRowsMenuPosition}
                rowMenuPosition={iterativeRowsMenuPosition} setRowMenuPosition={setIterativeRowsMenuPosition}
            />
        </Stack>
    )
}

export const ISACIVRInterfaceEditor = (props: {
    interfaceInfos: InterfaceInformation[],
    setTabModified: (interfaceInfos: InterfaceInformation[]) => void;
}) => {
    const { interfaceInfos, setTabModified } = props;

    const codeForView = _useInterfaceEditorStore((state) => state.codeForView);

    const handleCreateInfo = (newInfo: InterfaceInformation) => {
        setTabModified([...interfaceInfos, newInfo]);
    };

    const handleUpdateInfo = (oldInfo: InterfaceInformation, newInfo: InterfaceInformation) => {
        setTabModified([...interfaceInfos.filter((info) => info.interfaceCode !== oldInfo.interfaceCode), newInfo]);
    };

    const handleDeleteInfo = (interfaceCode: string) => {
        setTabModified(interfaceInfos.filter((info) => info.interfaceCode !== interfaceCode));
    };

    return (
        <Stack width="100%" height="100%" direction="row" columnGap={2} padding="1%" overflow="hidden">
            <InterfaceInfoGrid
                interfaceInfos={interfaceInfos} onCreate={handleCreateInfo}
                onUpdate={handleUpdateInfo} onDelete={handleDeleteInfo}
            />
            <IntrefaceItemGrids interfaceInfos={interfaceInfos} interfaceCode={codeForView} onUpdate={handleUpdateInfo} />
        </Stack>
    )
}