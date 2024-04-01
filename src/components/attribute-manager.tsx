"use client"

import { Box, Button, Chip, Divider, Grid, IconButton, Input, List, ListItem, ListItemText, ListSubheader, Skeleton, Stack, TextField, Tooltip, Typography } from "@mui/material"
import { attribute_manager_width, editor_tab_height, header_height } from "@/consts/g-style-vars"
import { FlowEditMode, useAttributePropsState, useFlowEditState } from "@/store/flow-editor-store"
import { grey, red } from "@mui/material/colors"
import React from "react"
import { BooleanEditor, ISACIVRAttributeViewer, NumberEditor, PredefinedItemEditor, StringEditor, customEditorMap } from "./editor/isacivr-attribute-fields"
import { EllipsisLabel } from "./common/typhography"
import { NodeWrapper } from "@/lib/diagram"

const ISACIVRBlockInfo = () => {
    const commonProps = useAttributePropsState((state) => state.commonProps);
    const { metaName, id, userComment, isJumpable } = commonProps;

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
                        <TextField size="small" variant="standard" fullWidth value={userComment} />
                    </Stack>
                </Grid>
            </Grid>
        </List>
    )
}

const ISACIVRBlockForm = () => {
    const blockProps = useAttributePropsState((state) => state.blockProps);
    const updateAttributeProps = useAttributePropsState((state) => state.updateAttributeProps);

    return (
        <Box>
            <List subheader={<ListSubheader sx={{ userSelect: "none" }}>Attributes</ListSubheader>}> 
                {
                    blockProps.map((p) => {
                        const { buildName, displayName, customEditorTypeName, itemsSourceKey, origin, value, attributes, modified } = p;
                        if (customEditorTypeName) {
                            const CustomEditor = customEditorMap[customEditorTypeName];
                            if (CustomEditor) {
                                return (
                                    <ListItem key={buildName}>
                                        <CustomEditor label={displayName} origin={origin} value={value} attributes={attributes} modified={modified}
                                            onChange={(input: any, modified: boolean) => updateAttributeProps(displayName, input, modified)}
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
                                                <PredefinedItemEditor block={p}
                                                    onChange={(input, modified) => updateAttributeProps(displayName, input, modified)}
                                                />
                                            </ListItem>
                                        )
                                    } else {
                                        return (
                                            <ListItem key={buildName}>
                                                <StringEditor label={displayName} origin={origin} value={value} modified={modified}
                                                    onChange={(input, modified) => updateAttributeProps(displayName, input, modified)}
                                                />
                                            </ListItem>
                                        )
                                    }
                                case "Boolean":
                                    return (
                                        <ListItem key={buildName}>
                                            <BooleanEditor label={displayName} origin={origin} value={value} modified={modified}
                                                onChange={(input, modified) => updateAttributeProps(displayName, input, modified)}
                                            />
                                        </ListItem>
                                    )
                                case "Number":
                                    return (
                                        <ListItem key={buildName}>
                                            <NumberEditor label={displayName} origin={origin} value={value} modified={modified}
                                                onChange={(input, modified) => updateAttributeProps(displayName, input, modified)}
                                            />
                                        </ListItem>
                                    )
                                default:
                                    return (
                                        <ListItem key={buildName}>
                                            <ISACIVRAttributeViewer label={displayName} origin={origin} value={value} modified={modified} />
                                        </ListItem>
                                    )
                            }
                        }
                    })
                }
            </List>
        </Box>
    )
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

export const AttributeManager = () => {
    const show = useAttributePropsState((state) => state.show);
    const blockProps = useAttributePropsState((state) => state.blockProps);
    const modificationApplied = useAttributePropsState((state) => state.modificationApplied);
    const blockObject = useFlowEditState((state) => state.blockObject);

    const setFlowEditMode = useFlowEditState((state) => state.setMode);

    const handleSave = () => {
        const xml = blockObject?.xml;
        if (xml) {
            blockProps.forEach((b) => {
                if (b.modified) {
                    xml.child(b.buildName)?.value(b.value);
                }
            })
            modificationApplied();
            setFlowEditMode({ name: FlowEditMode.build, target: undefined });
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
                show?
                    <>
                        <Stack direction="row" padding="8px" alignItems="center">
                            <EllipsisLabel variant="body1" width="100%">Attribute Manager</EllipsisLabel>
                            <Button size="small" disabled={blockProps.every((b) => !b.modified)} onClick={handleSave}>save</Button>
                        </Stack>
                        <Divider variant="fullWidth" />
                        <ISACIVRBlockInfo />
                        <Divider variant="fullWidth" />
                        <ISACIVRBlockForm /> 
                    </> : <></>
            }
            {/* <ResizableBox /> */}
        </Box>
    )
}