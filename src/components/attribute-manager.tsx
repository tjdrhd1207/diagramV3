"use client"

import { Box, Button, Chip, Divider, Grid, IconButton, Input, List, ListItem, ListItemText, ListSubheader, Skeleton, Stack, TextField, Tooltip, Typography } from "@mui/material"
import { attribute_manager_width, editor_tab_height, header_height } from "@/consts/g-style-vars"
import { BlockCommonAttributes, BlockSpecificAttributes, FlowEditMode, useBlockAttributeState, useEditorTabState, useFlowEditState } from "@/store/flow-editor-store"
import { grey, red } from "@mui/material/colors"
import React from "react"
import { BooleanEditor, ISACIVRAttributeViewer, NumberEditor, PredefinedItemEditor, StringEditor, customEditorMap } from "./editor/isacivr-attribute-fields"
import { EllipsisLabel } from "./common/typhography"

const ISACIVRBlockInfo = (props: { commonAttributes: BlockCommonAttributes | undefined }) => {
    // const commonAttributes = useAttributePropsState((state) => state.commonAttributes);
    if (props.commonAttributes) {
        const { metaName, displayName, id, userComment, isJumpable } = props.commonAttributes;
        return (
            <List subheader={<ListSubheader sx={{ userSelect: "none" }}>Information</ListSubheader>}>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3}} paddingInline={2}>
                    <Grid item xs={6}>
                        <Stack direction="row" gap={1} sx={{ height: "100%", alignItems: "center",  }}>
                            <EllipsisLabel variant="caption" width="40%">Type : </EllipsisLabel>
                            <Stack direction="row" gap={1} overflow="auto" width="100%">
                                <Chip size="small" color="primary" label={displayName} />
                                {/* {isJumpable && <Chip size="small" color="secondary" label="Jumpable"  />} */}
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                        <Stack direction="row" gap={1} sx={{ height: "100%", alignItems: "center", whiteSpace: "nowrap" }}>
                            <EllipsisLabel variant="caption" width="40%">ID : </EllipsisLabel>
                            <TextField size="small" disabled fullWidth variant="standard" value={id} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack direction="row" gap={1} sx={{ height: "100%", alignItems: "center", whiteSpace: "nowrap" }}>
                            <EllipsisLabel variant="caption" width="35%">Comment : </EllipsisLabel>
                            <TextField disabled size="small" variant="standard" fullWidth value={userComment} />
                        </Stack>
                    </Grid>
                </Grid>
            </List>
        )
    } else {
        return <></>
    }
}

const ISACIVRBlockForm = (props: { flowName: string, specificAttributes: BlockSpecificAttributes[] | undefined }) => {
    if (props.specificAttributes) {
        const { flowName, specificAttributes } = props;
        // const specificAttributes = useAttributePropsState((state) => state.specificAttributes);
        const updateBlockAttributes = useBlockAttributeState((state) => state.updateBlockAttributes);
    
        return (
            <Box>
                <List subheader={<ListSubheader sx={{ userSelect: "none" }}>Attributes</ListSubheader>}>
                    {
                        specificAttributes.map((p) => {
                            const { buildName, displayName, customEditorTypeName, itemsSourceKey, description, origin, value, attributes, modified } = p;
                            if (customEditorTypeName) {
                                const CustomEditor = customEditorMap[customEditorTypeName];
                                if (CustomEditor) {
                                    return (
                                        <ListItem key={buildName}>
                                            <CustomEditor 
                                                flowName={flowName} attribute={p}
                                                onChange={(input: any, modified: boolean) => updateBlockAttributes(flowName, displayName, input, modified)}
                                            />
                                        </ListItem>
                                    )
                                } else {
                                    return (
                                        <Skeleton key={buildName} variant="rounded" width="100%" height="100%" />
                                    )
                                }
                            } else {
                                switch (p.type) {
                                    case "String":
                                        if ((itemsSourceKey === "AudioFileType") || (itemsSourceKey === "SmartIVRType")) {
                                            return (
                                                <ListItem key={buildName}>
                                                    <PredefinedItemEditor 
                                                        flowName={flowName} attribute={p}
                                                        onChange={(input, modified) => updateBlockAttributes(flowName, displayName, input, modified)}
                                                    />
                                                </ListItem>
                                            )
                                        } else {
                                            return (
                                                <ListItem key={buildName}>
                                                    <StringEditor 
                                                        flowName={flowName} attribute={p}
                                                        onChange={(input, modified) => updateBlockAttributes(flowName, displayName, input, modified)}
                                                    />
                                                </ListItem>
                                            )
                                        }
                                    case "Boolean":
                                        return (
                                            <ListItem key={buildName}>
                                                <BooleanEditor 
                                                    flowName={flowName} attribute={p}
                                                    onChange={(input, modified) => updateBlockAttributes(flowName, displayName, input, modified)}
                                                />
                                            </ListItem>
                                        )
                                    case "Number":
                                        return (
                                            <ListItem key={buildName}>
                                                <NumberEditor 
                                                    flowName={flowName} attribute={p}
                                                    onChange={(input, modified) => updateBlockAttributes(flowName, displayName, input, modified)}
                                                />
                                            </ListItem>
                                        )
                                    default:
                                        return (
                                            <ListItem key={buildName}>
                                                <ISACIVRAttributeViewer flowName={flowName} attribute={p} />
                                            </ListItem>
                                        )
                                }
                            }
                        })
                    }
                </List>
            </Box>
        )
    } else {
        return <></>
    }
}

