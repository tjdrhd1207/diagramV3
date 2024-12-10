"use client"

import { EditorTabItem, useBlockAttributeState, useBottomPanelStore, useEditorTabState, useFaultReportStore, useFlowEditState, useSearchReportStore } from "@/store/flow-editor-store"
import { Box, Button, Chip, IconButton, Stack, styled, Tab, Tabs, Typography } from "@mui/material"
import { TabPanel } from "./common/tab";
import { EDITOR_TYPE } from "@/store/flow-editor-store";
import { editor_tab_height, explorer_width, header_height } from "@/consts/g-style-vars";
import { Close, Refresh } from "@mui/icons-material";
import React from "react";
import { SVGDiagramWithStore } from "./editor/isacivr-diagram-editor";
import { useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";
import { AttributeManager } from "./attribute-manager";
import { BlockPallete } from "./block-pallete";
import dynamic from "next/dynamic";
import { ContextMenu } from "./common/context-menu";
import { $Functions, $Interface, $Variables } from "@/consts/flow-editor";
import { DiffEditor } from "@monaco-editor/react";
import { ISACIVRVariableEditor } from "./editor/isacivr-variable-editor";
import { updateFlowContents } from "@/service/fetch/crud/project";
import { ISACIVRInterfaceEditor } from "./editor/isacivr-interface-editor";
import { InterfaceInformation, VariableInformation, BlockSearchResult, SearchItem, FlowSearchResult, ScriptSearchResult, FlowFault, BlockFault, FaultInformation, FaultReport } from "@/service/global";
import _ from "lodash";
import { updateVariableInfos } from "@/service/fetch/crud/variables";
import { updateFunctionsScript } from "@/service/fetch/crud/functions";
import { updateInterfaceInfos } from "@/service/fetch/crud/interfaces";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { EllipsisLabel } from "./common/typhography";
import { create } from "zustand";
import { SaveContentsDialog, SaveContentsDialogState } from "./dialog/SaveContentsDialog";

const ISACIVRJSEditorNoSSR = dynamic(
    () => import("./editor/isacivr-js-editor").then((module) => module.ISACIVRJSEditor),
    { ssr: false }
)

const flowEditorTabHeight = { minHeight: editor_tab_height, height: editor_tab_height }
const tablabelStyle = { textTransform: "none" }

const BottomPanel = () => {
    const tab = useBottomPanelStore((state) => state.bottomPanelTab);
    const setTab = useBottomPanelStore((state) => state.setBottomPanelTab);

    return (
        <>
            <Tabs
                value={tab} onChange={(event, value) => setTab(value)}
                sx={{
                    ...flowEditorTabHeight,
                    width: "100%",
                    borderBlock: "1px solid"
                }}
            >
                <Tab value="search" label="Search" sx={{ ...flowEditorTabHeight, ...tablabelStyle, }} />
                <Tab value="problems" label="Problems" sx={{ ...flowEditorTabHeight, ...tablabelStyle, }} />
            </Tabs>
            <TabPanel
                state={tab} value="search"
                sx={{ height: `calc(100% - ${editor_tab_height})` }}
            >
                <SearchReportView />
            </TabPanel>
            <TabPanel
                state={tab} value="problems"
                sx={{ height: `calc(100% - ${editor_tab_height})` }}
            >
                <FaultReportView />
            </TabPanel>
        </>
    )
}

const HighlightText = styled(Typography)(({ theme }) => ({
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
}));

const AttributeSearchItems = (props: {
    parent: string;
    searchItems: SearchItem[]
}) => {
    const { parent, searchItems } = props;

    const keyword = useSearchReportStore((state) => state.keyword);

    return searchItems.map(({ label, contents }) => {
        const itemId = `${parent}-${label}`;

        let head, marked = "", tail = "";
        if (keyword) {
            const start = contents.indexOf(keyword);
            head = contents.substring(0, start);
            marked = keyword;
            tail = contents.substring(start + keyword.length);
        } else {
            head = contents;
        }
        return (
            <TreeItem
                key={itemId} itemId={itemId}
                label={
                    <Typography variant="caption">
                        {`${label} - ${head}`}
                        <HighlightText variant="caption">{`${marked}`}</HighlightText>
                        {`${tail}`}
                    </Typography>
                }
            />
        )
    });
}

const BlockSearchItems = (props: {
    parent: string;
    searchResults: BlockSearchResult[];
}) => {
    const { parent, searchResults } = props;

    return searchResults.map((result) => {
        const { blockID, blockType, blockDescription, searchItems } = result;
        const itemId = `${parent}-${blockID}`;
        return (
            <TreeItem
                key={itemId} itemId={itemId}
                label={
                    <Stack direction="row" columnGap={1}>
                        <Chip
                            variant="outlined" size="small"
                            label={<Typography variant="caption">{`${blockType}`}</Typography>}
                        />
                        <Stack width="100%" justifyContent="center">
                            <Typography variant="caption">{`${blockDescription} / ${blockID}`}</Typography>
                        </Stack>
                    </Stack>
                }
            >
                <AttributeSearchItems parent={itemId} searchItems={searchItems} />
            </TreeItem>
        )
    });
}

const FlowSearchItems = (props: {
    searchResults: FlowSearchResult[]
}) => {
    const { searchResults } = props;

    return searchResults.map(({ flowName, blockSearchResults: searchResults }) =>
        <TreeItem
            key={flowName} itemId={flowName}
            label={<EllipsisLabel variant="body2">{`${flowName} (${searchResults.length})`}</EllipsisLabel>}
        >
            <BlockSearchItems parent={flowName} searchResults={searchResults} />
        </TreeItem>
    );
}

const FunctionsSearchItems = (props: {
    searchResults: ScriptSearchResult[]
}) => {
    const { searchResults } = props;
    const prefix = "Functions";

    return (
        <TreeItem key={prefix} itemId={prefix} label={<EllipsisLabel variant="body2">{`${[prefix]} (${searchResults.length})`}</EllipsisLabel>}>
            {
                searchResults.map(({ contents, line, start, end }, index) => {
                    const itemId = `${prefix}-${index}`;
                    return <TreeItem
                        key={itemId} itemId={itemId}
                        label={
                            <Stack height="100%" direction="row" columnGap={1}>
                                <Stack justifyContent="center">
                                    <Chip
                                        variant="outlined" size="small"
                                        label={<Typography variant="caption">{`line: ${line}`}</Typography>}
                                    />
                                </Stack>
                                <Stack justifyContent="center">
                                    <Typography variant="caption">{contents}</Typography>
                                </Stack>
                            </Stack>
                        }
                    />
                })
            }
        </TreeItem>
    )
}

const VariableSearchItems = (props: {
    searchResults: VariableInformation[]
}) => {
    const { searchResults } = props;
    const prefix = "Variables";

    return (
        <TreeItem key={prefix} itemId={prefix} label={<EllipsisLabel variant="body2">{`${prefix} (${searchResults.length})`}</EllipsisLabel>}>
            {
                searchResults.map(({ variableType, variableAccessKey, variableName, variableDescription }) => {
                    const itemId = `${prefix}-${variableName}`;
                    return <TreeItem key={itemId} itemId={itemId}
                        label={
                            <Stack height="100%" direction="row" columnGap={1}>
                                <Stack justifyContent="center">
                                    <Chip
                                        variant="outlined" size="small"
                                        label={<Typography variant="caption">{variableType}</Typography>}
                                    />
                                </Stack>
                                <Stack justifyContent="center">
                                    <Typography variant="caption">
                                        {`${variableAccessKey}.${variableName} - ${variableDescription}`}
                                    </Typography>
                                </Stack>
                            </Stack>
                        }
                    />
                })
            }
        </TreeItem>
    )
}

const InterfacesSearchItems = (props: {
    searchResults: InterfaceInformation[]
}) => {
    const { searchResults } = props;
    const prefix = "Interfaces";

    return (
        <TreeItem key={prefix} itemId={prefix} label={<EllipsisLabel variant="body2">{`${prefix} (${searchResults.length})`}</EllipsisLabel>}>
            {
                searchResults.map(({ interfaceCode, interfaceName }) => {
                    const itemId = `${prefix}-${interfaceCode}`;
                    return <TreeItem key={itemId} itemId={itemId}
                        label={
                            <Stack height="100%" direction="row" columnGap={1}>
                                <Stack justifyContent="center">
                                    <Chip
                                        variant="outlined" size="small"
                                        label={<Typography variant="caption">{interfaceCode}</Typography>}
                                    />
                                </Stack>
                                <Stack justifyContent="center">
                                    <Typography variant="caption">
                                        {`${interfaceName}`}
                                    </Typography>
                                </Stack>
                            </Stack>
                        }
                    />
                })
            }
        </TreeItem>
    )
}

const SearchReportView = () => {
    const searchReport = useSearchReportStore((state) => state.searchReport);
    const { flowSearchResults, functionSearchResults, variableSearchResults, interfaceSearchResults } = searchReport;

    return (
        <Box width="100%" height="100%" overflow="auto">
            {
                <SimpleTreeView>
                    {flowSearchResults.length > 0 && <FlowSearchItems searchResults={flowSearchResults} />}
                    {functionSearchResults.length > 0 && <FunctionsSearchItems searchResults={functionSearchResults} />}
                    {variableSearchResults.length > 0 && <VariableSearchItems searchResults={variableSearchResults} />}
                    {interfaceSearchResults.length > 0 && <InterfacesSearchItems searchResults={interfaceSearchResults} />}
                </SimpleTreeView>
            }
        </Box>
    )
}

const FaultItems = (props: {
    faultInfos: FaultInformation[]
    parent: string;
}) => {
    const { faultInfos, parent } = props;

    return faultInfos.map(({ faultLevel, faultDescription }, index) => {
        const itemId = `${parent}-${index}`;
        return (
            <TreeItem
                key={itemId} itemId={itemId}
                label={
                    <Stack direction="row" columnGap={1}>
                        <Chip
                            size="small" color={faultLevel == "ERROR" ? "error" : "warning"}
                            label={faultLevel}
                        />
                        <Stack justifyContent="center">
                            <Typography variant="caption">
                                {faultDescription}
                            </Typography>
                        </Stack>
                    </Stack>
                }
            />
        )
    })
}

const BlockFaultItems = (props: {
    faultList: BlockFault[];
    parent: string;
}) => {
    const { faultList, parent } = props;

    return faultList.map(({ blockType, blockID, blockDescription, faultInfos }) => {
        const itemId = `${parent}-${blockID}`;
        return (
            <TreeItem
                key={itemId} itemId={itemId}
                label={
                    <Stack direction="row" columnGap={1}>
                        <Chip
                            variant="outlined" size="small"
                            label={<Typography variant="caption">{`${blockType}`}</Typography>}
                        />
                        <Stack width="100%" justifyContent="center">
                            <Typography variant="caption">{`${blockDescription} / ${blockID}`}</Typography>
                        </Stack>
                    </Stack>
                }
            >
                <FaultItems faultInfos={faultInfos} parent={itemId} />
            </TreeItem>
        )
    })
}

const FlowFaultItems = (props: {
    faultList: FlowFault[]
}) => {
    const { faultList } = props;

    return faultList.map(({ flowName, blockFaultList }) => {
        return (
            <TreeItem
                key={flowName} itemId={flowName}
                label={<EllipsisLabel variant="body2">{`${flowName} (${blockFaultList.length})`}</EllipsisLabel>}
            >
                <BlockFaultItems faultList={blockFaultList} parent={flowName} />
            </TreeItem>
        )
    })
}

const FunctionsFaultItems = (props: {
    faultInfos: FaultInformation[]
}) => {
    const { faultInfos } = props;
    const prefix = "Functions";

    return (
        <TreeItem
            key={prefix} itemId={prefix}
            label={<EllipsisLabel variant="body2">{`${prefix} (${faultInfos.length})`}</EllipsisLabel>}
        >
            <FaultItems parent={prefix} faultInfos={faultInfos} />
        </TreeItem>
    )
}

const FaultReportView = () => {
    const faultReport = useFaultReportStore((state) => state.faultReport);

    console.log(faultReport);
    const { flowFaultList, functionFaultList } = faultReport;
    return (
        <Box width="100%" height="100%" overflow="auto">
            <SimpleTreeView>
                <FlowFaultItems faultList={flowFaultList} />
                <FunctionsFaultItems faultInfos={functionFaultList} />
            </SimpleTreeView>
        </Box>
    )
}

const EditorView = (props: {
    editor: EditorTabItem
}) => {
    const { editor } = props;
    const { name, type, origin, contents } = editor;

    const meta = useDiagramMetaStore((state) => state.meta);

    const setTabModified = useEditorTabState((state) => state.setTabModified);
    const setTabNotModified = useEditorTabState((state) => state.setTabUnmodified);

    const handleJSEditorModified = (script: string) => {
        if (origin !== script) {
            setTabModified(name, script);
        } else {
            setTabNotModified(name, origin);
        }
    };

    const handleVariableEditorModified = (infos: VariableInformation[]) => {
        const infoString = JSON.stringify(infos, null, 4);
        if (origin !== infoString) {
            setTabModified(name, infoString);
        } else {
            setTabNotModified(name, origin);
        }
    };

    const handleInterfaceEditorModified = (infos: InterfaceInformation[]) => {
        const infoString = JSON.stringify(infos, null, 4);
        if (origin !== infoString) {
            setTabModified(name, infoString);
        } else {
            setTabNotModified(name, origin);
        }
    };

    if (type == EDITOR_TYPE.dxml) {
        return (
            <Stack width="100%" height="100%" direction="row">
                {
                    meta &&
                    <>
                        <SVGDiagramWithStore flowName={name} xml={contents} />
                        <AttributeManager flowName={name} />
                        <BlockPallete />
                    </>
                }
            </Stack>
        )
    } else if (type == EDITOR_TYPE.variable) {
        return (
            <ISACIVRVariableEditor
                variableInfos={contents ? JSON.parse(contents) as VariableInformation[] : []}
                setTabModified={(infos) => handleVariableEditorModified(infos)}
            />
        )
    } else if (type == EDITOR_TYPE.js) {
        return <ISACIVRJSEditorNoSSR code={contents} setModified={(value) => handleJSEditorModified(value)} />
    } else if (type == EDITOR_TYPE.interface) {
        return (
            <ISACIVRInterfaceEditor
                interfaceInfos={contents ? JSON.parse(contents) as InterfaceInformation[] : []}
                setTabModified={(infos) => handleInterfaceEditorModified(infos)}
            />
        )
    } else {
        return <></>
    }
}

interface SaveModalState {
    open: boolean;
    target: string;
    origin: string;
    modified: string;
}

const _useFlowEditorStore = create<SaveContentsDialogState>((set) => ({
    open: false,
    target: undefined,
    origin: undefined,
    modified: undefined,
    setOpen: (open, target, origin, modified) => set({ open, target, origin, modified })
}));

export const FlowEditor = () => {

    const tabs = useEditorTabState((state) => state.tabs);
    const tab = useEditorTabState((state) => state.tab);
    const setTab = useEditorTabState((state) => state.setTab);
    const getTabByName = useEditorTabState((state) => state.getTabByName);
    const removeTab = useEditorTabState((state) => state.removeTab);
    const setTabModified = useEditorTabState((state) => state.setTabModified);
    const setTabNotModified = useEditorTabState((state) => state.setTabUnmodified);

    const projectID = useProjectStore((state) => state.projectID);
    const meta = useDiagramMetaStore((state) => state.meta);

    const removeFlowEditState = useFlowEditState((state) => state.removeState);
    const setBuildMode = useFlowEditState((state) => state.setBuildMode);

    const removeBlockAttributeState = useBlockAttributeState((state) => state.removeState);

    const openSaveContentsDialog = _useFlowEditorStore((state) => state.open);
    const saveTarget = _useFlowEditorStore((state) => state.target);
    const saveTargetOrigin = _useFlowEditorStore((state) => state.origin);
    const saveTargetModified = _useFlowEditorStore((state) => state.modified);
    const setOpenSaveContentsDialog = _useFlowEditorStore((state) => state.setOpen);

    const [saveModal, setSaveModal] = React.useState<SaveModalState>({ open: false, target: "", origin: "", modified: "" });

    const handleTabChanged = (event: React.SyntheticEvent<Element, Event>, value: any) => {
        if (value !== "add") {
            setTab(value);
        }
    }

    const handleTabClick = (target: string) => {
        setTab(target);
    }

    const handleTabCloseButton = (event: React.MouseEvent, target: string) => {
        event.stopPropagation();
        handleTabClose(target);
    }

    const handleTabSave = async (target: string | undefined) => {
        if (target) {
            const found = getTabByName(target);
            if (found) {
                if (target === $Variables) {
                    const variableInfos = JSON.parse(found.contents) as VariableInformation[];
                    await updateVariableInfos(projectID, variableInfos, {
                        onOK: (data) => {
                            setTabNotModified(target, found.contents);
                        },
                        onError: (message) => { }
                    })
                } else if (target === $Functions) {
                    await updateFunctionsScript(projectID, found.contents, {
                        onOK: () => {
                            setTabNotModified(target, found.contents);
                        },
                        onError: () => { }
                    });
                } else if (target === $Interface) {
                    const interfaceInfos = JSON.parse(found.contents) as InterfaceInformation[];
                    await updateInterfaceInfos(projectID, interfaceInfos, {
                        onOK: () => {
                            setTabNotModified(target, found.contents);
                        },
                        onError: () => { }
                    })
                } else {
                    await updateFlowContents(projectID, target, found.contents, {
                        onOK: (data) => {
                            setTabNotModified(target, found.contents);
                        },
                        onError: (error) => { }
                    });
                }
            }
        }
    }

    const handleTabClose = (target: string | undefined) => {
        if (target) {
            const found = getTabByName(target);
            if (found) {
                if (found.modified) {
                    const { origin, contents } = found;
                    setOpenSaveContentsDialog(true, target, origin, contents);
                } else {
                    handleTabCloseWithNoSave(target);
                }
            }
        }
    };

    const handleTabCloseWithSave = async (target: string | undefined) => {
        if (target) {
            await handleTabSave(target);
            handleTabCloseWithNoSave(target);
        }
    };

    const handleTabCloseWithNoSave = (target: string | undefined) => {
        if (target) {
            if (tab === target) {
                setTab(false);
            }

            removeTab(target);
            removeFlowEditState(target);
            removeBlockAttributeState(target);
        }
    };

    const handleTabBuild = (target: string | undefined) => {
        if (target) {
            setBuildMode(target);
        }
    };

    return (
        <Stack
            width={`calc(100vw - ${explorer_width})`}
            height={`calc(100vh - ${header_height})`}
        >
            <Box width="100%" height="70%">
                <Tabs value={tab} variant="scrollable"
                    // onChange={handleTabChanged}
                    sx={{
                        ...flowEditorTabHeight,
                        width: "100%",
                        borderBlockEnd: "1px solid"
                    }}
                >
                    {
                        tabs.length !== 0 && tabs.map((v) =>
                            <Tab key={v.name} value={v.name}
                                label={
                                    <ContextMenu
                                        menuItems={[
                                            { label: "save", disabled: false, onClick: (target) => handleTabSave(target) },
                                            { label: "build", disabled: false, onClick: (target) => handleTabBuild(target) },
                                            { label: "close", disabled: false, onClick: (target) => handleTabClose(target) },
                                        ]}
                                    >
                                        <Stack direction="row" gap={1} onClick={() => handleTabClick(v.name)} sx={{ alignItems: "center" }}>
                                            <Typography variant="body2" fontWeight={v.modified ? 800 : undefined}>
                                                {v.name}
                                            </Typography>
                                            {v.modified ? <p>*</p> : undefined}
                                            <Close fontSize="small" color="disabled" onClick={(event) => handleTabCloseButton(event, v.name)} />
                                        </Stack>
                                    </ContextMenu>
                                }
                                sx={{ ...flowEditorTabHeight, ...tablabelStyle, }} />
                        )
                    }
                    {/* <Tab
                        key="add" label={<Add fontSize="small" sx={{ ...hover_visible_style("#EEEEEE") }}/>}
                        value="add" sx={{ ...flowEditorTabHeight, minWidth: "20px", width: "20px" }} disableRipple
                    /> */}
                </Tabs>
                {
                    tabs.length !== 0 && tabs.map((item) =>
                        <TabPanel
                            key={item.name} state={tab} value={item.name}
                            sx={{ height: `calc(100% - ${editor_tab_height})` }}
                        >
                            <EditorView editor={item} />
                        </TabPanel>
                    )
                }
            </Box>
            <Box width="100%" height="30%">
                <BottomPanel />
                {/* <SearchReportView /> */}
            </Box>
            <SaveContentsDialog
                open={openSaveContentsDialog} onClose={() => setOpenSaveContentsDialog(false)}
                target={saveTarget} origin={saveTargetOrigin} modified={saveTargetModified}
                onCloseWithSave={handleTabCloseWithSave} onCloseWithNoSave={handleTabCloseWithNoSave}
            />
            {/* <CustomModal open={saveModal.open} onClose={() => setSaveModal({ ...saveModal, open: false })}>
                <CustomModalTitle title="Save"/>
                <CustomModalContents>
                    <Typography variant="body1">Do you want to save the changes you made to "{saveModal.target}"?</Typography>
                    <Typography variant="caption">⚠️ Your changes will be lost if you don't save them.</Typography>
                    <DiffEditor height="80vh" width="80vw" original={saveModal.origin} modified={saveModal.modified} options={{ readOnly: true }}/>
                </CustomModalContents>
                <CustomModalAction>
                    <Button size="small" color="success" variant="contained" onClick={() => handleTabSave(saveModal.target)}>Save</Button>
                    <Button size="small" color="error" onClick={() => handleTabCloseNoSave(saveModal.target)}>Don't save</Button>
                    <Button size="small" onClick={() => setSaveModal({ ...saveModal, open: false })}>Cancel</Button>
                </CustomModalAction>
            </CustomModal> */}
        </Stack>
    )
}