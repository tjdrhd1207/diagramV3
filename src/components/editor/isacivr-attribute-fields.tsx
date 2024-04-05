"use client"

import { GridColDef, GridRenderEditCellParams, GridToolbarContainer, GridToolbarFilterButton, GridToolbarQuickFilter, useGridApiContext } from "@mui/x-data-grid";
import { XMLParser } from "fast-xml-parser";
import { CustomDataGrid } from "../common/grid";
import { ComponentFactory } from "../common/types";
import { Autocomplete, Badge, Box, Button, Checkbox, Grid, IconButton, Input, MenuItem, Select, SelectChangeEvent, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import React from "react";
import { useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";
import { EllipsisLabel } from "../common/typhography";
import { BlockFormProps, useEditorTabState } from "@/store/flow-editor-store";
import { Add, HelpOutline, QuestionMark } from "@mui/icons-material";
import { $ValueEditorColumns } from "@/consts/flow-editor";
import { CustomModal, CustomModalAction, CustomModalContents } from "../common/modal";
import dynamic from "next/dynamic";

const EditorWithNoSSR = dynamic(
    () => import("./isacivr-js-editor").then((module) => module.ISACIVRJSEditor),
    { ssr: false }
)


function CustomEditComponent(params: GridRenderEditCellParams) {
    const { id, value, field, hasFocus } = params;
    const apiRef = useGridApiContext();
    const inputRef = React.useRef<HTMLInputElement>();

    React.useLayoutEffect(() => {
        if (hasFocus) {
            inputRef.current?.focus();
        }
    }, [hasFocus]);

    const handleValueChange = (event: SelectChangeEvent<string>) => {
        const newValue = event.target.value;
        apiRef.current.setEditCellValue({ id, field, value: newValue });
    };

    return (
        <Select size="small" variant="standard" fullWidth inputRef={inputRef}
            value={value} onChange={handleValueChange}
            sx={{ typography: "caption" }}
        >
            <MenuItem value="string" sx={{ typography: "caption" }}>String</MenuItem>
            <MenuItem value="int64" sx={{ typography: "caption" }}>Int64</MenuItem>
            <MenuItem value="boolean" sx={{ typography: "caption" }}>Boolean</MenuItem>
        </Select>
    )
}

const AttributeField = (
    props: {
        label: string,
        description?: string,
        children: React.ReactNode
}) => {
    return (
        <Stack width="100%" gap={1}>
            <Stack width="100%" direction="row" gap={1}>
                <EllipsisLabel variant="subtitle2" fontWeight={600}>{props.label}</EllipsisLabel>
                { 
                    props.description && 
                        <Tooltip title={props.description}>
                            <HelpOutline fontSize="small" color="disabled"/>
                        </Tooltip>
                }
            </Stack>
            {props.children}
        </Stack>
        // <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }} height="100%" alignItems="center">
        //     <Grid item xs={4}>
        //         <EllipsisLabel variant="subtitle2" width="100%">{props.label} : </EllipsisLabel>
        //         {/* <Tooltip title={props.description? props.description : ""}>
        //         </Tooltip> */}
        //     </Grid>
        //     <Grid item xs={8}>
        //         {props.children}
        //     </Grid>
        // </Grid>
    )
}

interface AttributeFieldProps {
    attribute: BlockFormProps,
    onChange?: (input: any, modified: boolean) => void
}

const ValueEditorComponent = (props: AttributeFieldProps) => {
    const { displayName: label, value, attributes } = props.attribute;
    // const key = attributes?.key;
    const variableObject = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(value);
    return (
        <Stack sx={{ width: "100%", height: "100%" }}>
            <EllipsisLabel variant="subtitle2">{label}</EllipsisLabel>
            <CustomDataGrid
                columns={$ValueEditorColumns}
                rows={Array.isArray(variableObject)? variableObject: []}
                getRowId={(row) => row.name}
                density="compact"
                customToolbar={(props) => 
                    <GridToolbarContainer sx={{ width: "100%" }}>
                        <Stack direction="row" flex={1}>
                            <Box sx={{ width: "100%"}}>
                                <Button color="secondary" startIcon={<Add />}>Add</Button>
                            </Box>
                            <GridToolbarQuickFilter fullWidth sx={{ width: "100%" }}/>
                        </Stack>
                    </GridToolbarContainer>
                }
                sx={{}}
            />
        </Stack>
    )
}

export const TargetPageEditorComponent = (props: AttributeFieldProps) => {
    const { displayName: label, origin, value, modified } = props.attribute;
    const scenarioPages = useProjectStore((state) => state.scenarioPages);
    
    const tab = useEditorTabState((state) => state.tab);

    const handleChange = (event: SelectChangeEvent<string>) => {
        const input = event.target?.value;
        if (props.onChange) {
            props.onChange(input, input !== origin);
        }
    }

    return (
        <AttributeField label={label}>
            <Badge color="secondary" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
                <Select fullWidth variant="standard" value={value} onChange={handleChange}>
                    <MenuItem value={tab}>{"<Current Page>"}</MenuItem>
                    {
                        scenarioPages.length !== 0 && scenarioPages.filter((p) => p.name !== tab).map((p) => 
                            <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
                        )
                    }
                </Select>
            </Badge>
        </AttributeField>
    )
}

export const TargetBlockEditorComponent = (props: AttributeFieldProps) => {
    const { displayName: label, origin, value, modified } = props.attribute;
    const tab = useEditorTabState((state) => state.tab);
    const tabs = useEditorTabState((state) => state.tabs);

    const jumpableTagNames = useDiagramMetaStore((state) => state.jumpableTagNames);

    const targetblockList: Array<{ id: string, desc: string }> = []
    tabs.map((t) => {
        if (t.name === tab) {
            const pageObject = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(t.contents.toString());
            const blocks = pageObject.scenario?.block;
            if (blocks) {
                blocks.map((b: any) => {
                    if (jumpableTagNames.some((tag) => tag in b)) {
                        targetblockList.push({ id: b.id, desc: b.desc });
                    }
                });
            }
        }
    })

    const handleChange = (event: SelectChangeEvent<string>) => {
        const input = event.target?.value;
        if (props.onChange) {
            props.onChange(input, input !== origin);
        }
    }

    return (
        <AttributeField label={label}>
            <Badge color="secondary" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
                <Select fullWidth variant="standard" value={value} onChange={handleChange}>
                    <MenuItem value=""></MenuItem>
                    {
                        targetblockList.length !== 0 && targetblockList.map((t) => 
                            <MenuItem key={t.id} value={t.id}>{`${t.id} ${t.desc}`}</MenuItem>
                        )
                    }
                </Select>
            </Badge>
        </AttributeField>
    )
}

export const ScriptEditorComponent = (props: AttributeFieldProps) => {
    const { displayName: label, origin, value, modified } = props.attribute;

    const [ open, setOpen ] = React.useState(false);
    const [ code, setCode ] = React.useState<string>(value);

    const handleModalClose = () => {
        setOpen(false);
    }

    const handleModalSave = () => {
        if (props.onChange) {
            props.onChange(code, code !== origin);
        }
        setOpen(false);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target?.value;
        if (props.onChange) {
            props.onChange(input, input !== origin);
        }
    }

    return (
        <AttributeField label={label}>
            <Badge color="secondary" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
                <Button size="small" variant="outlined" onClick={() => setOpen(true)}>Edit...</Button>
            </Badge>
            <CustomModal open={open} onClose={handleModalClose}>
                <CustomModalContents>
                    <Box height="70vh" width="70vw">
                        <EditorWithNoSSR code={code} setModified={(value) => setCode(value)}/>
                    </Box>
                </CustomModalContents>
                <CustomModalAction>
                    <Button size="small" variant="contained" onClick={handleModalSave}>Save</Button>
                    <Button size="small" onClick={handleModalClose}>Cancel</Button>
                </CustomModalAction>
            </CustomModal>
        </AttributeField>
    )
}

export const customEditorMap: ComponentFactory = {
    ValueEditor: ValueEditorComponent,
    TargetPageEditor: TargetPageEditorComponent,
    TargetBlockEditor: TargetBlockEditorComponent,
    ScriptEditor: ScriptEditorComponent
}

export const ISACIVRAttributeViewer = (props: AttributeFieldProps) => {
    const { displayName: label, value } = props.attribute;
    return (
        <AttributeField label={label}>
            <TextField variant="standard" disabled multiline fullWidth value={value} />
        </AttributeField>
    )
}

export const StringEditor = (props: AttributeFieldProps) => {
    const { displayName: label, origin, value, description, modified } = props.attribute;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target?.value;
        if (props.onChange) {
            props.onChange(input, input !== origin);
        }
    }

    return (
        <AttributeField label={label} description={description}>
            <Badge color="secondary" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
                <TextField size="small" variant="standard" fullWidth
                    value={value} onChange={handleChange}
                />
            </Badge>
        </AttributeField>
    )
}

export const BooleanEditor = (props: AttributeFieldProps) => {
    const { displayName: label, origin, value, description, modified } = props.attribute;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target?.checked;
        if (props.onChange) {
            props.onChange(input, input !== origin);
        }
    };

    return (
        <Badge color="secondary" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
            <Stack direction="row" gap={1} alignItems="center">
                <Switch size="small" checked={value} onChange={handleChange} />
                <EllipsisLabel variant="subtitle2">{label}</EllipsisLabel>
                <Tooltip title={description}>
                    <HelpOutline fontSize="small" color="disabled" />
                </Tooltip>
            </Stack>
        </Badge>
    )
}

