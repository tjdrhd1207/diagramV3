import { InterfaceInfo, InterfaceItemInfo, VariableInfo } from "@/service/global"
import { MenuPosition, TabState } from "@/store/_interfaces"
import { create } from "zustand"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalProps, CustomModalTitle } from "../common/modal"
import { Tabs, Tab, Button, Menu, MenuItem, MenuList, Chip, TextField, FormControl, InputLabel, Select, SelectChangeEvent, Input, Typography, Box, Divider } from "@mui/material"
import { DataGrid, GridCellParams, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowModel, GridRowModesModel, GridToolbar, GridTreeNode, GridValidRowModel, useGridApiContext } from "@mui/x-data-grid"
import { TabPanel } from "../common/tab"
import { getVariableInfos } from "@/service/fetch/crud/variables"
import { useProjectStore } from "@/store/workspace-store"
import React, { ReactNode } from "react"
import { updateInterfaceItems } from "@/service/fetch/crud/interfaces"

const NoRowsContextMenu = (props: {
    position: MenuPosition | null;
    onClose: () => void;
    onAdd: () => void;
}) => {
    const { position, onClose, onAdd } = props;

    return (
        <Menu
            open={position !== null} onClose={onClose} anchorReference="anchorPosition"
            anchorPosition={position !== null ? { top: position.mouseY, left: position.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={onAdd}>Add</MenuItem>
            </MenuList>
        </Menu>
    )
}

const RowContextMenu = (props: {
    position: MenuPosition & { target: number } | null;
    onClose: () => void;
    onAdd: (target: number) => void;
    onDelete: (target: number) => void;
}) => {
    const { position, onClose, onAdd, onDelete } = props;

    const handleAdd = () => {
        if (position) {
            const target = position.target;
            if (typeof target === "number") {
                onAdd(target);
            }
        }
    }

    const handleDelete = () => {

    }

    return (
        <Menu
            open={position !== null} onClose={onClose} anchorReference="anchorPosition"
            anchorPosition={position !== null ? { top: position.mouseY, left: position.mouseX } : undefined}
        >
            <MenuList dense disablePadding>
                <MenuItem onClick={handleAdd}>Add</MenuItem>
                <MenuItem onClick={position?.target? () => onDelete(position.target) : undefined}>Delete</MenuItem>
                <Divider />
                <MenuItem disabled>Up</MenuItem>
                <MenuItem disabled>Down</MenuItem>
            </MenuList>
        </Menu>
    )
}

interface GridContextMenuState {
    noRowsContextMenu: MenuPosition | null;
    setNoRowsContextMenu: (contextMenu: MenuPosition | null) => void;
    rowContextMenu: MenuPosition & { target: number } | null;
    setRowContextMenu: (contextMenu: MenuPosition & { target: number } | null) => void;
}

const VValueComponent = (props: GridRenderEditCellParams) => {
    const { id, value, field, hasFocus } = props;
    const apiRef = useGridApiContext();
    const ref = React.useRef<HTMLInputElement>(null);

    const variableInfos = _useUpdateInterfaceItemInfosStore((state) => state.variableInfos);

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
        <TextField autoFocus size="small" value={value} onChange={handleValueChange}/>
    )
}

const itemColumns: GridColDef[] = [
    {
        field: "itemIndex", headerName: "Index", flex: 0.03, editable: false, type: "number", headerAlign: "center", align: "center" 
    },
    {
        field: "transferType", headerName: "TxRx", flex: 0.05, editable: true, headerAlign: "center", align: "center",
        type: "singleSelect", valueOptions: [ "both", "tx", "rx" ]
    },
    {
        field: "assignType", headerName: "Type", flex: 0.05, editable: true, headerAlign: "center", align: "center",
        type: "singleSelect", valueOptions: [ "V", "C", "S" ]
    },
    {
        field: "assignValue", headerName: "Name", flex: 0.1, editable: true, headerAlign: "center", align: "center",
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
        renderEditCell: (params: GridRenderEditCellParams) => {
            if (params.row.assignType === "V") {
                return <VValueComponent { ...params } />
            } else if (params.row.assignType === "C") {
                return <CValueComponent { ...params } />
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
        type: "singleSelect", valueOptions: [ { value: "", label: "Default" }, { value: " ", label: "Space" }, { value: "0", label: "Zero" }]
    },
    { field: "itemDescription", headerName: "Description", flex: 0.1, editable: true, headerAlign: "center", },
];

const _useFixedItemsGridStore = create<GridContextMenuState>((set) => ({
    noRowsContextMenu: null,
    setNoRowsContextMenu: (contextMenu) => set({ noRowsContextMenu: contextMenu }),
    rowContextMenu: null,
    setRowContextMenu: (contextMenu) => set({ rowContextMenu: contextMenu }),
}));

const FixedItemsGrid = (props: {
    itemInfos: InterfaceItemInfo[] | undefined;
    onItemInfosChange: (newItemInfos: InterfaceItemInfo[]) => void;
}) => {
    const { itemInfos, onItemInfosChange } = props;

    const noRowsContextMenu = _useFixedItemsGridStore((state) => state.noRowsContextMenu);
    const setNoRowsContextMenu = _useFixedItemsGridStore((state) => state.setNoRowsContextMenu);
    const rowContextMenu = _useFixedItemsGridStore((state) => state.rowContextMenu);
    const setRowContextMenu = _useFixedItemsGridStore((state) => state.setRowContextMenu);

    const handleNoRowsContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setNoRowsContextMenu(noRowsContextMenu === null? { mouseX: event.clientX - 2, mouseY: event.clientY } : null);
    };

    const handleRowContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const id = event.currentTarget.getAttribute("data-id");
    
        if (id) {
            const rowIndex = parseInt(id);
            if (typeof rowIndex === "number") {
                setRowContextMenu(rowContextMenu === null? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, target: rowIndex } : null);
            }
        }
    };

    const handleAddFixedItemInfo = (currentRowID: number | null) => {
        if (itemInfos) {
            if (typeof currentRowID === "number") {
                const currentRow = itemInfos.find((value) => value.itemIndex === currentRowID);
                if (currentRow) {
                    const newItemInfos: InterfaceItemInfo[] = [];
                    itemInfos.forEach((info) => {
                        if (info.itemIndex < currentRowID) {
                            newItemInfos.push(info);
                        } else if (info.itemIndex == currentRowID) {
                            newItemInfos.push(info);
                            newItemInfos.push({ 
                                itemIndex: currentRow.itemIndex + 1, transferType: currentRow.transferType, assignType: "V", assignValue: "",
                                itemPosition: 0, itemLength: 0, itemSort: "", itemReplace: "", itemDescription: ""
                            });
                        } else {
                            newItemInfos.push({ ...info, itemIndex: info.itemIndex + 1 });
                        }
                    });
                    onItemInfosChange(newItemInfos);
                }
                setRowContextMenu(null);
            } else {
                onItemInfosChange([
                    { 
                        itemIndex: 0, transferType: "both", assignType: "V", assignValue: "",
                        itemPosition: 0, itemLength: 0, itemSort: "", itemReplace: "", itemDescription: ""
                    }
                ]);
                setNoRowsContextMenu(null);
            }
        }
    };

    const handleDeleteFixedItemInfo = (currentRowID: number) => {
        if (itemInfos) {
            const newItemInfos: InterfaceItemInfo[] = [];
            itemInfos.forEach((info) => {
                if (info.itemIndex < currentRowID) {
                    newItemInfos.push(info);
                } else if (info.itemIndex == currentRowID) {
                    return;
                } else {
                    newItemInfos.push({ ...info, itemIndex: info.itemIndex - 1 });
                }
            });
            onItemInfosChange(newItemInfos);
            setRowContextMenu(null);
        }
    }

    const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
        let editedRow: any = {};

        if (newRow.assignType !== oldRow.assignType) {
            editedRow = { ...newRow, assignValue: "" };
        } else {
            editedRow = newRow;
        }

        if (itemInfos) {
            onItemInfosChange(itemInfos.map((info) => {
                if (info.itemIndex === oldRow.itemIndex) {
                    return editedRow;
                } else {
                    return info;
                }
            }));
        }

        return editedRow;
    };

    // const processRowUpdate = React.useCallback((newRow: GridRowModel, oldRow: GridRowModel) =>
    //     new Promise<GridRowModel>((resolve, reject) => {
    //         console.log(itemInfos);
    //         let editedRow: any = {};

    //         if (newRow.assignType !== oldRow.assignType) {
    //             editedRow = { ...newRow, assignValue: "" };
    //         } else {
    //             editedRow = newRow;
    //         }

    //         resolve(editedRow);
    //         // if (itemInfos) {
    //         //     onItemInfosChange(itemInfos.map((info) => {
    //         //         if (info.itemIndex === oldRow.itemIndex) {
    //         //             return editedRow;
    //         //         } else {
    //         //             return info;
    //         //         }
    //         //     }));
    //         // }
    //     }
    // ), []);

    const isCellEditable = (params: GridCellParams<any, GridValidRowModel, GridValidRowModel, GridTreeNode>) => {
        if (params.row.assignType === "S") {
            if (params.field === "assignValue") {
                return false;
            }
        }
        return true;
    };

    return (
        <>
            <DataGrid
                rows={itemInfos} columns={itemColumns} getRowId={(row) => row.itemIndex}
                density="compact" disableColumnSelector disableDensitySelector disableRowSelectionOnClick
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
                isCellEditable={isCellEditable}
                sx={{ height: "50vh" }}
            />
            <NoRowsContextMenu
                position={noRowsContextMenu} onClose={() => setNoRowsContextMenu(null)}
                onAdd={() => handleAddFixedItemInfo(null)}
            />
            <RowContextMenu position={rowContextMenu} onClose={() => setRowContextMenu(null)}
                onAdd={(target) => handleAddFixedItemInfo(target)} onDelete={(target) => handleDeleteFixedItemInfo(target)}
            />
        </>
    )
}

