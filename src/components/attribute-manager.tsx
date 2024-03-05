import { Box, Button, Chip, Divider, Grid, IconButton, List, ListItem, ListItemText, ListSubheader, Stack, TextField, Typography } from "@mui/material"
import { attribute_manager_width, editor_tab_height, header_height } from "../consts/g-style-vars"
import { ChevronRight, Close, ExpandMore } from "@mui/icons-material"
import { FlowEditMode, useFlowEditState } from "@/store/flow-editor-store"
import { useDiagramMetaStore } from "@/store/workspace-store"
import { NodeWrapper } from "../lib/node-wrapper";
import { ComponentType } from "react"
import { XMLParser } from "fast-xml-parser"
import { TreeItem, TreeView } from "@mui/x-tree-view"
import { GridColDef } from "@mui/x-data-grid"
import { QuickFilteredDataGrid } from "./common/grid"
import { grey } from "@mui/material/colors"
import React from "react"
import { customEditorMap } from "./editor/isacivr-attribute-fields"

const ISACIVRAttributeItem = (
    props: {
        type: string,
        xml: any
    }) => {
    switch (props.type) {
        default:
            return (
                <TextField label="xml" disabled multiline fullWidth value={props.xml} />
            )
    }
}

const ISACIVRAttributeField = () => {
    const meta = useDiagramMetaStore((state) => state.meta);
    const blockObject = useFlowEditState((state) => state.blockObject);

    if (meta) {
        const metaName = blockObject?.metaName;
        const id = blockObject?.id;
        const description = blockObject?.description;
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
                        <ListItem dense>
                            <ListItemText
                                primary={<Typography variant="caption" sx={{ userSelect: "none" }}>Name</Typography>}
                                secondary={blockMeta.displayName}
                            />
                            <ListItemText primary="ID" secondary={id} />
                        </ListItem>
                        <ListItem dense>
                            {userComment && <ListItemText primary="Comment" secondary={userComment} />}
                        </ListItem>
                        <ListItem dense>
                            {isJumpable && <Chip size="small" label="Jumpable" />}
                        </ListItem>
                    </List>
                    <Divider variant="fullWidth" />
                    <List subheader={<ListSubheader sx={{ userSelect: "none" }}>Attributes</ListSubheader>}
                        onDragCapture={(e) => console.log(e)}
                    >
                        {properties.map((p: {
                            displayName: string, type: string, required: boolean, isProtected: boolean,
                            isTargetPage: boolean, isTargetBlock: boolean, buildName: string,
                            customEditorTypeName: string
                        }) => {

                            const type = p.type;
                            const buildName = p.buildName;
                            const element = wrapper.child(buildName)?.toString();
                            if (p.customEditorTypeName) {
                                const CustomEditor = customEditorMap[p.customEditorTypeName];
                                return (
                                    <ListItem key={buildName}>
                                        <Stack sx={{ width: "100%" }}>
                                            <ListItemText primary={<Typography variant="caption" sx={{ userSelect: "none" }}>{p.displayName}</Typography>} />
                                            <CustomEditor xml={element} />
                                        </Stack>
                                    </ListItem>
                                )
                            } else {
                                return (
                                    <ListItem key={buildName}>
                                        <ISACIVRAttributeItem type={type} xml={element} />
                                    </ListItem>
                                )
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
            }}
        >
            <Stack direction="row" sx={{ padding: "6px", }}>
                <Typography variant="body1"
                    sx={{ padding: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}
                >Attribute Manager</Typography>
                <Button sx={{ padding: "8px" }}>save</Button>
                <IconButton sx={{ padding: "8px", borderRadius: "25%", textAlign: "center" }}>
                    <Close fontSize="small" />
                </IconButton>
            </Stack>
            <Divider variant="fullWidth" />
            {flowEditMode?.name === FlowEditMode.edit && <ISACIVRAttributeField />}
            <ResizableBox />
        </Box>
    )
}