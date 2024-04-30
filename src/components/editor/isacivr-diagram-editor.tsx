"use client"

import { Box, Button, Fade, Menu, MenuItem, TextField } from "@mui/material";
import React from "react";
import { Diagram, KeyActionNames, NodeWrapper } from "@/lib/diagram";
import "@/style/diagram.css";
import { useDiagramMetaStore } from "@/store/workspace-store";
import { BlockObjectType, FlowEditMode, FlowEditType, FlowEditState, useFlowEditState, useBlockAttributeState, BlockCommonAttributes, BlockSpecificAttributes, useEditorTabState } from "@/store/flow-editor-store";
import { MenuPosition } from "@/store/_interfaces";
import { CustomModal, CustomModalAction, CustomModalContents } from "../common/modal";
import { create } from "zustand";
import { FormText } from "../common/form";
import { randomUUID } from "crypto";

interface SVGDiagramProps {
    meta: object | undefined;
    pageName: string;
    xml: string;
    flowEditMode: FlowEditType | undefined;
    setIdleMode: (targetPage: string) => void;
    setUserData?: (b: NodeWrapper | undefined) => void;
    setShow?: (v: boolean) => void;
    setBlockAttributes?: (p1: BlockCommonAttributes, p2: Array<BlockSpecificAttributes>) => void;
    setAttributes: (userData: NodeWrapper, commonAttributes: BlockCommonAttributes, 
        specificAttributes: BlockSpecificAttributes[]) => void;
    cleanAttribute: () => void;
    setTabModified: (name: string, xml: string) => void;
    showChoiceMenu: (value: MenuPosition) => void;
    setChoices: (value: string[]) => void;
    setChoiceCallback: (callback: (choice: string | null) => void) => void;
    showDescEditor: () => void;
    setDesc: (value: string) => void;
    setDescCallback: (callback: (choice: string | null) => void) => void;
}

interface ChoiceMenuState {
    position: MenuPosition | undefined;
    show: (value: MenuPosition) => void;
    close: () => void;
    choices: Array<string>;
    setChoices: (value: Array<string>) => void;
    callback: (choice: string | null) => void;
    setCallback: (callback: (choice: string | null) => void) => void;
}

const useChoiceMenuState = create<ChoiceMenuState>((set) => ({
    position: undefined,
    show: (value: MenuPosition) => set({ position: value }),
    close: () => set({ position: undefined }),
    choices: [ "ok", "error", "timeout", "no-next" ],
    setChoices: (value) => set({ choices: value }),
    callback: (choice) => {},
    setCallback: (callback) => set({ callback: callback })
}));

const LinkChoiceMenu = () => {
    const position = useChoiceMenuState((state) => state.position);
    const close = useChoiceMenuState((state) => state.close);
    const choices = useChoiceMenuState((state) => state.choices);
    const callback = useChoiceMenuState((state) => state.callback);

    const handleOnClick = (choice: string) => {
        callback(choice);
        close();
    }

    const handleClose = () => {
        callback(null);
        close();
    }

    return (
        <Menu open={position !== undefined} onClose={handleClose}
            anchorReference="anchorPosition" 
            anchorPosition={position !== undefined? { top: position.mouseY, left: position.mouseX} : undefined}
            sx={{ opacity: 0.8 }}
        >
            {
                choices.map((l) => 
                    <MenuItem dense key={l} onClick={() => handleOnClick(l)}>{l}</MenuItem>
                )
            }
        </Menu>
    )
}

interface BlockDescEditorState {
    open: boolean;
    show: () => void;
    close: () => void;
    description: string;
    onChange: (value: string) => void;
    callback: (value: string | null) => void;
    setCallback: (callback: (value: string | null) => void) => void;
}

const _useBlockDescEditorState = create<BlockDescEditorState>((set) => ({
    open: false,
    show: () => set({ open: true }),
    close: () => set({ open: false }),
    description: "",
    onChange: (value) => set({ description: value }),
    callback: (value) => {},
    setCallback: (callback) => set({ callback: callback })
}))

