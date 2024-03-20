import { useEditorTabState } from "@/store/flow-editor-store"
import { Box, Button, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material"
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

const flowEditorTabHeight = { minHeight: editor_tab_height, height: editor_tab_height }
const tablabelStyle = { textTransform: "none" }

const EditorWithNoSSR = dynamic(
    () => import("./editor/isacivr-js-editor").then((module) => module.ISACIVRJSEditor),
    { ssr: false}
)

export const FlowEditor = () => {
    const tabs = useEditorTabState((state) => state.tabs);

    const tab = useEditorTabState((state) => state.tab);
    const setTab = useEditorTabState((state) => state.setTab);
    const removeTab = useEditorTabState((state) => state.removeTab);
    const setTabModified = useEditorTabState((state) => state.setTabModified);
    const setTabNotModified = useEditorTabState((state) => state.setTabUnmodified);

    const projectXML = useProjectStore((state) => state.projectXML);

    const meta = useDiagramMetaStore((state) => state.meta);

    const [ open, setOpen ] = React.useState<string>();

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
            const found = tabs.find((t) => t.name === target);
            if (found && projectXML) {
                const wrapper = NodeWrapper.parseFromXML(projectXML);
                wrapper.child("functions").value(found.contents);

                console.log(wrapper.toString());

                // fetch => success? modified = true : huh?
            }
        }
        setOpen(undefined);
    }

    const handleTabClose = (target: string | undefined) => {
        if (target) {
            const found = tabs.find((t) => t.name === target);
            if (found) {
                console.log(found);
                if (found.modified) {
                    setOpen(target);
                } else {
                    if (tab === target) {
                        setTab(false);
                    }
        
                    removeTab(target);
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
        setOpen(undefined);
    }

    const renderEditor = (name: string, type: EDITOR_TYPE, origin: string, contents: string) => {
        const handleJSEdtiorChanged = (value: string) => {
            if (origin === value) {
                setTabNotModified(name);
            } else {
                setTabModified(name, value);
            }
        }

        switch (type) {
            case "dxml":
                return (
                    <Box sx={{ height: "100%" }}>
                        {meta && <SVGDiagramWithStore pageName={"ivrmain"} xml={contents} />}
                        <BlockPallete />
                        <AttributeManager />
                    </Box>
                )
            case "js":
                return <EditorWithNoSSR code={contents} setModified={(value) => handleJSEdtiorChanged(value)} />
            case "variable":
                return (<></>)
            case "interface":
                return (<></>)
            default:
                return (<></>)
        }
    }
    
    return (
        <Stack sx={{ 
                // width: `calc(100vw - ${explorer_width})`,
                // width: `${editor_width}`
                width: "100%"
            }}
        >
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
            {
                tabs.length !== 0 && tabs.map((v) => 
                    <TabPanel key={v.name} state={tab} value={v.name}
                        sx={{ width: "100%", height: `calc(100vh - ${header_height} - ${editor_tab_height})` }}>
                        {/* ISACIVRFlowEditor, ISACIVRJSEditor ISACIVRVarEditor ISACIVRMsgEditor*/}
                        {renderEditor(v.name, v.type, v.origin, v.contents)}
                    </TabPanel>
                )
            }
            <CustomModal open={open? true : false} onClose={() => setOpen(undefined)}>
                <CustomModalTitle title="Save"/>
                <CustomModalContents>
                    <Typography variant="body1">Do you want to save the changes?</Typography>
                    <Typography variant="caption">Your changes will be lost if you don't save them.</Typography>
                </CustomModalContents>
                <CustomModalAction>
                    <Button size="small" color="success" onClick={() => handleTabSave(open)}>Save</Button>
                    <Button size="small" color="error" onClick={() => handleTabCloseNoSave(open)}>Don't save</Button>
                    <Button size="small" onClick={() => setOpen(undefined)}>Cancel</Button>
                </CustomModalAction>
            </CustomModal>
        </Stack>
    )
}