import { Box } from "@mui/material";
import React from "react";
import { Diagram, NodeWrapper } from "@/lib/diagram";
import "@/style/diagram.css";
import { useDiagramMetaStore } from "@/store/workspace-store";
import { BlockObjectType, FlowEditMode, FlowEditType, FlowEditState, useFlowEditState, useAttributePropsState, BlockCommonProps, BlockFormProps, useEditorTabState } from "@/store/flow-editor-store";

type SVGDiagramProps = {
    meta: object | undefined,
    pageName: string,
    xml: string,
    flowEditMode: FlowEditType,
    setFlowEditMode: (v: FlowEditType) => void,
    setBlockObject: (b: BlockObjectType | undefined) => void,
    setShow: (v: boolean) => void,
    setAttributeProps: (p1: BlockCommonProps, p2: Array<BlockFormProps>) => void,
    setTabModified: (name: string, xml: string) => void
}

export const SVGDiagramWithStore = (
    props: {
        pageName: string,
        xml: string
    }
) => {
    const meta = useDiagramMetaStore((state) => state.meta);

    const flowEditMode = useFlowEditState((state) => state.mode);
    const setFlowEditMode = useFlowEditState((state) => state.setMode);
    const setBlockObject = useFlowEditState((state) => state.setBlockObject);

    const setShow = useAttributePropsState((state) => state.setShow);
    const setAttributeProps = useAttributePropsState((state => state.setAttributeProps));

    const setTabModified = useEditorTabState((state) => state.setTabModified);

    return (
        <SVGDiagram meta={meta} pageName={props.pageName} xml={props.xml} 
            flowEditMode={flowEditMode} setFlowEditMode={setFlowEditMode} setBlockObject={setBlockObject}
            setShow={setShow} setAttributeProps={setAttributeProps} setTabModified={setTabModified}
        />
    )
}

class SVGDiagram extends React.Component<SVGDiagramProps> {
    diagram: any;
    _svg: SVGSVGElement | undefined;
    meta: any;
    pageName: string;
    xml: string;

    constructor(props: SVGDiagramProps | Readonly<SVGDiagramProps>) {
        super(props);
        this.diagram = undefined;
        this._svg = undefined;
        
        this.meta = props.meta;
        this.pageName = props.pageName;
        this.xml = props.xml;
    }

    componentDidMount = () => {
        const options = {
            useBackgroundPattern: true,
            onContextMenu: this.onContextMenu,
            onNodeCreated: this.onNodeCreated,
            onNodeSelected: this.onNodeSelected,
            onNodeUnSelected: this.onNodeUnSelected,
            moveUnit: 1,
            lineType: "B",
        }

        this.diagram = Diagram.deserialize(`#${this.pageName}`, this.meta, this.xml, options);
    }

    shouldComponentUpdate = (nextProps: Readonly<SVGDiagramProps>, nextState: Readonly<{}>, nextContext: any) => {
        switch (nextProps.flowEditMode.name) {
            case FlowEditMode.create:
                console.log("Set CreateMode");
                this.diagram.setCreateMode(nextProps.flowEditMode.target);
                break
            case FlowEditMode.build:
                console.log("Set BuildMode");
                const xml = Diagram.serialize(this.diagram);
                console.log(xml);
                break
            default:
                break
        }
        return false;
    }

    onContextMenu = () => {
        console.log("onContextMenu");
    }

    onNodeCreated = (block: any) => {
        const { metaName, userData } = block;
        console.log("onNodeCreated", block?.metaName, block?.userData);
        this.props.setFlowEditMode({ name: FlowEditMode.idle, target: undefined });
        if (metaName) {
            if (!userData) {
                const buildName = this.meta.nodes?.[metaName]?.buildTag;
                const properties = this.meta.nodes?.[metaName]?.properties;
                if (buildName && properties) {
                    const newUserData = new NodeWrapper(buildName);
                    properties.map((p: { buildName: string, defaultValue: string }) => {
                        newUserData.childAppend(p.buildName);
                        newUserData.childValue(p.buildName, p.defaultValue);
                    })
                    block.userData = newUserData.node;
                    const xml = Diagram.serialize(this.diagram);
                    this.props.setTabModified(this.pageName, xml);
                }
            } 
        }
    }

    onNodeSelected = (block: any) => {
        const { metaName, id, caption, userData } = block;
        console.log("onNodeSelected", metaName, id, caption, userData);
        if (metaName) {
            if (userData) {
                const blockMeta = metaName? this.meta.nodes?.[metaName] : undefined;
                if (blockMeta) {
                    const { isJumpable, properties } = blockMeta;
                    const wrapper = new NodeWrapper(userData);

                    const formList: Array<BlockFormProps> = []; 
                    properties.map((p: {
                        displayName: string, type: string, required: boolean, isProtected: boolean,
                        buildName: string, customEditorTypeName: string
                    }) => {
                        const value = wrapper.childValue(p.buildName);
                        const attributes = wrapper.child(p.buildName)?.attrs();
                        formList.push({ 
                            buildName: p.buildName,
                            displayName: p.displayName,
                            required: p.required,
                            isProtected: p.isProtected,
                            type: p.type,
                            customEditorTypeName: p.customEditorTypeName,
                            origin: value,
                            attributes: attributes? attributes : {},
                            forSave: "",
                            modified: false
                        });
                    });
                    this.props.setFlowEditMode({ name: FlowEditMode.edit, target: undefined });
                    this.props.setBlockObject({ metaName: metaName, id: id, description: caption, xml: userData });
                    this.props.setAttributeProps({
                        metaName: metaName,
                        id: id,
                        userComment: "",
                        isJumpable: isJumpable,
                    },
                    [ ...formList ])
                }
            }
        }
    }

    onNodeUnSelected = (block: any) => {
        console.log("onNodeUnSelected", block?.metaName, block?.userData);
        // this.props.setBlockObject(undefined);
        this.props.setFlowEditMode({ name: FlowEditMode.idle, target: undefined });
        this.props.setShow(false);
    }

    render = () => {
        let self = this;

        return (
            <Box sx={{ 
                    overflow: "hidden", 
                    width: "100%", height: "100%" 
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg"
                    // ref={(el) => {
                    //     if (el) {
                    //         self._svg = el;
                    //     }
                    // }}
                    id={this.pageName}
                    style={{
                        width: "100%",
                        //height: `calc(100vh - ${header_height} - ${editor_tab_height})`
                        height: "100%",
                    }}
                />
            </Box>
        )
    }
}