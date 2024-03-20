import { PageInfo, useProjectStore } from "@/store/workspace-store"
import { Add, ChevronRight, ExpandMore, MoreVert } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material"
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { create } from "zustand";
import { explorer_width, header_height } from "@/consts/g-style-vars";
import { FlowEditMode, useEditorTabState, useFlowEditState } from "@/store/flow-editor-store";
import { CustomModal } from "./common/modal";
import { useDialogState } from "@/store/dialog-store";
import React from "react";
import { XMLParser } from "fast-xml-parser";
import { EllipsisLabel } from "./common/typhography";
import { APIResponse } from "@/consts/server-object";

const explorerStyle = {
    width: `${explorer_width}`,
    height: `calc(100vh - ${header_height})`,
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

const InputPageNameDialog = (
    open: boolean,
    setClose: () => void,
    name: string,
    setName: (value: string) => void
) => {
    return (
        <></>
    )
}

const ProjectTree = () => {
    const projectID = useProjectStore((state) => state.projectID);
    const projectName = useProjectStore((state) => state.projectName);
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
        const target = element.innerHTML;

        const url = `/api/project/${projectID}/${target}`;
        fetch(url).then((response) => response.text()).then((text) => {
            const founded = tabs.find((v) => v.name === target);
            if (!founded) {
                addTabs([{ name: target, modified: false, origin: text, contents: text, type: "dxml"}]);
            }
            setTab(target);
        });
    }

    const handleNewPage = () => {
        openNewPageDialog();
        handleContextMenuClose();
    }

    const handleSavePage = (event: React.MouseEvent) => {
        const url = `/api/project/${projectID}/${target}?action=create`;
        const found = tabs.find((t) => t.name === target);
        if (found) {
            const xml = found.contents;
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/xml",
                },
                body: xml
            }).then((response) => response.json()).then((json) => {
                const temp: APIResponse = json;
                if (temp.result === "OK") {
                    setTabUnmodified(target);
                }
            });
        }
        handleContextMenuClose();
    }

    const handleDeletePage = () => {
        deleteScenarioPage(target);
        handleContextMenuClose();
    }

    const renderTree = (page: PageInfo) => (
        <TreeItem onContextMenu={handleContextMenu} key={page.name} nodeId={page.name} 
            label={<EllipsisLabel variant="body2">{page.name}</EllipsisLabel>} onDoubleClick={handleDoubleClick}
        />
    );

    return (
        <>
            {scenarioPages.length !== 0 && 
                <TreeView defaultExpanded={[projectName]} defaultCollapseIcon={<ExpandMore />} defaultExpandIcon={<ChevronRight />}>
                    <TreeItem key={projectName} nodeId={projectName} 
                        label={<EllipsisLabel variant="body1">{projectName}</EllipsisLabel>}
                    >
                        {scenarioPages && scenarioPages.map((page) => renderTree(page))}
                    </TreeItem>
                </TreeView>
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
            const data = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(projectXML);
            const functions = data.scenario?.functions;

            const found = tabs.find((t) => t.name === "Functions");
            if (!found) {
                addTabs([{name: "Functions", modified: false, origin: functions, contents: functions, type: "js"}])
            }
            setTab("Functions");
        }
        handleClose();
    }

    const openNewPageDialog = useDialogState((state) => state.openNewPageDialog);

    return (
        <Box sx={explorerStyle}>
            <Stack direction="row" gap={1} justifyContent="end">
                <IconButton onClick={openNewPageDialog} sx={{ borderRadius: "25%" }} disabled={!projectID}>
                    <Add fontSize="small"/>
                </IconButton>
                <IconButton onClick={handleClick} sx={{ borderRadius: "25%" }} disabled={!projectID}>
                    <MoreVert fontSize="small"/>
                </IconButton>
            </Stack>
            <ProjectTree />
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem disabled>Variables</MenuItem>
                <MenuItem onClick={handleOpenJSEditor}>Functions</MenuItem>
                <MenuItem disabled>Interfaces</MenuItem>
            </Menu>
        </Box>
    )
}