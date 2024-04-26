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

export type EditorTabItem = {
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
    addTabs: (add) => Array.isArray(get().tabs)? set({ tabs: [...get().tabs as Array<EditorTabItem>, ...add]}) : set({ tabs: [...add] }),
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

export interface FlowEditType {
    targetPage: any;
    targetBlock: any;
    mode: FlowEditMode;
}

export interface FlowEditState extends Cleanable {
    states: FlowEditType[];
    addState: (targetPage: string) => void;
    removeState: (targetPage: string) => void;
    setCreateMode: (targetPage: string, targetBlock: any) => void;
    setBuildMode: (targetPage: string) => void;
    setIdleMode: (targetPage: string) => void;
    mode: FlowEditType;
    setMode: (v: FlowEditType) => void;
    // blockObject: BlockObjectType | undefined;
    // setBlockObject: (b: BlockObjectType | undefined) => void;
}

export const useFlowEditState = create<FlowEditState>((set, get) =>({
    states: [],
    addState: (targetPage) => set({
        states: [
            ...get().states,
            { targetPage: targetPage, targetBlock: undefined, mode: FlowEditMode.idle }
        ]
    }),
    removeState: (targetPage) => set({ states: get().states.filter((s) => s.targetPage !== targetPage) }),
    setCreateMode: (targetPage, targetBlock) => set({
        states: get().states.map((m) => {
            if (m.targetPage === targetPage) {
                return { ...m, mode: FlowEditMode.create, targetBlock: targetBlock };
            } else {
                return m;
            }
        })
    }),
    setBuildMode: (targetPage) => set({
        states: get().states.map((m) => {
            if (m.targetPage === targetPage) {
                return { ...m, mode: FlowEditMode.build, targetBlock: undefined };
            } else {
                return m;
            }
        })
    }),
    setIdleMode: (targetPage) => set({
        states: get().states.map((m) => {
            if (m.targetPage === targetPage) {
                return { ...m, mode: FlowEditMode.idle, targetBlock: undefined };
            } else {
                return m;
            }
        })
    }),
    mode: { targetPage: undefined, targetBlock: undefined, mode: FlowEditMode.idle, attributes: undefined },
    setMode: (v) => set({ mode: v }),
    // blockObject: undefined,
    // setBlockObject: (b) => set({ blockObject: b }),
    clean: () => set({ 
        states: [],
        mode: { targetPage: undefined, targetBlock: undefined, mode: FlowEditMode.idle },
        //  blockObject: undefined
    })
}))

export interface BlockObjectType {
    metaName: string;
    id: string;
    description: string;
    xml: NodeWrapper;
}

export interface BlockCommonAttributes {
    metaName: string,
    id: string,
    userComment: string,
    isJumpable: boolean
}

export interface BlockSpecificAttributes {
    displayName: string;
    type: string;
    buildName: string;
    required: boolean;
    isProtected: boolean;
    customEditorTypeName: string;
    itemsSourceKey: string;
    description: string;
    origin: any;
    value: any;
    attributes: object;
    modified: boolean;
}

interface BlockAttributesType {
    targetPage: string;
    userData: NodeWrapper | undefined;
    commonAttributes: BlockCommonAttributes | undefined;
    specificAttributes: BlockSpecificAttributes[];
}

export interface BlockAttributesState {
    states: BlockAttributesType[];
    addState: (targetPage: string) => void;
    removeState: (targetPage: string) => void;
    setAttributes: (targetPage: string, userData: NodeWrapper, 
        commonAttributes: BlockCommonAttributes, specificAttributes: BlockSpecificAttributes[]) => void;
    cleanAttribute: (targetPage: string) => void;
    updateBlockAttributes: (targetPage: string, displayName: string, input: any, modified: boolean) => void;
    show: boolean;
    setShow: (v: boolean) => void;
    userData: NodeWrapper | undefined;
    setUserData: (b: NodeWrapper | undefined) => void;
    commonAttributes: BlockCommonAttributes;
    specificAttributes: BlockSpecificAttributes[];
    setBlockAttributes: (p1: BlockCommonAttributes, p2: Array<BlockSpecificAttributes>) => void;
    updateBlockAttribute: (displayName: string, input: any, modified: boolean) => void;
    modificationApplied: () => void;
}

export const useBlockAttributeState = create<BlockAttributesState>((set, get) => ({
    states: [],
    addState: (targetPage) => {
        if (!get().states.find((s) => s.targetPage === targetPage)) {
            set({ states: [
                    ...get().states,
                    { targetPage: targetPage, userData: undefined, commonAttributes: undefined, specificAttributes: [] }
                ]
            })
        }
    },
    removeState: (targetPage) => set({ states: get().states.filter((s) => s.targetPage !== targetPage)}),
    setAttributes: (targetPage, userData, commonAttributes, specificAttributes) => 
        set({ 
            states: get().states.map((s) => { 
                if (s.targetPage === targetPage) {
                    return { ...s, userData: userData, commonAttributes: commonAttributes, specificAttributes: specificAttributes };
                } else {
                    return s;
                }
            })
        }
    ),
    cleanAttribute: (targetPage) => set({ states: get().states.map((s) => {
        if (s.targetPage === targetPage) {
            return { ...s, userData: undefined, commonAttributes: undefined, specificAttributes: []};
        } else {
            return s;
        }
    })}),
    updateBlockAttributes: (targetPage, displayName, input, modified) => set({
        states: get().states.map((s) => {
            if (s.targetPage === targetPage) {
                return { ...s, specificAttributes: s.specificAttributes.map((sa) => {
                    if (sa.displayName === displayName) {
                        return { ...sa, value: input, modified: modified};
                    } else {
                        return sa;
                    }
                })};
            }
            return s;
        })
    }),
    show: false,
    setShow: (v) => set({ show: v }),
    userData: undefined,
    setUserData: (b) => set({ userData: b }),
    commonAttributes: { metaName: "", id: "", userComment: "", isJumpable: false },
    specificAttributes: [],
    setBlockAttributes: (p1, p2) => set({ show: true, commonAttributes: p1, specificAttributes: p2 }),
    updateBlockAttribute: (displayName, input, modified) => {
        const found = get().specificAttributes.find((p) => p.displayName === displayName);
        if (found) {
            set({ specificAttributes: get().specificAttributes.map((b) => {
                if (b.displayName === displayName) {
                    return { ...b, value: input, modified: modified };
                }
                return b;
            })})
        }
    },
    modificationApplied: () => set({ specificAttributes: get().specificAttributes.map((b) => {
        return { ...b, modified: false }
    })})
}))