"use client"

import { FlowInfo, useDiagramMetaStore, useProjectStore } from "@/store/workspace-store"
import { Add, AddBoxTwoTone, IndeterminateCheckBoxTwoTone, MoreVert, SquareTwoTone } from "@mui/icons-material";
import { Box, Chip, Divider, IconButton, Menu, MenuItem, Stack } from "@mui/material"
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { create } from "zustand";
import { explorer_width } from "@/consts/g-style-vars";
import { EDITOR_TYPE, useBlockAttributeState, useEditorTabState, useFaultReportStore, useFlowEditState } from "@/store/flow-editor-store";
import { useDialogState } from "@/store/dialog-store";
import React from "react";
import { EllipsisLabel } from "./common/typhography";
import { APIResponse } from "@/consts/server-object";
import { $Functions, $Interface, $ScenarioPages_Tag, $Variables, $Variables_Tag } from "@/consts/flow-editor";
import { getFlowContents } from "@/service/fetch/crud/project";
import { XMLParser } from "fast-xml-parser";
import { DeleteFlowDialog, DeleteFlowDialogStore } from "./dialog/DeleteFlowDialog";
import { getVariableInfos } from "@/service/fetch/crud/variables";
import { getFunctionsScript } from "@/service/fetch/crud/functions";
import { BLOCK_DESC_KEY, BLOCK_ID_KEY, BLOCK_TYPE_KEY, dxmlToObject, FlowInformation } from "@/service/global";
import { getInterfaceInfos } from "@/service/fetch/crud/interfaces";
import { FormText } from "./common/form";

const explorerStyle = {
    width: `${explorer_width}`,
    // height: `calc(100vh - ${header_height})`,
    height: "100%",
    borderInlineEnd: "1px solid",
    p: 1,
}

type MenuPosition = {
    mouseX: number,
    mouseY: number,
}

interface ContextMenuState {
    menuPosition: MenuPosition | undefined,
    setMenuPosition: (position: MenuPosition | undefined ) => void
    target: any,
    setTarget: (value: any) => void
}

const _useContextMenuState = create<ContextMenuState>((set) => ({
    menuPosition: undefined,
    setMenuPosition: (position) => set({ menuPosition: position }),
    target: undefined,
    setTarget: (value) => set({ target: value })
}))

const _useDeleteFlowDialogStore = create<DeleteFlowDialogStore>((set) => ({
    open: false,
    projectID: undefined,
    flowName: undefined,
    openDialog: (projectID, flowName) => set({ open: true, projectID: projectID, flowName: flowName}),
    closeDialog: () => set({ open: false })
}))