const _useIterativeItemsGridStore = create<GridContextMenuState>((set) => ({
    noRowsContextMenu: null,
    setNoRowsContextMenu: (contextMenu) => set({ noRowsContextMenu: contextMenu }),
    rowContextMenu: null,
    setRowContextMenu: (contextMenu) => set({ rowContextMenu: contextMenu }),
}));

const IterativeItemsGrid = (props: {
    itemInfos: InterfaceItemInfo[] | undefined;
    onItemInfosChange: (newItemInfos: InterfaceItemInfo[]) => void;
}) => {
    const { itemInfos, onItemInfosChange } = props;

    const noRowsContextMenu = _useIterativeItemsGridStore((state) => state.noRowsContextMenu);
    const setNoRowsContextMenu = _useIterativeItemsGridStore((state) => state.setNoRowsContextMenu);
    const rowContextMenu = _useIterativeItemsGridStore((state) => state.rowContextMenu);
    const setRowContextMenu = _useIterativeItemsGridStore((state) => state.setRowContextMenu);

    const handleNoRowsContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setNoRowsContextMenu(noRowsContextMenu === null? { mouseX: event.clientX - 2, mouseY: event.clientY } : null);
    };

    const handleRowContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const id = event.currentTarget.getAttribute("data-id");
    
        if (id) {
            const rowIndex = parseInt(id);
            if (typeof rowIndex === "number") {
                setRowContextMenu(rowContextMenu === null? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, target: rowIndex } : null);
            }
        }
    };

    const handleAddIterativeItemInfo = (currentRowID: number | null) => {
        if (itemInfos) {
            if (typeof currentRowID === "number") {
                const currentRow = itemInfos.find((value) => value.itemIndex === currentRowID);
                if (currentRow) {
                    const newItemInfos: InterfaceItemInfo[] = [];
                    itemInfos.forEach((info) => {
                        if (info.itemIndex < currentRowID) {
                            newItemInfos.push(info);
                        } else if (info.itemIndex == currentRowID) {
                            newItemInfos.push(info);
                            newItemInfos.push({ 
                                itemIndex: currentRow.itemIndex + 1, transferType: currentRow.transferType, assignType: "V", assignValue: "",
                                itemPosition: 0, itemLength: 0, itemSort: "", itemReplace: "", itemDescription: ""
                            });
                        } else {
                            newItemInfos.push({ ...info, itemIndex: info.itemIndex + 1 });
                        }
                    });
                    onItemInfosChange(newItemInfos);
                }
                setRowContextMenu(null);
            } else {
                onItemInfosChange([
                    { 
                        itemIndex: 0, transferType: "both", assignType: "V", assignValue: "",
                        itemPosition: 0, itemLength: 0, itemSort: "", itemReplace: "", itemDescription: ""
                    }
                ]);
                setNoRowsContextMenu(null);
            }
        }
    }

    const handleDeleteIterativeItemInfo = (currentRowID: number) => {
        if (itemInfos) {
            const newItemInfos: InterfaceItemInfo[] = [];
            itemInfos.forEach((info) => {
                if (info.itemIndex < currentRowID) {
                    newItemInfos.push(info);
                } else if (info.itemIndex == currentRowID) {
                    return;
                } else {
                    newItemInfos.push({ ...info, itemIndex: info.itemIndex - 1 });
                }
            });
            onItemInfosChange(newItemInfos);
            setRowContextMenu(null);
        }
    }

    const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
        let editedRow: any = {};

        if (newRow.assignType !== oldRow.assignType) {
            editedRow = { ...newRow, assignValue: "" };
        } else {
            editedRow = newRow;
        }

        if (itemInfos) {
            onItemInfosChange(itemInfos.map((info) => {
                if (info.itemIndex === oldRow.itemIndex) {
                    return editedRow;
                } else {
                    return info;
                }
            }));
        }

        return editedRow;
    }

    const isCellEditable = (params: GridCellParams<any, GridValidRowModel, GridValidRowModel, GridTreeNode>) => {
        if (params.row.assignType === "S") {
            if (params.field === "assignValue") {
                return false;
            }
        }
        return true;
    };

    return (
        <>
            <DataGrid
                rows={itemInfos} columns={itemColumns} getRowId={(row) => row.itemIndex}
                density="compact" disableColumnSelector disableDensitySelector disableRowSelectionOnClick
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
                isCellEditable={isCellEditable}
                sx={{ height: "50vh" }}
            />
            <NoRowsContextMenu
                position={noRowsContextMenu} onClose={() => setNoRowsContextMenu(null)}
                onAdd={() => handleAddIterativeItemInfo(null)}
            />
            <RowContextMenu position={rowContextMenu} onClose={() => setRowContextMenu(null)}
                onAdd={(target) => handleAddIterativeItemInfo(target)} onDelete={(target) => handleDeleteIterativeItemInfo(target)}
            />
        </>
    )
}

