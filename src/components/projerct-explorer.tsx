"use client"

import { FlowInfo, useDiagramMetaStore, useProjectStore } from "@/store/workspace-store"
import { Add, AddBoxTwoTone, IndeterminateCheckBoxTwoTone, MoreVert, SquareTwoTone } from "@mui/icons-material";
import { Box, Divider, IconButton, Menu, MenuItem, Stack } from "@mui/material"
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { create } from "zustand";
import { explorer_width } from "@/consts/g-style-vars";
import { EDITOR_TYPE, useBlockAttributeState, useEditorTabState, useFlowEditState } from "@/store/flow-editor-store";
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
import { FlowInformation } from "@/service/global";
import { getInterfaceInfos } from "@/service/fetch/crud/interfaces";

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
                            <EllipsisLabel variant="body2" fontWeight={startFlow? 700 : undefined}>{flowName}</EllipsisLabel>
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

    const meta = useDiagramMetaStore((state) => state.meta);

    const setFocusMode = useFlowEditState((state) => state.setFocusMode);

    const BlockInfoItem = (props: {
        itemId: string;
        title: string;
        contents: string;
        onDoubleClick?: (event: React.MouseEvent) => void;
    }) => {
        const { title, itemId, contents, onDoubleClick } = props;

        return (
            <TreeItem
                key={itemId} itemId={itemId}
                label={
                    <Stack direction="row" alignItems="center">
                        <EllipsisLabel variant="caption">{`${title}: ${contents}`}</EllipsisLabel>
                    </Stack>
                }
                slots={{ icon: SquareTwoTone }}
                slotProps={{ icon: { color: "primary" } }}
                onDoubleClick={onDoubleClick? onDoubleClick : undefined}
            />
        )
    }

    if (tab) {
        if (tab === $Functions || tab === $Variables || tab === $Interface) {
            return <></>
        }

        const found = tabs.find((v) => v.name === tab);
        if (found) {
            const { contents } = found;
            if (contents) {
                const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", htmlEntities: true });
                const flowObject = xmlParser.parse(contents)
                const blocks = flowObject?.scenario;
                if (!blocks.block) {
                    return <></>
                }
                
                let treeItems = [];
                if (!Array.isArray(blocks.block)) {
                    treeItems.push(blocks.block);
                } else { 
                    treeItems.push(...blocks.block);
                }
                return (
                    <SimpleTreeView
                        expansionTrigger="iconContainer"
                        slots={{ 
                            // expandIcon: AddBoxTwoTone,
                            // collapseIcon: IndeterminateCheckBoxTwoTone,
                        }}
                    >
                        {   
                            treeItems.map((b: any) => {
                                const { id, desc, comment } = b;
                                const metaName = b["meta-name"];
                                const buildTag = meta.nodes[metaName].buildTag;
                                const displayName = meta.nodes[metaName].displayName;
                                const properties = meta.nodes[metaName].properties;
                                const attributes = b[buildTag];
                                return (
                                    <TreeItem key={id} itemId={id} 
                                        label={
                                            <Stack direction="row" gap={1} alignItems="center">
                                                <EllipsisLabel variant="caption">{desc}</EllipsisLabel>
                                            </Stack>
                                        }
                                    >
                                        <BlockInfoItem title="Type" itemId={`Type-${id}`} contents={displayName} onDoubleClick={() => setFocusMode(tab, id)}/>
                                        <BlockInfoItem title="ID" itemId={`ID-${id}`} contents={id} />
                                        <BlockInfoItem title="Comment" itemId={`Comment-${id}`} contents={comment} />
                                    </TreeItem>
                                )
                            }
                        )}
                    </SimpleTreeView>
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
            <Box height="50%">
                <ProjectTree />
            </Box>
            <Divider variant="fullWidth" />
            <Box height="40%" overflow="auto">
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