const BlockDescEditor = () => {
    const open = _useBlockDescEditorState((state) => state.open);
    const close = _useBlockDescEditorState((state) => state.close);
    const description = _useBlockDescEditorState((state) => state.description);
    const onChange = _useBlockDescEditorState((state) => state.onChange);
    const callback = _useBlockDescEditorState((state) => state.callback);

    const handleSave = () => {
        callback(description);
        close();
    }

    const handleClose = () => {
        callback(null);
        close();
    }

    return (
        <CustomModal open={open} onClose={handleClose}>
            <CustomModalContents>
                <FormText autoFocus={true} disabled={false} formTitle="Description" formValue={description} onFormChanged={onChange} />
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" onClick={handleSave}>OK</Button>
                <Button size="small" onClick={handleClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}

export const SVGDiagramWithStore = (
    props: {
        pageName: string,
        xml: string
    }
) => {
    const { pageName, xml } = props;
    const meta = useDiagramMetaStore((state) => state.meta);

    const flowEditModes = useFlowEditState((state) => state.states);
    const flowEditMode = flowEditModes.find((m) => m.targetPage === pageName);
    const setIdleMode = useFlowEditState((state) => state.setIdleMode);
    
    const _setAttributes = useBlockAttributeState((state) => state.setAttributes);
    const setAttributes = (userData: NodeWrapper, commonAttributes: BlockCommonAttributes, 
        specificAttributes: BlockSpecificAttributes[]) => _setAttributes(pageName, userData, commonAttributes, specificAttributes);
    const _cleanAttribute = useBlockAttributeState((state) => state.cleanAttribute);
    const cleanAttribute = () => _cleanAttribute(pageName);

    const setTabModified = useEditorTabState((state) => state.setTabModified);

    const showChoiceMenu = useChoiceMenuState((state) => state.show);
    const setChoices = useChoiceMenuState((state) => state.setChoices);
    const setChoiceCallback = useChoiceMenuState((state) => state.setCallback);

    const showDescEditor = _useBlockDescEditorState((state) => state.show);
    const setDesc = _useBlockDescEditorState((state) => state.onChange);
    const setDescCallback = _useBlockDescEditorState((state) => state.setCallback);

    return (
        <>
            <SVGDiagram meta={meta} pageName={pageName} xml={xml} 
                flowEditMode={flowEditMode} setIdleMode={setIdleMode} setTabModified={setTabModified}
                setAttributes={setAttributes} cleanAttribute={cleanAttribute}
                showChoiceMenu={showChoiceMenu} setChoices={setChoices} setChoiceCallback={setChoiceCallback}
                showDescEditor={showDescEditor} setDesc={setDesc} setDescCallback={setDescCallback}
            />
            <LinkChoiceMenu />
            <BlockDescEditor />
        </>
    )
}

class SVGDiagram extends React.Component<SVGDiagramProps> {
    diagram: any;
    _svg: SVGSVGElement | undefined;
    meta: any;
    pageName: string;
    svgSelector: string;
    xml: string;

    constructor(props: SVGDiagramProps | Readonly<SVGDiagramProps>) {
        super(props);
        this.diagram = undefined;
        this._svg = undefined;
        
        this.meta = props.meta;
        this.pageName = props.pageName;
        const lastDot = this.pageName.lastIndexOf(".");
        if (lastDot === -1) {
            this.svgSelector = this.pageName;
        } else {
            this.svgSelector = this.pageName.substring(0, lastDot);
        }

        this.xml = props.xml;
    }

    componentDidMount = () => {
        console.log("componentDidMount", this.pageName);
        const options = {
            useBackgroundPattern: true,
            onContextMenu: this.onContextMenu,
            onNodeCreated: this.onNodeCreated,
            onNodeSelected: this.onNodeSelected,
            onNodeUnSelected: this.onNodeUnSelected,
            onDiagramModified: this.onDiagramModified,
            onLinkCreating: this.onLinkCreating,
            onNodeModifyingCaption: this.onNodeModifyingCaption,
            moveUnit: 1,
            lineType: "B",
            keyActions: {
                [KeyActionNames.GrabAndZoom]: [" "]
            }
        }

        if (!this.diagram) {
            this.diagram = Diagram.deserialize(`#${this.svgSelector}`, this.meta, this.xml, options);
        }
    }

    shouldComponentUpdate = (nextProps: Readonly<SVGDiagramProps>, nextState: Readonly<{}>, nextContext: any) => {
        if (nextProps.flowEditMode) {
            if (this.pageName === nextProps.flowEditMode.targetPage)
            switch (nextProps.flowEditMode.mode) {
                case FlowEditMode.create:
                    console.log("Set CreateMode");
                    this.diagram.setCreateMode(nextProps.flowEditMode.targetBlock);
                    break
                case FlowEditMode.build:
                    console.log("Set BuildMode");
                    const xml = Diagram.serialize(this.diagram);
                    this.props.setTabModified(this.pageName, xml);
                    this.props.setIdleMode(this.pageName);
                    break
                default:
                    break
            }
        }
        return false;
    }

    onContextMenu = () => {
        console.log("onContextMenu");
    }

    onNodeCreated = (block: any) => {
        const { metaName, userData } = block;
        console.log("onNodeCreated", metaName, userData);
        this.props.setIdleMode(this.pageName);
        if (metaName) {
            if (!userData) {
                const buildName = this.meta.nodes?.[metaName]?.buildTag;
                const properties = this.meta.nodes?.[metaName]?.properties;
                if (buildName && properties) {
                    const newUserData = new NodeWrapper(buildName);
                    properties.map((p: { buildName: string, defaultValue: string }) => {
                        if (p.buildName) {
                            newUserData.appendChild(p.buildName);
                            newUserData.child(p.buildName).value(p.defaultValue);
                        }
                    })
                    block.userData = newUserData;
                    const xml = Diagram.serialize(this.diagram);
                    this.props.setTabModified(this.pageName, xml);
                }
            } 
        }
    }

    onDiagramModified = (target: any, eventType: string) => {
        console.log("onDiagramModified", target, eventType);
        // const xml = Diagram.serialize(this.diagram);
        // this.props.setTabModified(this.pageName, xml);
    }

    onLinkCreating = (block: any, event: MouseEvent, onSelectCallback: any) => {
        const { metaName, links: svgLinks } = block;
        const { links } = this.meta.nodes?.[metaName];
        const choices = links.map((l: any) => l.name);
        console.log("onLinkCreating", block, choices);
        this.props.setChoices(choices);
        this.props.setChoiceCallback((choice) => onSelectCallback(choice));
        this.props.showChoiceMenu({ mouseX: event.clientX - 2, mouseY: event.clientY + 6 })
    }

    onNodeSelected = (block: any) => {
        const { metaName, id, comment, userData } = block;
        console.log("onNodeSelected", metaName, id, comment, userData);
        if (metaName) {
            if (userData) {
                const blockMeta = metaName? this.meta.nodes?.[metaName] : undefined;
                if (blockMeta) {
                    const { isJumpable, properties } = blockMeta;

                    const formList: Array<BlockSpecificAttributes> = []; 
                    properties.map((p: {
                        displayName: string, type: string, required: boolean, isProtected: boolean,
                        buildName: string, customEditorTypeName: string, itemsSourceKey: string,
                        description: string
                    }) => {
                        let value = "[Unknown]";
                        switch (p.type) {
                            case "Boolean":
                                value = userData.child(p.buildName).valueAsBoolean();
                                break;
                            case "Number":
                                value = userData.child(p.buildName).valueAsInt();
                                break;
                            default:
                                value = userData.child(p.buildName).value();
                        }
                        const attributes = userData.child(p.buildName)?.attrs();
                        formList.push({ 
                            displayName: p.displayName,
                            type: p.type,
                            buildName: p.buildName,
                            required: p.required,
                            isProtected: p.isProtected,
                            customEditorTypeName: p.customEditorTypeName,
                            itemsSourceKey: p.itemsSourceKey,
                            description: p.description,
                            origin: value,
                            value: value,
                            attributes: attributes? attributes : {},
                            modified: false
                        });
                    });
                    this.props.setAttributes(userData, { metaName: metaName, id: id, userComment: "", isJumpable: isJumpable }, [ ...formList ])
                }
            }
        }
    }

    onNodeModifyingCaption = (block: any, value: string, onNewValueCallback: any) => {
        console.log("onNodeModifyingDesc", block, value);
        this.props.setDesc(value);
        this.props.setDescCallback((value) => onNewValueCallback(value));
        this.props.showDescEditor();
    }

    onNodeUnSelected = (block: any) => {
        console.log("onNodeUnSelected", block?.metaName, block?.userData);
        this.props.cleanAttribute();
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
                    id={this.svgSelector}
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