const ResizableBox = () => {
    const [size, setSize] = React.useState({ width: 200, height: 200 });
    const [isResizing, setIsResizing] = React.useState(false);

    const handleMouseDown = () => {
        setIsResizing(true);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isResizing) return;
        setSize({
            width: event.clientX,
            height: event.clientY,
        });
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    return (
        <Box
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            sx={{
                width: size.width,
                height: size.height,
                border: '1px solid grey',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {"Resizable Box"}
        </Box>
    )
}

export const AttributeManager = (props: { flowName: string }) => {
    const { flowName } = props;
    // const specificAttributes = useAttributePropsState((state) => state.specificAttributes);
    // const modificationApplied = useBlockAttributeState((state) => state.modificationApplied);

    const attributesStates = useBlockAttributeState((state) => state.states);
    const blockAttributes = attributesStates.find((s) => s.targetFlow === flowName);
    const userData = blockAttributes?.userData;
    const commonAttributes = blockAttributes?.commonAttributes;
    const specificAttributes = blockAttributes?.specificAttributes;
    const modificationApplied = useBlockAttributeState((state) => state.modificationApplied);

    // const userData = useAttributePropsState((state) => state.userData);
    const setIdleMode = useFlowEditState((state) => state.setIdleMode);
    const setBuildMode = useFlowEditState((state) => state.setBuildMode);

    const tab = useEditorTabState((state) => state.tab);

    const handleSave = () => {
        if (userData && specificAttributes) {
            specificAttributes.forEach((sa) => {
                if (sa.modified) {
                    userData.child(sa.buildName)?.value(sa.value);
                }
            });
            modificationApplied(flowName);
            setBuildMode(flowName);
        }
    }

    return (
        <Box
            sx={{
                // width: attribute_manager_width,
                width: "30%",
                height: "100%",
                // height: `calc(100vh - ${header_height} - ${editor_tab_height})`,
                // position: "absolute", top: `calc(${header_height} + ${editor_tab_height})`, left: "100%", transform: "translate(-100%, 0%)",
                borderInlineStart: `1px solid ${grey[400]}`,
                bgcolor: "background.paper",
                overflow: "auto",
            }}
        >
            {
                userData?
                    <>
                        <Stack direction="row" padding="8px" alignItems="center">
                            <EllipsisLabel variant="body1" width="100%">Attribute Manager</EllipsisLabel>
                            <Button 
                                size="small" variant="contained"
                                disabled={specificAttributes? specificAttributes.every((b) => !b.modified) : true} 
                                onClick={() => handleSave()}
                            >
                                save
                            </Button>
                        </Stack>
                        <Divider variant="fullWidth" />
                        <ISACIVRBlockInfo commonAttributes={commonAttributes}/>
                        <Divider variant="fullWidth" />
                        <ISACIVRBlockForm flowName={flowName} specificAttributes={specificAttributes} /> 
                    </> : <></>
            }
            {/* <ResizableBox /> */}
        </Box>
    )
}