import { Box, Button, Chip, Divider, Grid, IconButton, Input, List, ListItem, ListItemText, ListSubheader, Skeleton, Stack, TextField, Tooltip, Typography } from "@mui/material"
import { attribute_manager_width, editor_tab_height, header_height } from "@/consts/g-style-vars"
import { FlowEditMode, useFlowEditState } from "@/store/flow-editor-store"
import { useDiagramMetaStore } from "@/store/workspace-store"
import { NodeWrapper } from "@/lib/node-wrapper";
import { grey, red } from "@mui/material/colors"
import React from "react"
import { BooleanEditor, ISACIVRAttributeViewer, NumberEditor, StringEditor, customEditorMap } from "./editor/isacivr-attribute-fields"
import { EllipsisLabel } from "./common/typhography"

const ISACIVRAttributeField = () => {
    const meta = useDiagramMetaStore((state) => state.meta);
    const blockObject = useFlowEditState((state) => state.blockObject);

    if (meta) {
        const metaName = blockObject?.metaName;
        const id = blockObject?.id;
        const xml = blockObject?.xml;
        const blockMeta = metaName ? meta.nodes?.[metaName] : undefined;
        if (blockMeta) {
            const wrapper = new NodeWrapper(xml);
            const userComment = wrapper.child("user-comment")?.value(undefined);
            const isJumpable = blockMeta.isJumpable;

            const properties = blockMeta.properties;
            return (
                <Box>
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
                    <Divider variant="fullWidth" />
                    <List subheader={<ListSubheader sx={{ userSelect: "none" }}>Attributes</ListSubheader>}> 
                        {properties.map((p: {
                            displayName: string, type: string, required: boolean, isProtected: boolean,
                            isTargetPage: boolean, isTargetBlock: boolean, buildName: string,
                            customEditorTypeName: string
                        }) => {

                            const type = p.type;
                            const buildName = p.buildName;
                            const element = wrapper.child(buildName);
                            if (p.customEditorTypeName) {
                                const CustomEditor = customEditorMap[p.customEditorTypeName];
                                if (CustomEditor) {
                                    return (
                                        <ListItem key={buildName}>
                                            <CustomEditor label={p.displayName} xml={element} />
                                        </ListItem>
                                    )
                                } else {
                                    return (
                                        <Skeleton key={buildName} variant="rounded" width="100%" height="100%" />
                                    )
                                }
                            } else {
                                switch (type) {
                                    case "String":
                                        return (
                                            <ListItem key={buildName}>
                                                <StringEditor label={p.displayName} xml={element} />
                                            </ListItem>
                                        )
                                    case "Boolean":
                                        return (
                                            <ListItem key={buildName}>
                                                <BooleanEditor label={p.displayName} xml={element} />
                                            </ListItem>
                                        )
                                    case "Number":
                                        return (
                                            <ListItem key={buildName}>
                                                <NumberEditor label={p.displayName} xml={element} />
                                            </ListItem>
                                        )
                                    default:
                                        return (
                                            <ListItem key={buildName}>
                                                <ISACIVRAttributeViewer label={p.displayName} xml={element} />
                                            </ListItem>
                                        )
                                }
                            }
                        })}
                    </List>
                </Box>
            )
        } else {
            return <></>
        }
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

export const AttributeManager = () => {
    const flowEditMode = useFlowEditState((state) => state.mode);

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
            <Stack direction="row" padding="8px" alignItems="center">
                <EllipsisLabel variant="body1" width="100%">Attribute Manager</EllipsisLabel>
                <Button size="small">save</Button>
            </Stack>
            <Divider variant="fullWidth" />
            {flowEditMode?.name === FlowEditMode.edit && <ISACIVRAttributeField />}
            {/* <ResizableBox /> */}
        </Box>
    )
}