export const NumberEditor = (props: AttributeFieldProps) => {
    const { displayName: label, origin, value, description, modified } = props.attribute;
    const number = Number(value);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target?.value;
        if (props.onChange) {
            props.onChange(input, input !== origin);
        }
    }

    return (
        <AttributeField label={label} description={description}>
            <Badge color="secondary" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
                <TextField size="small" variant="standard" fullWidth type="number"
                    value={number} onChange={handleChange}
                />
            </Badge>
        </AttributeField>
    )
}

interface PredefinedItem {
    value: string;
    display: string;
}

export const PredefinedItemEditor = (props: {
    attribute: BlockFormProps,
    onChange?: (input: any, modified: boolean) => void
}) => {
    const { displayName: label, itemsSourceKey, description, origin, value, modified } = props.attribute;

    const meta = useDiagramMetaStore((state) => state.meta);

    const handleChange = (event: SelectChangeEvent<string>) => {
        const input = event.target?.value;
        if (props.onChange) {
            props.onChange(input, input !== origin);
        }
    }

    const renderItems = () => {
        if (meta && itemsSourceKey) {
            const itemSources: PredefinedItem[] = meta.itemSources[itemsSourceKey];

            return (
                <Select fullWidth variant="standard" value={value} onChange={handleChange}>
                    { itemSources.map((i) => <MenuItem key={i.value} value={i.value}>{i.display}</MenuItem>) }
                </Select>
            )
        }

        return <></>
    }
    
    return (
        <AttributeField label={label} description={description}>
            <Badge color="secondary" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
                { renderItems() }
            </Badge>
        </AttributeField>
    )
}