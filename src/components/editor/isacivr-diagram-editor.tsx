import { Box } from "@mui/material";
import React from "react";
import Diagram from "../../lib/diagram";
import "../diagram.css";
import { useDiagramMetaStore } from "@/store/workspace-store";
import { BlockObjectType, FlowEditMode, FlowEditType, FlowEdtitState, useFlowEditState } from "@/store/flow-editor-store";

type SVGDiagramProps = {
    meta: object | undefined,
    pageName: string,
    xml: string,
    flowEditMode: FlowEditType,
    setFlowEditMode: (v: FlowEditType) => void,
    blockObject: BlockObjectType | undefined,
    setBlockObject: (b: BlockObjectType | undefined) => void
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
    const blockObject = useFlowEditState((state) => state.blockObject);
    const setBlockObject = useFlowEditState((state) => state.setBlockObject);

    return (
        <SVGDiagram meta={meta} pageName={props.pageName} xml={props.xml} 
            flowEditMode={flowEditMode} setFlowEditMode={setFlowEditMode}
            blockObject={blockObject} setBlockObject={setBlockObject}
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
            default:
                break
        }
        return false;
    }

    onContextMenu = () => {
        console.log("onContextMenu");
    }

    onNodeCreated = (block: any) => {
        console.log("onNodeCreated", block);
    }

    onNodeSelected = (block: any) => {
        console.log("onNodeSelected", block?.metaName, block?.userData);
        this.props.setBlockObject({ metaName: block?.metaName, id: block?.id, description: block?.caption, xml: block?.userData });
        this.props.setFlowEditMode({ name: FlowEditMode.edit, target: undefined });
    }

    onNodeUnSelected = (block: any) => {
        console.log("onNodeUnSelected", block?.metaName, block?.userData);
        this.props.setBlockObject(undefined);
        this.props.setFlowEditMode({ name: FlowEditMode.idle, target: undefined });
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