const ProjectTree = () => {
    const projectID = useProjectStore((state) => state.projectID);
    const projectName = useProjectStore((state) => state.projectName);
    const projectXML = useProjectStore((state) => state.projectXML);
    const projectFlows = useProjectStore((state) => state.projectFlows);
    const deleteProjectFlow = useProjectStore((state) => state.deleteProjectFlow);

    const tabs = useEditorTabState((state) => state.tabs);
    const setTab = useEditorTabState((state) => state.setTab);
    const addTabs = useEditorTabState((state) => state.addTabs);
    const setTabUnmodified = useEditorTabState((state) => state.setTabUnmodified);

    const menuPosition = _useContextMenuState((state) => state.menuPosition);
    const setMenuPosition = _useContextMenuState((state) => state.setMenuPosition);
    const target = _useContextMenuState((state) => state.target);
    const setTarget = _useContextMenuState((state) => state.setTarget);

    const addFlowEditState = useFlowEditState((state) => state.addState);
    const addBlockAttributeState = useBlockAttributeState((state) => state.addState);

    const openNewFlowDialog = useDialogState((state) => state.openNewFlowDialog);

    const faultReport = useFaultReportStore((state) => state.faultReport);
    const { flowFaultList } = faultReport;

    const showDeleteFlowDialog = _useDeleteFlowDialogStore((state) => state.open);
    const projectIDforDelete = _useDeleteFlowDialogStore((state) => state.projectID);
    const flowNameforDelete = _useDeleteFlowDialogStore((state) => state.flowName);
    const openDeleteFlowDialog = _useDeleteFlowDialogStore((state) => state.openDialog);
    const closeDeleteFlowDialog = _useDeleteFlowDialogStore((state) => state.closeDialog);

    const handleContextMenu = (event: React.MouseEvent, target: string) => {
        event.preventDefault();
        setTarget(target);
        setMenuPosition(menuPosition === undefined? { mouseX: event.clientX + 2, mouseY: event.clientY - 6}: undefined);
    }

    const handleContextMenuClose = () => {
        setMenuPosition(undefined);
    }

    const handleDoubleClick = async (target: string) => {
        const founded = tabs.find((v) => v.name === target);
        if (!founded) {
            await getFlowContents(projectID, target, {
                onOK: (data) => {
                    if (data) {
                        addTabs([{ name: target, modified: false, origin: data, contents: data, type: "dxml" }]);
                        addFlowEditState(target);
                        addBlockAttributeState(target);
                        setTab(target);
                    }
                },
                onError: (message) => {
                    // TODO Error Dialog 추가 
                    console.log(message);
                }
            });
        } else {
            setTab(target);
        }
    }

    const handleNewFlow = () => {
        openNewFlowDialog();
        handleContextMenuClose();
    }

    const handleRenameFlow = () => {
        handleContextMenuClose();
    }

    const handleSaveFlow = (event: React.MouseEvent) => {
        handleContextMenuClose();
    }

    const handleDeleteFlow = () => {
        openDeleteFlowDialog(projectID, target);
        handleContextMenuClose();
    }

    const renderTree = (flow: FlowInformation) => {
        const { flowName, startFlow, flowTag } = flow;
        return (
            <TreeItem onContextMenu={(event) => handleContextMenu(event, flowName)} key={flowName} itemId={flowName} 
                label={
                    <Stack width="100%" direction="row" columnGap={3}>
                        <Box width="70%">
                            <EllipsisLabel
                                variant="body2" fontWeight={startFlow? 700 : undefined}
                                color={flowFaultList.find((falut) => falut.flowName == flowName)? "error" : undefined}
                            >
                                {flowName}
                            </EllipsisLabel>
                        </Box>
                        <Box width="30%">
                            <EllipsisLabel variant="caption" fontStyle="italic">{flowTag}</EllipsisLabel>
                        </Box>
                    </Stack>
                }
                onDoubleClick={() => handleDoubleClick(flowName)} />
        )
};

    return (
        <>
            {
                projectFlows.length !== 0 && 
                    <SimpleTreeView 
                        slots={{ 
                            // expandIcon: AddBoxTwoTone,
                            // collapseIcon: IndeterminateCheckBoxTwoTone,
                        }}
                        expandedItems={[ projectName ]}
                        expansionTrigger="iconContainer"
                    >
                        <TreeItem key={projectName} itemId={projectName} 
                            label={<EllipsisLabel variant="body1">{projectName}</EllipsisLabel>}
                        >
                            {projectFlows && projectFlows.map((flow) => renderTree(flow))}
                        </TreeItem>
                    </SimpleTreeView>
            }
            <Menu open={menuPosition !== undefined} onClose={handleContextMenuClose}
                anchorReference="anchorPosition" 
                anchorPosition={menuPosition !== undefined? { top: menuPosition.mouseY, left: menuPosition.mouseX} : undefined}
            >
                <MenuItem onClick={handleNewFlow}>New Flow</MenuItem>
                <MenuItem disabled>Copy Flow</MenuItem>
                <MenuItem disabled>Make a Copy</MenuItem>
                <MenuItem disabled>Rename</MenuItem>
                <MenuItem onClick={handleSaveFlow}>Save Flow</MenuItem>
                <MenuItem onClick={() => handleDeleteFlow()}>Delete Flow</MenuItem>
                <Divider />
                <MenuItem disabled>Find Flow References</MenuItem>
            </Menu>
            <DeleteFlowDialog 
                open={showDeleteFlowDialog}
                projectID={projectIDforDelete}
                flowName={flowNameforDelete}
                onClose={() => closeDeleteFlowDialog()}
                onDelete={() => {}}
            />
        </>
    )
}

