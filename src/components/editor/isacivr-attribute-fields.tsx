import { GridColDef, GridRenderEditCellParams, GridToolbarContainer, GridToolbarFilterButton, GridToolbarQuickFilter, useGridApiContext } from "@mui/x-data-grid";
import { XMLParser } from "fast-xml-parser";
import { QuickFilteredDataGrid } from "../common/grid";
import { ComponentFactory } from "../common/types";
import { Autocomplete, Badge, Box, Button, Checkbox, Grid, IconButton, Input, MenuItem, Select, SelectChangeEvent, Stack, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import { ExpandMore, ChevronRight, Add } from "@mui/icons-material";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import { NodeWrapper } from "@/lib/node-wrapper";
import { useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";
import { EllipsisLabel } from "../common/typhography";
import { useEditorTabState } from "@/store/flow-editor-store";

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
        children: React.ReactNode
}) => {
    return (
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1}} height="100%" alignItems="center">
        <Grid item xs={4}>
            <EllipsisLabel variant="subtitle2" width="100%">{props.label} : </EllipsisLabel>
        </Grid>
        <Grid item xs={8}>
            {props.children}
        </Grid>
    </Grid>
    )
}

interface AttributeFieldProps {
    label: string;
    xml?: NodeWrapper;
}

const value_editor_columns: Array<GridColDef> = [
    {
        field: "type", headerName: "Type", headerAlign: "center", align: "center", flex: 0.1, editable: true,
        type: "singleSelect",
        valueOptions: [
            { label: "String", value: "string" },
            { label: "Boolean", value: "boolean" },
            { label: "Int64", value: "int64" },
        ]
    },
    { field: "name", headerName: "Name", headerAlign: "center", align: "center", flex: 0.2, editable: true },
    { field: "init-value", headerName: "Init", headerAlign: "center", align: "center", flex: 0.1, editable: true },
    { field: "description", headerName: "Description", headerAlign: "center", flex: 0.3, editable: true },
]

const ValueEditorComponent = (props: AttributeFieldProps) => {
    const xmlStrng = props.xml?.toString();
    const variableObject = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(xmlStrng);
    const key = variableObject?.variables?.key;
    const variables = variableObject?.variables?.variable;
    return (
        <Stack sx={{ width: "100%", height: "100%" }}>
            <EllipsisLabel variant="subtitle2">{props.label}</EllipsisLabel>
            <QuickFilteredDataGrid
                columns={value_editor_columns}
                rows={Array.isArray(variables)? variables: []}
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
    const scenarioPages = useProjectStore((state) => state.scenarioPages);
    
    const tab = useEditorTabState((state) => state.tab);
    
    const initValue = props.xml?.value(undefined);
    const [ input, setInput ] = React.useState<string>(String(initValue));

    const handleChange = (event: SelectChangeEvent<string>) => {
        const value = event.target?.value;
        if (value) {
            setInput(value);
        }
    }
    
    return (
        <AttributeField label={props.label}>
            <Select fullWidth variant="standard" value={input} onChange={handleChange}>
                <MenuItem value={tab}>{"<Current Page>"}</MenuItem>
                {scenarioPages.length !== 0 && scenarioPages.filter((p) => p.name !== tab).map((p) => 
                    <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
                )}
            </Select>
        </AttributeField>
    )
}

export const TargetBlockEditorComponent = (props: AttributeFieldProps) => {
    const tab = useEditorTabState((state) => state.tab);
    const tabs = useEditorTabState((state) => state.tabs);

    const jumpableTagNames = useDiagramMetaStore((state) => state.jumpableTagNames);

    const targetblockList: Array<{ id: string, desc: string }> = []
    tabs.map((t) => {
        if (t.name === tab) {
            const pageObject = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(t.contents);
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

    const initValue = props.xml?.value(undefined);
    const [ input, setInput ] = React.useState<string>(String(initValue));

    const handleChange = (event: SelectChangeEvent<string>) => {
        const value = event.target?.value;
        if (value) {
            console.log(value);
            setInput(value);
        }
    }

    return (
        <AttributeField label={props.label}>
            <Select fullWidth variant="standard" value={input} onChange={handleChange}>
                <MenuItem value=""></MenuItem>
                {
                    targetblockList.length !== 0 && targetblockList.map((t) => 
                        <MenuItem key={t.id} value={t.id}>{`${t.id} ${t.desc}`}</MenuItem>
                    )
                }
            </Select>
        </AttributeField>
    )
}

export const customEditorMap: ComponentFactory = {
    ValueEditor: ValueEditorComponent,
    TargetPageEditor: TargetPageEditorComponent,
    TargetBlockEditor: TargetBlockEditorComponent
}

export const ISACIVRAttributeViewer = (props: AttributeFieldProps) => {
    const xmlString = props.xml?.toString()
    console.log(xmlString);
    return (
        <AttributeField label={props.label}>
            <TextField variant="standard" disabled multiline fullWidth value={xmlString} />
        </AttributeField>
    )
}

export const StringEditor = (props: AttributeFieldProps) => {
    const initValue = props.xml?.value(undefined);
    const [ input, setInput ] = React.useState<string>(initValue);
    const [ modified, setModified ] = React.useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target?.value;
        setModified(value !== initValue);
        setInput(value);
    }

    React.useEffect(() => {
        const updated = props.xml?.value(undefined);
        setInput(updated);
    }, [props]);

    return (
        <AttributeField label={props.label}>
            <Badge color="success" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
                <TextField size="small" variant="standard" fullWidth
                    value={input} onChange={handleChange}
                />
            </Badge>
        </AttributeField>
    )
}

export const BooleanEditor = (props: AttributeFieldProps) => {
    const initValue = props.xml?.value(undefined);
    const [checked, setChecked] = React.useState(Boolean(initValue));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
    };

    React.useEffect(() => {
        const updated = props.xml?.value(undefined);
        console.log(Boolean(updated));
        setChecked(Boolean(updated));
    }, [props]);

    return (
        <Stack direction="row" gap={1} alignItems="center">
            <Switch size="small" checked={checked} onChange={handleChange} />
            <EllipsisLabel variant="subtitle2">{props.label}</EllipsisLabel>
        </Stack>
        
    )
}

export const NumberEditor = (props: AttributeFieldProps) => {
    const initValue = props.xml?.value(undefined);
    const [ input, setInput ] = React.useState<number>(initValue);
    const [ modified, setModified ] = React.useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target?.value;
        console.log(value);
        setModified(value !== initValue);
        setInput(Number(value));
    }

    React.useEffect(() => {
        const updated = props.xml?.value(undefined);
        setInput(updated);
    }, [props]);

    return (
        <AttributeField label={props.label}>
            <Badge color="success" variant="dot" sx={{ width: "100%" }} invisible={!modified}>
                <TextField size="small" variant="standard" fullWidth type="number" value={input} onChange={handleChange} />
            </Badge>
    </AttributeField>
    )
}