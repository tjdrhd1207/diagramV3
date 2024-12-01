"use client"

import { EditorTabItem, useBlockAttributeState, useEditorTabState, useFlowEditState, useSearchResultStore } from "@/store/flow-editor-store"
import { Box, Button, Chip, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material"
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
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "./common/modal";
import { $Functions, $Interface, $Variables } from "@/consts/flow-editor";
import { DiffEditor } from "@monaco-editor/react";
import { ISACIVRVariableEditor } from "./editor/isacivr-variable-editor";
import { updateFlowContents } from "@/service/fetch/crud/project";
import { ISACIVRInterfaceEditor } from "./editor/isacivr-interface-editor";
import { InterfaceInformation, VariableInformation, BlockSearchResult, SearchItem, FlowSearchResult, ScriptSearchResult } from "@/service/global";
import _ from "lodash";
import { updateVariableInfos } from "@/service/fetch/crud/variables";
import { updateFunctionsScript } from "@/service/fetch/crud/functions";
import { updateInterfaceInfos } from "@/service/fetch/crud/interfaces";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { EllipsisLabel } from "./common/typhography";

const ISACIVRJSEditorNoSSR = dynamic(
    () => import("./editor/isacivr-js-editor").then((module) => module.ISACIVRJSEditor),
    { ssr: false }
)

const flowEditorTabHeight = { minHeight: editor_tab_height, height: editor_tab_height }
const tablabelStyle = { textTransform: "none" }

const AttributeTreeItem = (props: {
    parent: string;
    searchItems: SearchItem[]
}) => {
    const { parent, searchItems } = props;
    return (
        searchItems.map((item) => {
            const { label, contents } = item;
            const itemId = `${parent}-${label}`;
            return (
                <TreeItem
                    key={itemId} itemId={itemId}
                    label={<EllipsisLabel width="100%" variant="body2">{`${label} - ${contents}`}</EllipsisLabel>}
                />
            )
        })
    )
}

const BlockTreeItem = (props: {
    parent: string;
    searchResults: BlockSearchResult[];
}) => {
    const { parent, searchResults } = props;
    return (
        searchResults.map((result) => {
            const { blockID, blockType, blockDescription, searchItems } = result;
            const itemId = `${parent}-${blockID}`;
            return (
                <TreeItem 
                    key={itemId} itemId={itemId} 
                    label={
                        <Stack direction="row" columnGap={1}>
                            <Stack width="100%" justifyContent="center">
                                <Typography variant="caption">{`${blockDescription} / ${blockID}`}</Typography>
                            </Stack>
                            <Stack width="100%" direction="row" columnGap={1} justifyContent="end" justifyItems="end" alignItems="center">
                                <Chip label={<Typography variant="caption">{`${blockType}`}</Typography>} variant="outlined" />
                            </Stack>
                        </Stack>
                    }
                >
                    <AttributeTreeItem parent={itemId} searchItems={searchItems} />
                </TreeItem>
            )
        })
    )
}

const FlowTreeItem = (props: {
    searchResults: FlowSearchResult[]
}) => {
    const { searchResults } = props;
    
    return searchResults.map(({ flowName, blockSearchResults: searchResults }) => 
        <TreeItem
            key={flowName} itemId={flowName}
            label={<EllipsisLabel variant="body2">{`${flowName} (${searchResults.length})`}</EllipsisLabel>}
        >
                <BlockTreeItem parent={flowName} searchResults={searchResults} />
        </TreeItem>
    );
}

const FunctionsTreeItem = (props: {
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

const VariableTreeItem = (props: {
    searchResults: VariableInformation[]
}) => {
    const {  searchResults } = props;
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

const InterfacesTreeItem = (props: {
    searchResults: InterfaceInformation[]
}) => {
    const {  searchResults } = props;
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

const SearchResultView = () => {
    const searchReport = useSearchResultStore((state) => state.searchReport);
    const { flowSearchResults, functionSearchResults, variableSearchResults, interfaceSearchResults} = searchReport;

    return (
        <Stack width="100%" height="30%" borderTop="1px solid">
            <Stack width="100" height={editor_tab_height} direction="row" borderBottom="1px solid" padding="1%" alignItems="center">
                {"SEARCH"}
                <Stack width="100%" direction="row" justifyContent="end" justifyItems="end">
                    <IconButton size="small">
                        <Refresh fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>
            <Box overflow="auto">
                {
                    <SimpleTreeView>
                        {flowSearchResults.length > 0 && <FlowTreeItem searchResults={flowSearchResults} />}
                        {functionSearchResults.length > 0 && <FunctionsTreeItem searchResults={functionSearchResults} />}
                        {variableSearchResults.length > 0 && <VariableTreeItem searchResults={variableSearchResults} />}
                        {interfaceSearchResults.length > 0 && <InterfacesTreeItem searchResults={interfaceSearchResults} />}
                    </SimpleTreeView>
                }
            </Box>
        </Stack>
    )
}

interface SaveModalState {
    open: boolean;
    target: string;
    origin: string;
    modified: string;
}

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

    

    const [ saveModal, setSaveModal ] = React.useState<SaveModalState>({ open: false, target: "", origin: "", modified: "" });

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
                        onError: (message) => {}
                    })
                } else if (target === $Functions) {
                    await updateFunctionsScript(projectID, found.contents, {
                        onOK: () => {
                            setTabNotModified(target, found.contents);
                        },
                        onError: () => {}
                    });
                } else if (target === $Interface) {
                    const interfaceInfos = JSON.parse(found.contents) as InterfaceInformation[];
                    await updateInterfaceInfos(projectID, interfaceInfos, {
                        onOK: () => {
                            setTabNotModified(target, found.contents);
                        },
                        onError: () => {}
                    })
                } else {
                    await updateFlowContents(projectID, target, found.contents, {
                        onOK: (data) => {
                            setTabNotModified(target, found.contents);
                        },
                        onError: (error) => {}
                    });
                }
            }
        }
        setSaveModal({ ...saveModal, open: false });
    }

    const handleTabClose = (target: string | undefined) => {
        if (target) {
            const found = getTabByName(target);
            if (found) {
                if (found.modified) {
                    const { origin, contents } = found;
                    setSaveModal({ open: true, target: target, origin: origin, modified: contents });
                } else {
                    handleTabCloseNoSave(target);
                }
            }
        }
    }

    const handleTabCloseNoSave = (target: string | undefined) => {
        if (target) {
            if (tab === target) {
                setTab(false);
            }
            
            removeTab(target);
            removeFlowEditState(target);
            removeBlockAttributeState(target);
        }
        setSaveModal({ ...saveModal, open: false });
    }

    const handleTabBuild = (target: string | undefined) => {
        if (target) {
            setBuildMode(target);
        }
    }

    const renderEditor = (target: EditorTabItem) => {
        const { name, type, origin, contents } = target;

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

        switch (type) {
            case EDITOR_TYPE.dxml:
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
            case EDITOR_TYPE.js:
                return <ISACIVRJSEditorNoSSR code={contents} setModified={(value) => handleJSEditorModified(value)} />
            case EDITOR_TYPE.variable:
                return (
                    <ISACIVRVariableEditor
                        variableInfos={contents? JSON.parse(contents) as VariableInformation[] : []}
                        setTabModified={(infos) => handleVariableEditorModified(infos)}
                    />
                )
            case EDITOR_TYPE.interface:
                return (
                    <ISACIVRInterfaceEditor 
                        interfaceInfos={contents? JSON.parse(contents) as InterfaceInformation[]: []}
                        setTabModified={(infos) => handleInterfaceEditorModified(infos)}
                    />
                )
            default:
                return (<></>)
        }
    }
    
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
                                            <Typography variant="body2" fontWeight={v.modified? 800 : undefined}>
                                                {v.name}
                                            </Typography>
                                            {v.modified? <p>*</p> : undefined}
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
                    tabs.length !== 0 && tabs.map((v) => 
                        <TabPanel key={v.name} state={tab} value={v.name}
                            sx={{ 
                                //width: "100%",
                                //height: `calc(100vh - ${header_height} - ${editor_tab_height})`
                                height: `calc(100% - ${editor_tab_height})`
                                
                            }}
                        >
                            {/* ISACIVRFlowEditor, ISACIVRJSEditor ISACIVRVarEditor ISACIVRMsgEditor*/}
                            {renderEditor(v)}
                        </TabPanel>
                    )
                }
            </Box>
            <SearchResultView />
            <CustomModal open={saveModal.open} onClose={() => setSaveModal({ ...saveModal, open: false })}>
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
            </CustomModal>
        </Stack>
    )
}