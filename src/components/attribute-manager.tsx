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
        const { metaName, id, userComment, isJumpable } = props.commonAttributes;
        return (
            <List subheader={<ListSubheader sx={{ userSelect: "none" }}>Information</ListSubheader>}>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3}} paddingInline={2}>
                    <Grid item xs={8}>
                        <Stack direction="row" gap={1} sx={{ height: "100%", alignItems: "center",  }}>
                            <EllipsisLabel variant="subtitle2" width="30%">Type : </EllipsisLabel>
                            <Stack direction="row" gap={1} overflow="auto" width="100%">
                                <Chip size="small" color="primary" label={metaName} />
                                {isJumpable && <Chip size="small" color="secondary" label="Jumpable"  />}
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item xs={4}>
                        <Stack direction="row" gap={1} sx={{ height: "100%", alignItems: "center", whiteSpace: "nowrap" }}>
                            <EllipsisLabel variant="subtitle2" width="40%">ID : </EllipsisLabel>
                            <TextField size="small" disabled fullWidth variant="standard" value={id} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack direction="row" gap={1} sx={{ height: "100%", alignItems: "center", whiteSpace: "nowrap" }}>
                            <EllipsisLabel variant="subtitle2" width="35%">Comment : </EllipsisLabel>
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

const ISACIVRBlockForm = (props: { pageName: string, specificAttributes: BlockSpecificAttributes[] | undefined }) => {
    if (props.specificAttributes) {
        const { pageName, specificAttributes } = props;
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
                                                pageName={pageName} attribute={p}
                                                onChange={(input: any, modified: boolean) => updateBlockAttributes(pageName, displayName, input, modified)}
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
                                                        pageName={pageName} attribute={p}
                                                        onChange={(input, modified) => updateBlockAttributes(pageName, displayName, input, modified)}
                                                    />
                                                </ListItem>
                                            )
                                        } else {
                                            return (
                                                <ListItem key={buildName}>
                                                    <StringEditor 
                                                        pageName={pageName} attribute={p}
                                                        onChange={(input, modified) => updateBlockAttributes(pageName, displayName, input, modified)}
                                                    />
                                                </ListItem>
                                            )
                                        }
                                    case "Boolean":
                                        return (
                                            <ListItem key={buildName}>
                                                <BooleanEditor 
                                                    pageName={pageName} attribute={p}
                                                    onChange={(input, modified) => updateBlockAttributes(pageName, displayName, input, modified)}
                                                />
                                            </ListItem>
                                        )
                                    case "Number":
                                        return (
                                            <ListItem key={buildName}>
                                                <NumberEditor 
                                                    pageName={pageName} attribute={p}
                                                    onChange={(input, modified) => updateBlockAttributes(pageName, displayName, input, modified)}
                                                />
                                            </ListItem>
                                        )
                                    default:
                                        return (
                                            <ListItem key={buildName}>
                                                <ISACIVRAttributeViewer pageName={pageName} attribute={p} />
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

export const AttributeManager = (props: { pageName: string }) => {
    const { pageName } = props;
    const show = useBlockAttributeState((state) => state.show);
    // const specificAttributes = useAttributePropsState((state) => state.specificAttributes);
    const modificationApplied = useBlockAttributeState((state) => state.modificationApplied);

    const attributesStates = useBlockAttributeState((state) => state.states);
    const blockAttributes = attributesStates.find((s) => s.targetPage === pageName);
    const userData = blockAttributes?.userData;
    const commonAttributes = blockAttributes?.commonAttributes;
    const specificAttributes = blockAttributes?.specificAttributes;

    // const userData = useAttributePropsState((state) => state.userData);
    const setFlowEditMode = useFlowEditState((state) => state.setMode);

    const tab = useEditorTabState((state) => state.tab);

    const handleSave = () => {
        if (userData && specificAttributes) {
            specificAttributes.forEach((b) => {
                if (b.modified) {
                    userData.child(b.buildName)?.value(b.value);
                }
            })
            modificationApplied();
            setFlowEditMode({ mode: FlowEditMode.build, targetPage: tab, targetBlock: undefined });
        }
    }

    return (
        <Box
            sx={{
                width: attribute_manager_width, height: `calc(100vh - ${header_height} - ${editor_tab_height})`,
                position: "absolute", top: `calc(${header_height} + ${editor_tab_height})`, left: "100%", transform: "translate(-100%, 0%)",
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
                                size="small" disabled={specificAttributes? specificAttributes.every((b) => !b.modified) : true} 
                                onClick={handleSave}
                            >
                                save
                            </Button>
                        </Stack>
                        <Divider variant="fullWidth" />
                        <ISACIVRBlockInfo commonAttributes={commonAttributes}/>
                        <Divider variant="fullWidth" />
                        <ISACIVRBlockForm pageName={pageName} specificAttributes={specificAttributes} /> 
                    </> : <></>
            }
            {/* <ResizableBox /> */}
        </Box>
    )
}