import { GridColDef } from "@mui/x-data-grid";
import { XMLParser } from "fast-xml-parser";
import { QuickFilteredDataGrid } from "../common/grid";
import { ComponentFactory } from "../common/types";

const value_editor_columns: Array<GridColDef> = [
    { field: "type", headerName: "Type" },
    { field: "name", headerName: "Name" },
    { field: "init-value", headerName: "Init Value" },
    { field: "description", headerName: "Description" },
]

const ValueEditorComponent = (props: {
    xml: any
}) => {
    const variableObject = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(props.xml);
    const key = variableObject?.variables?.key;
    const variables = variableObject?.variables?.variable;
    return (
        <QuickFilteredDataGrid
            columns={value_editor_columns}
            rows={variables}
            getRowId={(row) => row.name}
        />
        // <TreeView 
        //     // expanded={[key]}
        //     defaultExpanded={[ key ]}
        //     defaultCollapseIcon={<ExpandMore />} defaultExpandIcon={<ChevronRight />}
        // >
        //     {
        //         key && <TreeItem key={key} nodeId={key} label={key}>
        //             {
        //                 variables && Array.isArray(variables)?
        //                 variables.map((v) => 
        //                     <TreeItem key={v.name} nodeId={v.name} label={v.name}>
        //                         <TextField size="small" margin="dense" variant="standard"/>
        //                     </TreeItem>
        //                 ) 
        //                 : <TreeItem key={variables.name} nodeId={variables.name} label={variables.name}/>
        //             }
        //         </TreeItem>
        //     }
        // </TreeView>
    )
}

export const customEditorMap: ComponentFactory = {
    ValueEditor: ValueEditorComponent,
}