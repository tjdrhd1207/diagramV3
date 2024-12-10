"use client"

import { Box, Button, Fade, Menu, MenuItem, TextField } from "@mui/material";
import React from "react";
import { Diagram, KeyActionNames, ModifyEventTypes, NodeWrapper } from "@/lib/diagram";
import "@/style/diagram.css";
import { useDiagramMetaStore } from "@/store/workspace-store";
import { BlockObjectType, FlowEditMode, FlowEditType, FlowEditState, useFlowEditState, useBlockAttributeState, BlockCommonAttributes, BlockSpecificAttributes, useEditorTabState, EditorTabItem } from "@/store/flow-editor-store";
import { MenuPosition } from "@/store/_interfaces";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal";
import { create } from "zustand";
import { FormText } from "../common/form";
import _ from "lodash";

interface SVGDiagramProps {
    meta: object | undefined;
    flowName: string;
    xml: string;
    tabState: EditorTabItem | undefined;
    flowEditMode: FlowEditType | undefined;
    setIdleMode: (targetFlow: string) => void;
    setUserData?: (b: NodeWrapper | undefined) => void;
    setShow?: (v: boolean) => void;
    setBlockAttributes?: (p1: BlockCommonAttributes, p2: Array<BlockSpecificAttributes>) => void;
    setAttributes: (userData: NodeWrapper, commonAttributes: BlockCommonAttributes, 
        specificAttributes: BlockSpecificAttributes[]) => void;
    cleanAttribute: () => void;
    setTabModified: (name: string, xml: string) => void;
    showChoiceMenu: (value: MenuPosition) => void;
    setChoices: (choices: string[], connected: string[]) => void;
    setChoiceCallback: (callback: (choice: string | null) => void) => void;
    setOpenDescriptionEditDialog: (open: boolean, description?: string | undefined, callback?: (value: string | null) => void | undefined) => void;
}

interface ChoiceMenuState {
    position: MenuPosition | undefined;
    show: (value: MenuPosition) => void;
    close: () => void;
    choices: string[];
    connected: string[];
    setChoices: (choices: string[], connected: string[]) => void;
    callback: (choice: string | null) => void;
    setCallback: (callback: (choice: string | null) => void) => void;
}

const _useChoiceMenuState = create<ChoiceMenuState>((set) => ({
    position: undefined,
    show: (value: MenuPosition) => set({ position: value }),
    close: () => set({ position: undefined }),
    choices: [],
    connected: [],
    setChoices: (choices, connected) => set({ choices, connected }),
    callback: (choice) => {},
    setCallback: (callback) => set({ callback: callback })
}));

const LinkChoiceMenu = () => {
    const position = _useChoiceMenuState((state) => state.position);
    const close = _useChoiceMenuState((state) => state.close);
    const choices = _useChoiceMenuState((state) => state.choices);
    const callback = _useChoiceMenuState((state) => state.callback);

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
        >
            {
                choices.map((choice) => 
                    <MenuItem dense key={choice} onClick={() => handleOnClick(choice)}>{choice}</MenuItem>
                )
            }
        </Menu>
    )
}

interface DescriptionEditDialogState {
    open: boolean;
    setOpen: (open: boolean, description?: string, callback?: (value: string | null) => void) => void;
    description: string;
    onChange: (value: string) => void;
    callback: (value: string | null) => void | undefined;
    setCallback: (callback: (value: string | null) => void) => void;
}

const _useDescriptionEditDialogStore = create<DescriptionEditDialogState>((set) => ({
    open: false,
    setOpen: (open, description, callback) => set({ 
        open: open, description: description? description : "", callback: callback? callback : undefined
    }),
    description: "",
    onChange: (value) => set({ description: value }),
    callback: (value) => {},
    setCallback: (callback) => set({ callback: callback })
}))

