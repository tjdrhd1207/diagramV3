import { useEditorTabState } from "@/store/flow-editor-store"
import { Box, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material"
import { TabPanel } from "./common/tab";
import { EDITOR_TYPE } from "@/store/flow-editor-store";
import { ISACIVRJSEditor } from "./editor/isacivr-js-editor";
import { editor_tab_height, header_height, hover_visible_style } from "@/consts/g-style-vars";
import { Add, Close } from "@mui/icons-material";
import React from "react";
import { SVGDiagramWithStore } from "./editor/isacivr-diagram-editor";
import { useDiagramMetaStore } from "@/store/workspace-store";
import { AttributeManager } from "./attribute-manager";
import { BlockPallete } from "./block-pallete";

const flowEditorTabHeight = { minHeight: editor_tab_height, height: editor_tab_height }
const tablabelStyle = { textTransform: "none" }

export const FlowEditor = () => {
    const tabs = useEditorTabState((state) => state.tabs);

    const tab = useEditorTabState((state) => state.tab);
    const setTab = useEditorTabState((state) => state.setTab);
    const removeTab = useEditorTabState((state) => state.removeTab);
    const setTabModified = useEditorTabState((state) => state.setTabModified);
    const setTabNotModified = useEditorTabState((state) => state.setTabUnmodified);

    const meta = useDiagramMetaStore((state) => state.meta);

    React.useEffect(() => {
    }, [])

    const handleTabChanged = (event: React.SyntheticEvent<Element, Event>, value: any) => {
        if (value !== "add") {
            setTab(value);
        }
    }

    const handleTabClick = (event: React.MouseEvent) => {
        const target = event.currentTarget.innerHTML;
        setTab(target);
    }

    const handleTabClose = (event: React.MouseEvent) => {
        const target = event.currentTarget.parentElement?.firstElementChild?.innerHTML;
        if (tab === target) {
            setTab(false);
        }
        if (target) {
            removeTab(target);
        }
    }

    const renderEditor = (name: string, type: EDITOR_TYPE, contents: string) => {
        const handleJSEdtiorChanged = (value: string) => {
            if (contents === value) {
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
                return (
                    <ISACIVRJSEditor code={contents} setModified={(value) => handleJSEdtiorChanged(value)}/>
                )
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
                                <Stack direction="row" gap={1} sx={{ alignItems: "center" }}>
                                    <Typography variant="body2" onClick={handleTabClick}
                                        sx={v.modified? { fontWeight: "bold" } : undefined}
                                    >{v.name}</Typography>
                                    {v.modified? <p>*</p> : undefined}
                                    <Close onClick={handleTabClose}
                                        sx={{ fontSize: "20px" , padding: "5px", borderRadius: "25%", ...hover_visible_style("#EEEEEE")  }}>
                                        {v.name}
                                    </Close>
                                </Stack>
                            }
                            sx={{ ...flowEditorTabHeight, ...tablabelStyle}} disableRipple />
                        )
                }
                <Tab key="add" label={<Add fontSize="small" sx={{ ...hover_visible_style("#EEEEEE") }}/>} 
                    value="add" sx={{ ...flowEditorTabHeight, minWidth: "20px", width: "20px" }} disableRipple />
            </Tabs>
            {
                tabs.length !== 0 && tabs.map((v, i) => 
                    <TabPanel key={v.name} state={tab} value={v.name}
                        sx={{ width: "100%", height: `calc(100vh - ${header_height} - ${editor_tab_height})` }}>
                        {/* ISACIVRFlowEditor, ISACIVRJSEditor ISACIVRVarEditor ISACIVRMsgEditor*/}
                        {renderEditor(v.name, v.type, v.contents)}
                    </TabPanel>
                )
            }
        </Stack>
    )
}