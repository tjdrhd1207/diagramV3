import { useEditorTabState } from "@/store/flow-editor-store"
import { Box, Button, Container, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material"
import { TabPanel } from "./common/tab";
import { EDITOR_TYPE } from "@/store/flow-editor-store";
import { editor_tab_height, header_height, hover_visible_style } from "@/consts/g-style-vars";
import { Add, Close } from "@mui/icons-material";
import React from "react";
import { SVGDiagramWithStore } from "./editor/isacivr-diagram-editor";
import { useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";
import { AttributeManager } from "./attribute-manager";
import { BlockPallete } from "./block-pallete";
import dynamic from "next/dynamic";
import { ContextMenu } from "./common/context-menu";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "./common/modal";
import { NodeWrapper } from "@/lib/diagram";
import { $Functions_Tab_Name, $Messages_Tab_Name, $Variables_Tab_Name } from "@/consts/flow-editor";
import { APIResponse } from "@/consts/server-object";
import { DiffEditor } from "@monaco-editor/react";
import { ISACIVRVarEditor } from "./editor/isacivr-variable-editor";

const flowEditorTabHeight = { minHeight: editor_tab_height, height: editor_tab_height }
const tablabelStyle = { textTransform: "none" }

const EditorWithNoSSR = dynamic(
    () => import("./editor/isacivr-js-editor").then((module) => module.ISACIVRJSEditor),
    { ssr: false}
)

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
    const projectName = useProjectStore((state) => state.projectName);
    const projectXML = useProjectStore((state) => state.projectXML);
    const setProjectXML = useProjectStore((state) => state.setProjectXML);

    const meta = useDiagramMetaStore((state) => state.meta);

    const [ saveModal, setSaveModal ] = React.useState<SaveModalState>({ open: false, target: "", origin: "", modified: "" });

    const handleTabChanged = (event: React.SyntheticEvent<Element, Event>, value: any) => {
        if (value !== "add") {
            setTab(value);
        }
    }

    const handleTabClick = (event: React.MouseEvent) => {
        const target = event.currentTarget.innerHTML;
        setTab(target);
    }

    const handleTabCloseButton = (event: React.MouseEvent) => {
        const target = event.currentTarget.parentElement?.firstElementChild?.innerHTML;
        handleTabClose(target);
    }

    const handleTabSave = (target: string | undefined) => {
        if (target) {
            const found = getTabByName(target);
            if (found) {
                if ((target === $Functions_Tab_Name) || (target === $Variables_Tab_Name) || (target === $Messages_Tab_Name)) {
                    if (projectXML) {
                        const wrapper = NodeWrapper.parseFromXML(projectXML);
                        wrapper.child("functions").value(found.contents);
                        const xmlString = wrapper.toString();
                        const url = `/api/project/${projectID}/${projectName}.xml?action=save`;
                        fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/xml",
                            },
                            body: xmlString
                        }).then((response) => response.json()).then((json) => {
                            const apiResponse: APIResponse = json;
                            if (apiResponse.result === "OK") {
                                setProjectXML(xmlString)
                                setTabNotModified(target);
                            }
                        })
                    }
                } else {
    
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
                    setSaveModal({
                        open: true,
                        target: target,
                        origin: origin,
                        modified: contents
                    });
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
        }
        setSaveModal({ ...saveModal, open: false });
    }

    const renderEditor = (name: string, type: EDITOR_TYPE, origin: string, contents: string) => {
        const handleEdtiorChanged = (value: string) => {
            if (origin === value) {
                setTabNotModified(name);
            } else {
                setTabModified(name, value);
            }
        }

        switch (type) {
            case EDITOR_TYPE.dxml:
                return (
                    <Box sx={{ height: "100%" }}>
                        {meta && <SVGDiagramWithStore pageName={"ivrmain"} xml={contents} />}
                        <BlockPallete />
                        <AttributeManager />
                    </Box>
                )
            case EDITOR_TYPE.js:
                return <EditorWithNoSSR code={contents} setModified={(value) => handleEdtiorChanged(value)} />
            case EDITOR_TYPE.variable:
                return <ISACIVRVarEditor origin={origin} variables={contents} setModified={(value) => handleEdtiorChanged(value)}/>
            case EDITOR_TYPE.message:
                return (<></>)
            default:
                return (<></>)
        }
    }
    
    return (
        <Stack
            sx={{ 
                // width: `calc(100vw - ${explorer_width})`,
                // width: `${editor_width}`
                width: "100%"
            }}
        >
            <Box>
                <Tabs value={tab} variant="scrollable"
                    // onChange={handleTabChanged}
                    sx={{ ...flowEditorTabHeight, width: "100%", borderBlockEnd: "1px solid" }}
                >
                    {
                        tabs.length !== 0 && tabs.map((v) => 
                            <Tab key={v.name} value={v.name}
                                label={
                                    <ContextMenu 
                                        menuItems={[ 
                                            { label: "save", disabled: false, onClick: (target) => handleTabSave(target) },
                                            { label: "close", disabled: false, onClick: (target) => handleTabClose(target) },
                                        ]}
                                    >
                                        <Stack direction="row" gap={1} sx={{ alignItems: "center" }}
                                            
                                        >
                                            <Typography variant="body2" onClick={handleTabClick}
                                                sx={v.modified? { fontWeight: "bold" } : undefined}
                                            >{v.name}</Typography>
                                            {v.modified? <p>*</p> : undefined}
                                            <Close onClick={handleTabCloseButton}
                                                sx={{ fontSize: "20px" , padding: "5px", borderRadius: "25%", ...hover_visible_style("#EEEEEE")  }}>
                                                {v.name}
                                            </Close>
                                        </Stack>
                                    </ContextMenu>
                                }
                                sx={{ ...flowEditorTabHeight, ...tablabelStyle}} disableRipple />
                            )
                    }
                    <Tab key="add" label={<Add fontSize="small" sx={{ ...hover_visible_style("#EEEEEE") }}/>} 
                        value="add" sx={{ ...flowEditorTabHeight, minWidth: "20px", width: "20px" }} disableRipple />
                </Tabs>
            </Box>
            {
                tabs.length !== 0 && tabs.map((v) => 
                    <TabPanel key={v.name} state={tab} value={v.name}
                        sx={{ width: "100%", height: `calc(100vh - ${header_height} - ${editor_tab_height})` }}>
                        {/* ISACIVRFlowEditor, ISACIVRJSEditor ISACIVRVarEditor ISACIVRMsgEditor*/}
                        {renderEditor(v.name, v.type, v.origin, v.contents)}
                    </TabPanel>
                )
            }
            <CustomModal open={saveModal.open} onClose={() => setSaveModal({ ...saveModal, open: false })}>
                <CustomModalTitle title="Save"/>
                <CustomModalContents>
                    <Typography variant="body1">Do you want to save the changes you made to "{saveModal.target}"?</Typography>
                    <Typography variant="caption">⚠️ Your changes will be lost if you don't save them.</Typography>
                    <DiffEditor height="30vh" width="50vw" original={saveModal.origin} modified={saveModal.modified} options={{ readOnly: true }}/>
                </CustomModalContents>
                <CustomModalAction>
                    <Button size="small" color="success" onClick={() => handleTabSave(saveModal.target)}>Save</Button>
                    <Button size="small" color="error" onClick={() => handleTabCloseNoSave(saveModal.target)}>Don't save</Button>
                    <Button size="small" onClick={() => setSaveModal({ ...saveModal, open: false })}>Cancel</Button>
                </CustomModalAction>
            </CustomModal>
        </Stack>
    )
}