const BlockDescriptionEditDialog = () => {
    const open = _useDescriptionEditDialogStore((state) => state.open);
    const setOpen = _useDescriptionEditDialogStore((state) => state.setOpen);
    const description = _useDescriptionEditDialogStore((state) => state.description);
    const onChange = _useDescriptionEditDialogStore((state) => state.onChange);
    const callback = _useDescriptionEditDialogStore((state) => state.callback);

    const handleSave = () => {
        callback(description);
        setOpen(false);
    }

    const handleClose = () => {
        callback(null);
        setOpen(false);
    }

    return (
        <CustomModal open={open} onClose={handleClose}>
            <CustomModalTitle title="Edit Block Description"/>
            <CustomModalContents>
                <FormText
                    autoFocus={true} disabled={false} formTitle="Description" multiline
                    formValue={description} onFormChanged={onChange}
                />
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" onClick={handleSave}>Save</Button>
                <Button size="small" onClick={handleClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}

export const SVGDiagramWithStore = (
    props: {
        flowName: string,
        xml: string
    }
) => {
    const { flowName, xml } = props;
    const meta = useDiagramMetaStore((state) => state.meta);

    const flowEditModes = useFlowEditState((state) => state.states);
    const flowEditMode = flowEditModes.find((m) => m.targetFlow === flowName);
    const setIdleMode = useFlowEditState((state) => state.setIdleMode);
    const setBuildMode = useFlowEditState((state) => state.setBuildMode);

    const _setAttributes = useBlockAttributeState((state) => state.setAttributes);
    const setAttributes = (userData: NodeWrapper, commonAttributes: BlockCommonAttributes, 
        specificAttributes: BlockSpecificAttributes[]) => _setAttributes(flowName, userData, commonAttributes, specificAttributes);
    const _cleanAttribute = useBlockAttributeState((state) => state.cleanAttribute);
    const cleanAttribute = () => _cleanAttribute(flowName);

    const tabs = useEditorTabState((state) => state.tabs);
    const setTabModified = useEditorTabState((state) => state.setTabModified);

    const showChoiceMenu = _useChoiceMenuState((state) => state.show);
    const setChoices = _useChoiceMenuState((state) => state.setChoices);
    const setChoiceCallback = _useChoiceMenuState((state) => state.setCallback);

    const setOpenDescriptionEditDialog = _useDescriptionEditDialogStore((state) => state.setOpen);

    React.useEffect(() => {
        // const handleKeyDown = (event: KeyboardEvent) => {
        //     if (event.ctrlKey) {
        //         console.log('Key pressed:', event.key);
        //         event.stopPropagation();
        //     }
        // };

        // document.addEventListener('keydown', handleKeyDown);
        // const timer = setInterval(() => {
        //     setBuildMode(flowName);
        // }, 1000);

        return () => {
            // document.removeEventListener('keydown', handleKeyDown);
            // clearInterval(timer);
        }
    }, []);

    return (
        <>
            <SVGDiagram meta={meta} flowName={flowName} xml={xml} tabState={tabs.find((t) => t.name === flowName)}
                flowEditMode={flowEditMode} setIdleMode={setIdleMode} setTabModified={setTabModified}
                setAttributes={setAttributes} cleanAttribute={cleanAttribute}
                showChoiceMenu={showChoiceMenu} setChoices={setChoices} setChoiceCallback={setChoiceCallback}
                setOpenDescriptionEditDialog={setOpenDescriptionEditDialog}
            />
            <LinkChoiceMenu />
            <BlockDescriptionEditDialog />
        </>
    )
}

class SVGDiagram extends React.Component<SVGDiagramProps> {
    diagram: any;
    _svg: SVGSVGElement | undefined;
    meta: any;
    flowName: string;
    svgSelector: string;
    xml: string;

    constructor(props: SVGDiagramProps | Readonly<SVGDiagramProps>) {
        super(props);
        this.diagram = undefined;
        this._svg = undefined;
        
        this.meta = props.meta;
        this.flowName = props.flowName;
        const lastDot = this.flowName.lastIndexOf(".");
        if (lastDot === -1) {
            this.svgSelector = this.flowName;
        } else {
            this.svgSelector = this.flowName.substring(0, lastDot);
        }

        this.xml = props.xml;
    }

    componentDidMount = () => {
        console.log("componentDidMount", this.flowName);
        const options = {
            useBackgroundPattern: true,
            onContextMenu: this.onContextMenu,
            onNodeCreated: this.onNodeCreated,
            onNodeSelected: this.onNodeSelected,
            onNodeUnSelected: this.onNodeUnSelected,
            onDiagramModified: this.onDiagramModified,
            onLinkCreating: this.onLinkCreating,
            onNodeModifyingCaption: this.onNodeModifyingCaption,
            onNodeModifyingComment: this.onNodeModifyingComment,
            moveUnit: 1,
            lineType: "Normal",
            keyActions: {
                [KeyActionNames.GrabAndZoom]: [" "]
            },
            debugMode: false
        }

        if (!this.diagram) {
            this.diagram = Diagram.deserialize(`#${this.svgSelector}`, this.meta, this.xml, options);
        }
    }

    shouldComponentUpdate = (nextProps: Readonly<SVGDiagramProps>, nextState: Readonly<{}>, nextContext: any) => {
        if (nextProps.flowEditMode) {
            if (this.flowName === nextProps.flowEditMode.targetFlow) {
                switch (nextProps.flowEditMode.mode) {
                    case FlowEditMode.create:
                        console.log(this.flowName, "Set CreateMode");
                        this.diagram.setCreateMode(nextProps.flowEditMode.targetBlock);
                        break;
                    case FlowEditMode.build:
                        console.log(this.flowName, "Set BuildMode");
                        const xml = Diagram.serialize(this.diagram);
                        this.props.setTabModified(this.flowName, xml);
                        this.props.setIdleMode(this.flowName);
                        break;
                    case FlowEditMode.focus:
                        console.log(this.flowName, "Set FocusMode");
                        const { targetBlock } = nextProps.flowEditMode;
                        console.log(targetBlock);
                        this.diagram.focusNode(targetBlock);
                        this.props.setIdleMode(this.flowName);
                        break;
                    default:
                        break;
                }
            }
        }
        return false;
    }

    onContextMenu = (event: any, element: any) => {
        console.log("onContextMenu", event, element);
    }

    onNodeCreated = (block: any) => {
        const { metaName, userData } = block;
        console.log("onNodeCreated", metaName, userData);
        this.props.setIdleMode(this.flowName);
        if (metaName) {
            if (!userData) {
                const buildTag = this.meta.nodes?.[metaName]?.buildTag;
                const properties = this.meta.nodes?.[metaName]?.properties;
                if (buildTag && properties) {
                    const newUserData = new NodeWrapper(buildTag);
                    properties.map((p: { buildName: string, defaultValue: string }) => {
                        if (p.buildName) {
                            newUserData.appendChild(p.buildName);
                            newUserData.child(p.buildName).value(p.defaultValue);
                        }
                    })
                    block.userData = newUserData;
                    const xml = Diagram.serialize(this.diagram);
                    this.props.setTabModified(this.flowName, xml);
                }
            } 
        }
    }

    onDiagramModified = (target: any, eventType: string) => {
        console.log("onDiagramModified", target, eventType);

        if (eventType === ModifyEventTypes.MemoAdded) {
            this.props.setIdleMode(this.flowName);
        }

        if (eventType === ModifyEventTypes.LinkAdded || eventType === ModifyEventTypes.LinkRemoved ||
            eventType === ModifyEventTypes.NodeAdded || eventType === ModifyEventTypes.NodeRemoved ||
            eventType === ModifyEventTypes.NodeMouseUp || eventType == ModifyEventTypes.NodeCaptionModified ||
            eventType === ModifyEventTypes.MemoAdded
        ) {
            const xml = Diagram.serialize(this.diagram);
            this.props.setTabModified(this.flowName, xml);
        }
    }

    onLinkCreating = (block: any, event: MouseEvent, onSelectCallback: any) => {
        console.log("onLinkCreating", block, event);
        const { metaName, links: svgLinks } = block;
        const { links } = this.meta.nodes?.[metaName];
        const connected = Array.from(svgLinks, ([key, value]) => `${value.caption}`);
        const choices = links.map((link: any) => link.name);
        const selectList = _.xor(choices, connected);
        if (selectList.length == 0) {
            onSelectCallback(null);
        } else {
            this.props.setChoices(choices, connected);
            this.props.setChoiceCallback((choice) => onSelectCallback(choice));
            this.props.showChoiceMenu({ mouseX: event.clientX - 2, mouseY: event.clientY + 6 })
        }
    }

    onNodeSelected = (block: any) => {
        const { metaName, id, comment, userData } = block;
        console.log("onNodeSelected", metaName, id, comment, userData);
        if (metaName && userData) {
            const blockMeta = this.meta.nodes?.[metaName];
            if (blockMeta) {
                const { displayName, isJumpable, properties } = blockMeta;

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
                this.props.setAttributes(userData, {
                        metaName: metaName, 
                        displayName: displayName,
                        id: id,
                        userComment: "",
                        isJumpable: isJumpable 
                    }, [ ...formList ]);

                // const xml = Diagram.serialize(this.diagram);
                // this.props.setTabModified(this.flowName, xml);
            }
        }
    }

    onNodeUnSelected = (block: any) => {
        console.log("onNodeUnSelected", block?.metaName, block?.userData);
        this.props.cleanAttribute();
        const xml = Diagram.serialize(this.diagram);
        this.props.setTabModified(this.flowName, xml);
    }
    
    onNodeModifyingCaption = (block: any, value: string, onNewValueCallback: any) => {
        console.log("onNodeModifyingDesc", block, value);
        this.props.setOpenDescriptionEditDialog(true, value, (value) => onNewValueCallback(value));
    }

    onNodeModifyingComment = (block: any, value: string, onNewValueCallback: any) => {
        console.log("onNodeModifyingComment", block, value);
    }

    render = () => {
        let self = this;

        return (
            <Box
                // onKeyDown={(event) => {
                //        console.log("SVGDiagram KeyDown", event)
                //        event.preventDefault();
                //     }
                // } 
                sx={{ 
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