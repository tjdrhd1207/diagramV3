import { create } from "zustand"
import { Cleanable, MenuPosition, TabState } from "./_interfaces"
import { NodeWrapper } from "@/lib/diagram"

export const EDITOR_TYPE = {
    dxml: "dxml",
    js: "js",
    variable: "var",
    message: "msg" 
} as const
export type EDITOR_TYPE = typeof EDITOR_TYPE[keyof typeof EDITOR_TYPE]

type EditorTabItem = {
    name: string,
    modified: boolean,
    origin: string,
    contents: string,
    type: EDITOR_TYPE
}

interface EditorTabState extends TabState, Cleanable {
    tabs: Array<EditorTabItem>,
    setTabs: (add: Array<EditorTabItem>) => void,
    addTabs: (add: Array<EditorTabItem>) => void,
    getTabByName: (name: string) => EditorTabItem | undefined,
    removeTab: (name: string) => void,
    removeAllTabs: () => void,
    setTabModified: (name: string, xml: string) => void
    setTabUnmodified: (name: string) => void
}

export const useEditorTabState = create<EditorTabState>((set, get) => ({
    tab: false,
    setTab: (value) => set({ tab: value }),
    tabs: [],
    setTabs: (add) => set({ tabs: [...add]}),
    addTabs: (add) => Array.isArray(get().tabs)? set({ tabs: [...get().tabs as Array<EditorTabItem>, ...add]}) : set({ tabs: [...add]}),
    getTabByName: (name) => { return get().tabs.find((t) => t.name === name) },
    removeTab: (name) => set({ tabs: get().tabs?.filter((tab) => tab.name !== name) }),
    removeAllTabs: () => set({ tabs: undefined }),
    setTabModified: (name, xml) => {
        const found = get().tabs.find((t) => t.name.startsWith(name));
        if (found) {
            set({ tabs: get().tabs.map((t) => {
                if (t.name.startsWith(name)) {
                    return { ...t, modified: true, contents: xml };
                    // return { ...t, modified: true };
                }
                return t;
            })});
        }
    },
    setTabUnmodified: (name) => {
        const found = get().tabs.find((t) => t.name.startsWith(name));
        if (found) {
            set({ tabs: get().tabs.map((t) => {
                if (t.name.startsWith(name)) {
                    return { ...t, modified: false };
                }
                return t;
            })});
        }
    },
    clean: () => set({ tab: false, tabs: [] })
}))

export const FlowEditMode = {
    create: "create",
    build: "build",
    edit: "edit",
    idle: "idle"
}
type FlowEditMode = typeof FlowEditMode[keyof typeof FlowEditMode]

export type FlowEditType = {
    name: FlowEditMode,
    target: any
}

export type BlockObjectType = {
    metaName: string,
    id: string,
    description: string,
    xml: NodeWrapper
}

export interface FlowEditState extends Cleanable {
    mode: FlowEditType
    setMode: (v: FlowEditType) => void,
    blockObject: BlockObjectType | undefined
    setBlockObject: (b: BlockObjectType | undefined) => void
}

export const useFlowEditState = create<FlowEditState>((set) =>({
    mode: { name: FlowEditMode.idle, target: undefined },
    setMode: (v) => set({ mode: v }),
    blockObject: undefined,
    setBlockObject: (b) => set({ blockObject: b }),
    clean: () => set({ mode: { name: FlowEditMode.idle, target: undefined }, blockObject: undefined })
}))

export interface BlockCommonProps {
    metaName: string,
    id: string,
    userComment: string,
    isJumpable: boolean
}

export interface BlockFormProps {
    buildName: string,
    displayName: string,
    required: boolean,
    isProtected: boolean,
    type: string,
    customEditorTypeName: string,
    origin: any,
    value: any,
    attributes: object
    modified: boolean
}

export interface AttributePropsState {
    show: boolean;
    setShow: (v: boolean) => void;
    commonProps: BlockCommonProps;
    blockProps: Array<BlockFormProps>;
    setAttributeProps: (p1: BlockCommonProps, p2: Array<BlockFormProps>) => void;
    updateAttributeProps: (displayName: string, input: any, modified: boolean) => void;
}

export const useAttributePropsState = create<AttributePropsState>((set, get) => ({
    show: false,
    setShow: (v) => set({ show: v }),
    commonProps: { metaName: "", id: "", userComment: "", isJumpable: false },
    blockProps: [],
    setAttributeProps: (p1, p2) => set({ show: true, commonProps: p1, blockProps: p2 }),
    updateAttributeProps: (displayName, input, modified) => {
        const found = get().blockProps.find((p) => p.displayName === displayName);
        if (found) {
            set({ blockProps: get().blockProps.map((b) => {
                if (b.displayName === displayName) {
                    return { ...b, value: input, modified: modified };
                }
                return b;
            })})
        }
    }
}))

