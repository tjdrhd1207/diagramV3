import { $ValueEditorColumns } from "@/consts/flow-editor";
import { Add } from "@mui/icons-material";
import { Box, Button, Stack } from "@mui/material";
import { GridRowModel, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { CustomDataGrid } from "../common/grid";
import React from "react";
import { NodeWrapper } from "@/lib/diagram";
import { randomId, randomUserName } from "@mui/x-data-grid-generator";
import { DiffEditor } from "@monaco-editor/react";


interface RowProps {
    id: string;
    type: string;
    name: string;
    initValue: any;
    description: string;
}

interface EditToolbarProps {
    handleAddVariable: (event : React.MouseEvent<HTMLButtonElement>) => void;
}

const EditToolbar = (props: EditToolbarProps) => {
    const { handleAddVariable } = props;

    // const handleAddVariable = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     setRows((oldRows) => [...oldRows, { id: randomId(), type: "", name: randomUserName().slice(1), initValue: "", description: "" }])
    // }

    return (
        <GridToolbarContainer sx={{ width: "100%" }}>
            <Stack direction="row" flex={1}>
                <Box sx={{ width: "100%" }}>
                    <Button color="secondary" startIcon={<Add />} onClick={handleAddVariable}>Add</Button>
                </Box>
                <GridToolbarQuickFilter fullWidth sx={{ width: "100%" }} />
            </Stack>
        </GridToolbarContainer>
    )
}

interface ISACIVRVarEditorProps {
    origin: string;
    variables: string;
    setModified: (value: string) => void;
}

export const ISACIVRVarEditor = (props: ISACIVRVarEditorProps) => {
    const { origin, variables, setModified } = props;
    const [rows, setRows ] = React.useState<Array<GridRowModel>>([]);

    React.useEffect(() => {
        if (variables) {
            console.log(variables);
        }
    }, [variables]);

    React.useEffect(() => {
        console.log(rows);
        setModified(getModifiedXML());
    }, [rows])

    const processRowUpdate = (newRow: GridRowModel) => {
        const updatedRow = { ...newRow };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleAddVariable = (event: React.MouseEvent<HTMLButtonElement>) => {
        setRows((oldRows) => [...oldRows, { id: randomId(), type: "", name: randomUserName().slice(1), initValue: "", description: "" }])
    };

    // <variables>
    //   <variable>
    //     <type>string</type>
    //     <name>input_digit</name>
    //     <init-value />
    //     <description />
    //   </variable>
    // </variables>

    const getModifiedXML = () => {
        const xml = NodeWrapper.parseFromXML(variables);
        rows.forEach((r) => {
            const row = r as RowProps;
            const children = xml.children("variable");
            const found = children.find((c) => c.child("name").value() === row.name);
            if (found) {
                found.child("type").value(row.type);
                found.child("init-value").value(row.initValue);
                found.child("description").value(row.description);
            } else {
                const child = xml.appendChild("variable");
                child.appendChild("type").value(row.type);
                child.appendChild("name").value(row.name);
                child.appendChild("init-value").value(row.initValue);
                child.appendChild("description").value(row.description);
            }
        })
        return xml.toString(false);
    }

    return (
        <Box height="100%" width="100%" >
            <Box height="70%" width="100%" padding={1}>
                <CustomDataGrid
                    columns={$ValueEditorColumns}
                    rows={rows}
                    getRowId={(row) => row.id}
                    density="compact"
                    customToolbar={EditToolbar}
                    customToolbarProps={{ handleAddVariable }}
                    processRowUpdate={processRowUpdate}
                    sx={{}}
                />
            </Box>
            <Box height="30%" padding={1}>
                <DiffEditor
                    original={origin} originalLanguage="xml"
                    modified={variables} modifiedLanguage="xml"
                />
            </Box>
        </Box>
    )
}