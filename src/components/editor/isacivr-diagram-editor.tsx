import { Box } from "@mui/material";
import React from "react";
import Diagram from "../../lib/diagram";
import "../diagram.css";
import { useDiagramMetaStore } from "@/store/workspace-store";
import { EDIT_MODE_NAMES, FlowEdtitState, useFlowEditState } from "@/store/flow-editor-store";
import { XMLParser } from "fast-xml-parser";

type SVGDiagramProps = {
    meta: object | undefined,
    pageName: string
    xml: string
    flowEditState: FlowEdtitState
}

export const SVGDiagramWithStore = (
    props: {
        pageName: string,
        xml: string
    }
) => {
    const meta = useDiagramMetaStore((state) => state.meta);

    return (
        <SVGDiagram meta={meta} pageName={props.pageName} xml={props.xml} flowEditState={useFlowEditState()}/>
    )
}

class SVGDiagram extends React.Component<SVGDiagramProps> {
    diagram: any;
    _svg: SVGSVGElement | undefined;
    meta: any;
    pageName: string;
    xml: string;
    flowEditState: FlowEdtitState;

    constructor(props: SVGDiagramProps | Readonly<SVGDiagramProps>) {
        super(props);
        this.diagram = undefined;
        this._svg = undefined;
        
        this.meta = props.meta;
        this.pageName = props.pageName;
        this.xml = props.xml;
        this.flowEditState = props.flowEditState;
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

        // this.diagram = Diagram.createEmpty(`#${this.pageName}`, this.meta, options);
        this.diagram = Diagram.deserialize(`#${this.pageName}`, this.meta, this.xml, options);
    }

    shouldComponentUpdate = (nextProps: Readonly<SVGDiagramProps>, nextState: Readonly<{}>, nextContext: any) => {
        switch (nextProps.flowEditState.mode.name) {
            case EDIT_MODE_NAMES.edit:
                console.log("Set CreateMode");
                this.diagram.setCreateMode(nextProps.flowEditState.mode.target);
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
        console.log(block?.userData);
        if (this.meta) {
            const blockMeta = this.meta.nodes?.[block?.metaName].properties;
            // console.log(blockMeta);
            const blockProps = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(block?.userData?.innerHTML);
            console.log("onNodeSelected", blockProps);
        }
    }

    onNodeUnSelected = (block: any) => {
        console.log("onNodeUnSelected", block);
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