interface UpdateInterfaceItemInfosState {
    variableInfos: VariableInfo[] | undefined
    setVariableInfos: (infos: VariableInfo[]) => void;
}

const _useUpdateInterfaceItemInfosStore = create<UpdateInterfaceItemInfosState & TabState>((set) => ({
    variableInfos: undefined,
    setVariableInfos: (infos) => set({ variableInfos: infos }),
    tab: 0,
    setTab: (value) => set({ tab: value }),
}));

interface UpdateInterfaceItemInfosDialogProps extends CustomModalProps {
    interfaceInfo: InterfaceInfo | undefined;
    setInterfaceInfo: (info: InterfaceInfo) => void;
    onUpdate: () => void;
}

export const UpdateInterfaceItemInfosDialog = (props: UpdateInterfaceItemInfosDialogProps) => {
    const { open, onClose, interfaceInfo, setInterfaceInfo, onUpdate } = props;

    const projectID = useProjectStore((state) => state.projectID);

    const variableInfos = _useUpdateInterfaceItemInfosStore((state) => state.variableInfos);
    const setVariableInfos = _useUpdateInterfaceItemInfosStore((state) => state.setVariableInfos);
    const tab = _useUpdateInterfaceItemInfosStore((state) => state.tab);
    const setTab = _useUpdateInterfaceItemInfosStore((state) => state.setTab);

    let fixedItems: InterfaceItemInfo[] = [];
    let iterativeItems: InterfaceItemInfo[] = [];
    if (interfaceInfo) {
        const { interfaceItems } = interfaceInfo;
        fixedItems = interfaceItems.fixedItems;
        iterativeItems = interfaceItems.iterativeItems;
    }

    const handleTransitionEnter = () => {
        getVariableInfos(projectID, {
            onOK: (data) => {
                setVariableInfos(data);
            },
            onError: (message) => {}
        })
    }

    const handleTabChange = (event: React.SyntheticEvent<Element, Event>, value: any) => {
        setTab(value);
    }

    const handleFixedItemInfosChange = (newItems: InterfaceItemInfo[]) => {
        if (interfaceInfo && interfaceInfo.interfaceItems) {
            setInterfaceInfo({ ...interfaceInfo, interfaceItems: { ...interfaceInfo.interfaceItems, fixedItems: newItems } })
        }
    }

    const handleIterativeItemInfosChange = (newItems: InterfaceItemInfo[]) => {
        if (interfaceInfo && interfaceInfo.interfaceItems) {
            setInterfaceInfo({ ...interfaceInfo, interfaceItems: { ...interfaceInfo.interfaceItems, iterativeItems: newItems } })
        }
    }

    const handleSave = () => {
        if (projectID && interfaceInfo) {
            updateInterfaceItems(projectID, interfaceInfo.interfaceCode, interfaceInfo.interfaceItems, {
                onOK: () => {
                    onUpdate();
                    if (onClose) {
                        onClose();
                    }
                },
                onError: () => {
                    if (onClose) {
                        onClose();
                    }
                }
            })
        }
    }

    return (
        <CustomModal open={open} onClose={onClose} onTransitionEnter={handleTransitionEnter}>
            <CustomModalTitle title={`Edit Interface Items (${interfaceInfo?.interfaceCode})`} />
            <CustomModalContents>
                <Tabs variant="fullWidth" value={tab} onChange={handleTabChange}>
                    <Tab label="Fixed Items" />
                    <Tab label="Iterative Items" />
                </Tabs>
                <TabPanel reMount state={tab} value={0} sx={{ width: "50vw", height: "50vh" }}>
                    <FixedItemsGrid itemInfos={fixedItems} onItemInfosChange={handleFixedItemInfosChange} />
                </TabPanel>
                <TabPanel reMount state={tab} value={1} sx={{ width: "50vw", height: "50vh" }}>
                    <IterativeItemsGrid itemInfos={iterativeItems} onItemInfosChange={handleIterativeItemInfosChange} />
                </TabPanel>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" color="success" onClick={handleSave}>Save</Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}