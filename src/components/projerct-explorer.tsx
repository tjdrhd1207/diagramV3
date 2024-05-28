"use client"

import { PageInfo, useDiagramMetaStore, useProjectStore } from "@/store/workspace-store"
import { Add, AddBoxTwoTone, IndeterminateCheckBoxTwoTone, MoreVert, SquareTwoTone } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem, Stack } from "@mui/material"
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { create } from "zustand";
import { explorer_width } from "@/consts/g-style-vars";
import { EDITOR_TYPE, useBlockAttributeState, useEditorTabState, useFlowEditState } from "@/store/flow-editor-store";
import { useDialogState } from "@/store/dialog-store";
import React from "react";
import { XMLParser } from "fast-xml-parser";
import { EllipsisLabel } from "./common/typhography";
import { APIResponse } from "@/consts/server-object";
import { $Functions_Tab, $ScenarioPages_Tag, $Variables_Tab, $Variables_Tag } from "@/consts/flow-editor";
import { NodeWrapper } from "@/lib/diagram";

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



const ProjectTree = () => {
    const projectID = useProjectStore((state) => state.projectID);
    const projectName = useProjectStore((state) => state.projectName);
    const projectXML = useProjectStore((state) => state.projectXML);
    const scenarioPages = useProjectStore((state) => state.scenarioPages);
    const deleteScenarioPage = useProjectStore((state) => state.deleteScenarioPage);

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

    const openNewPageDialog = useDialogState((state) => state.openNewPageDialog);

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();

        const element = event.target as HTMLElement;
        const target = element.innerHTML;
        setTarget(target);

        setMenuPosition(menuPosition === undefined? { mouseX: event.clientX + 2, mouseY: event.clientY - 6}: undefined);
    }

    const handleContextMenuClose = () => {
        setMenuPosition(undefined);
    }

    const handleDoubleClick = (event: React.MouseEvent) => {
        const element = event.target as HTMLElement;
        const target = element.outerText;
        const founded = tabs.find((v) => v.name === target);
        if (!founded) {
            const url = `/api/project/${projectID}/${target}`;
            console.log(url);
            fetch(url).then((response) => response.text()).then((text) => {
                addTabs([{ name: target, modified: false, origin: text, contents: text, type: "dxml" }]);
                addFlowEditState(target);
                addBlockAttributeState(target);
                setTab(target);
            }).catch((error) => {

            });
        } else {
            setTab(target);
        }
    }

    const handleNewPage = () => {
        openNewPageDialog();
        handleContextMenuClose();
    }

    const handleSavePage = (event: React.MouseEvent) => {
        const url = `/api/project/${projectID}/${target}?action=save`;
        const found = tabs.find((t) => t.name === target);
        if (found) {
            const { contents } = found;
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/xml",
                },
                body: contents 
            }).then((response) => response.json()).then((json) => {
                const apiResponse: APIResponse = json;
                if (apiResponse.result === "OK") {
                    setTabUnmodified(target);
                }
            });
        }
        handleContextMenuClose();
    }

    const handleDeletePage = () => {
        let url = `/api/project/${projectID}/${target}?action=delete`;
        fetch(url, { method: "POST" }).then((response) => response.json()).then((json) => {
            let apiResponse: APIResponse = json;
            if (apiResponse.result === "OK") {
                deleteScenarioPage(target);
                const wrapper = NodeWrapper.parseFromXML(projectXML);
                const scenarioPages = wrapper.child($ScenarioPages_Tag);
                scenarioPages.removeChild(`page[@name='${target}']`);
                url = `/api/project/${projectID}/${projectName}.xml?action=save`;
                const xmlString = wrapper.toString();
                fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/xml",
                    },
                    body: xmlString
                }).then((response) => response.json()).then((json) => {
                    apiResponse = json;
                    if (apiResponse.result === "OK") {
                        
                    }
                })
            }
        });
        handleContextMenuClose();
    }

    const renderTree = (page: PageInfo) => (
        <TreeItem onContextMenu={handleContextMenu} key={page.name} itemId={page.name} 
            label={<EllipsisLabel variant="body2">{page.name}</EllipsisLabel>} onDoubleClick={handleDoubleClick}
        />
    );

    return (
        <>
            {scenarioPages.length !== 0 && 
                <SimpleTreeView 
                    slots={{ 
                        // expandIcon: AddBoxTwoTone,
                        // collapseIcon: IndeterminateCheckBoxTwoTone,
                    }}
                >
                    <TreeItem key={projectName} itemId={projectName} 
                        label={<EllipsisLabel variant="body1">{projectName}</EllipsisLabel>}
                    >
                        {scenarioPages && scenarioPages.map((page) => renderTree(page))}
                    </TreeItem>
                </SimpleTreeView>
            }
            <Menu open={menuPosition !== undefined} onClose={handleContextMenuClose}
                anchorReference="anchorPosition" 
                anchorPosition={menuPosition !== undefined? { top: menuPosition.mouseY, left: menuPosition.mouseX} : undefined}
            >
                <MenuItem onClick={handleNewPage}>New Page</MenuItem>
                <MenuItem disabled>Copy Page</MenuItem>
                <MenuItem onClick={handleSavePage}>Save Page</MenuItem>
                <MenuItem onClick={handleDeletePage}>Delete Page</MenuItem>
                <MenuItem disabled>Find Page References</MenuItem>
            </Menu>
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
        if (tab === $Functions_Tab || tab === $Variables_Tab) {
            return <></>
        }

        const found = tabs.find((v) => v.name === tab);
        if (found) {
            const { contents } = found;
            if (contents) {
                const pageObject = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", }).parse(contents);
                const blocks = pageObject?.scenario;
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

    return <>2</>
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

    const handleOpenJSEditor = () => {
        if (projectXML) {
            const xml = NodeWrapper.parseFromXML(projectXML);
            const functions = xml.child("functions").value();
            const found = tabs.find((t) => t.name === $Functions_Tab);
            if (!found) {
                addTabs([ { name: $Functions_Tab, modified: false, origin: functions.toString(), contents: functions, type: EDITOR_TYPE.js }])
            }
            setTab($Functions_Tab);
        }
        handleClose();
    }

    const handleOpenVarEditor = () => {
        if (projectXML) {
            const xml = NodeWrapper.parseFromXML(projectXML);
            console.log(projectXML);
            const variables = xml.child($Variables_Tag).toString(false);
            const found = tabs.find((t) => t.name === $Variables_Tab);
            if (!found) {
                addTabs([ { name: $Variables_Tab, modified: false, origin: variables, contents: variables, type: EDITOR_TYPE.variable } ])
            }
            setTab($Variables_Tab);
        }
        handleClose();
    }

    const openNewPageDialog = useDialogState((state) => state.openNewPageDialog);

    return (
        <Stack height="100%" sx={explorerStyle}>
            <Stack direction="row" gap={1} justifyContent="end">
                <IconButton onClick={openNewPageDialog} sx={{ borderRadius: "25%" }} disabled={!projectID}>
                    <Add fontSize="small"/>
                </IconButton>
                <IconButton onClick={handleClick} sx={{ borderRadius: "25%" }} disabled={!projectID}>
                    <MoreVert fontSize="small"/>
                </IconButton>
            </Stack>
            <Box height="50%" borderBottom="1px solid">
                <ProjectTree />
            </Box>
            <Box height="40%" overflow="auto">
                <BlockOutline />
            </Box>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={handleOpenVarEditor}>Variables</MenuItem>
                <MenuItem onClick={handleOpenJSEditor}>Functions</MenuItem>
                <MenuItem disabled>Interfaces</MenuItem>
            </Menu>
        </Stack>
    )
}