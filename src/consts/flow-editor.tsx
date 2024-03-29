import { GridColDef } from "@mui/x-data-grid";

export const $ScenarioPages_Tag = "scenario-pages";
export const $Page_Tag = "page";
export const $Page_Attribute_name = "name";
export const $Page_Attribute_start = "start";
export const $Page_Attribute_tag = "tag";

export const $Functions_Tab = "@Functions";
export const $Variables_Tab = "@Variables";
export const $Interface_Tab = "@Interface";

/**
 * <functions><![CDATA[]]></functions>
 */
export const $Functions_Tag = "functions";

/**
 * <variables key="app">
 *   <variable> ==> list
 *     <type/>*
 *     <name/>*
 *     <init-value/>
 *     <description/>
 *   </variable>
 * </variables>
 */
export const $Variables_Tag = "variables";
export const $Variables_Attribute_Key = "key";
export const $Variable_Tag = "variable";
export const $Variable_Type_Tag = "type";
export const $Variable_Name_Tag = "name";
export const $Variable_InitValue_Tag = "init-value";
export const $Variable_Description_Tag = "description";

/**
 * <interface>
 *   <use-trim>false</use-trim>
 *   <message> ==> list
 *     <code/>*
 *     <name/>*
 *     <variables-fixed>
 *       <variable> ==> list
 *         <mode/>* ==> tx, rx, both
 *         <type/>* ==> V : Varable, C : Constant , S : Space
 *         <value/> ==> *type: V or C
 *         <sort/> ==> L, R
 *         <replace/> ==> " ", 0
 *         <position/>*
 *         <length/>*
 *         <description/>
 *       </variable>
 *     </variables-fixed>
 *     <variables-iterative>
 *       <variable> ==> list
 *         <mode/>
 *         <type/>
 *         <value/>
 *         <sort/>
 *         <replace/>
 *         <position/>
 *         <length/>
 *         <description/>
 *       </variable>
 *     </variables-iterative>
 *   </message>
 * </interface>
 */
export const $Interface_Tag = "interface";
export const $Interface_UseTrim_Tag = "use-trim";
export const $Message_Tag = "message";
export const $Message_Code_Tag = "code";
export const $Message_Name_Tag = "name";


export const $ValueEditorColumns: Array<GridColDef> = [
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
    { field: "initValue", headerName: "Init", headerAlign: "center", align: "center", flex: 0.1, editable: true },
    { field: "description", headerName: "Description", headerAlign: "center", flex: 0.3, editable: true },
]