const BlockOutline = () => {
    const tab = useEditorTabState((state) => state.tab);
    const tabs = useEditorTabState((state) => state.tabs);

    const setFocusMode = useFlowEditState((state) => state.setFocusMode);

    const [keyword, setKeyword] = React.useState<string>();

    if (tab) {
        if (tab === $Functions || tab === $Variables || tab === $Interface) {
            return <></>
        }

        const found = tabs.find((v) => v.name === tab);
        if (found) {
            const { contents } = found;
            if (contents) {
                const flowObject = dxmlToObject(contents);
                const blocks = flowObject?.scenario?.block;

                if (!blocks) {
                    return <></>
                }

                return (
                    <Stack height="100%" rowGap={1}>
                        <FormText formTitle="search" formValue={keyword} onFormChanged={setKeyword} />
                        <Box height="100%" overflow="auto">
                            <SimpleTreeView>
                                {   
                                    blocks.map((block: any) => {
                                        const blockType = block[BLOCK_TYPE_KEY];
                                        const blockId = block[BLOCK_ID_KEY];
                                        const blockDescription = block[BLOCK_DESC_KEY];

                                        if (keyword && (!blockType.includes(keyword) && !blockId.includes(keyword) && !blockDescription.includes(keyword))) {
                                            return <></>
                                        } else {
                                            return (
                                                <TreeItem key={blockId} itemId={blockId} 
                                                    label={
                                                        <Stack direction="row" columnGap={1}>
                                                            <Stack width="60%" justifyContent="center">
                                                                <EllipsisLabel variant="body2">{blockDescription}</EllipsisLabel>
                                                                <EllipsisLabel variant="caption" color="secondary">{blockId}</EllipsisLabel>
                                                            </Stack>
                                                            <Stack width="40%" justifyContent="center">
                                                                <Chip
                                                                    size="small" variant="outlined" color="info"
                                                                    label={<EllipsisLabel variant="caption">{blockType}</EllipsisLabel>}
                                                                />
                                                            </Stack>
                                                        </Stack>
                                                    }
                                                    onDoubleClick={() => setFocusMode(tab, blockId)}
                                                />
                                            )
                                        }
                                    }
                                )}
                            </SimpleTreeView>

                        </Box>
                    </Stack>
                )
            }
        }
    }

    return <></>
}

export const ProjectExplorer = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const projectID = useProjectStore((state) => state.projectID);
    const projectXML = useProjectStore((state) => state.projectXML);

    
    const tabs = useEditorTabState((state) => state.tabs);
    const setTab = useEditorTabState((state) => state.setTab);
    const addTabs = useEditorTabState((state) => state.addTabs);
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenJSEditor = async () => {
        const found = tabs.find((t) => t.name === $Functions);
        if (!found) {
            await getFunctionsScript(projectID, {
                onOK: (data) => {
                    addTabs([ { name: $Functions, modified: false, origin: data, contents: data, type: EDITOR_TYPE.js }]);
                },
                onError: (message) => {}
            })
        }
        setTab($Functions);
        handleClose();
    }

    const handleOpenVarEditor = async () => {
        const found = tabs.find((t) => t.name === $Variables);
        if (!found) {
            await getVariableInfos(projectID, {
                onOK: (data) => {
                    const infoString = JSON.stringify(data, null, 4);
                    addTabs([{ name: $Variables, modified: false, origin: infoString, contents: infoString, type: EDITOR_TYPE.variable }]);
                    setTab($Variables);
                },
                onError: (message) => {

                }
            })
            
        } else {
            setTab($Variables);
        }
        
        handleClose();
    }

    const handleOpenInterfaceEditor = async () => {
        const found = tabs.find((t) => t.name === $Interface);
        if (!found) {
            await getInterfaceInfos(projectID, {
                onOK: (data) => {
                    const infoString = JSON.stringify(data, null, 4);
                    addTabs([ { name: $Interface, modified: false, origin: infoString, contents: infoString, type: EDITOR_TYPE.interface } ]);
                    setTab($Interface);
                },
                onError: (message) => {

                }
            });
            
        } else {
            setTab($Interface);
        }
        handleClose();
    }

    const openNewFlowDialog = useDialogState((state) => state.openNewFlowDialog);

    return (
        <Stack height="100%" sx={explorerStyle}>
            <Stack direction="row" justifyContent="end">
                <IconButton onClick={openNewFlowDialog} sx={{ borderRadius: "25%" }} disabled={!projectID}>
                    <Add fontSize="small"/>
                </IconButton>
                <IconButton onClick={handleClick} sx={{ borderRadius: "25%" }} disabled={!projectID}>
                    <MoreVert fontSize="small"/>
                </IconButton>
            </Stack>
            <Box height="60%">
                <ProjectTree />
            </Box>
            <Divider variant="fullWidth" />
            <Box height="40%" overflow="hidden">
                <BlockOutline />
            </Box>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={handleOpenVarEditor}>Variables</MenuItem>
                <MenuItem onClick={handleOpenJSEditor}>Functions</MenuItem>
                <MenuItem onClick={handleOpenInterfaceEditor}>Interfaces</MenuItem>
            </Menu>
        </Stack>
    )
}