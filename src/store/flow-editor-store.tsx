import { TabState } from "@/components/common/tab"
import { create } from "zustand"

const EDITOR_TYPE = {
    dxml: "dxml",
    js: "js",
    variable: "variable",
    interface: "interface" 
} as const
export type EDITOR_TYPE = typeof EDITOR_TYPE[keyof typeof EDITOR_TYPE]

type EditorTabItem = {
    name: string,
    modified: boolean,
    contents: string,
    type: EDITOR_TYPE
}

interface EditorTabState extends TabState {
    tabs: Array<EditorTabItem>,
    setTabs: (add: Array<EditorTabItem>) => void,
    addTabs: (add: Array<EditorTabItem>) => void,
    removeTab: (name: string) => void,
    removeAllTabs: () => void,
    setTabModified: (name: string, code: string) => void
    setTabNotModified: (name: string) => void
}

export const useEditorTabState = create<EditorTabState>((set, get) => ({
    tab: false,
    setTab: (value) => set({ tab: value }),
    tabs: [],
    setTabs: (add) => set({ tabs: [...add]}),
    addTabs: (add) => Array.isArray(get().tabs)? set({ tabs: [...get().tabs as Array<EditorTabItem>, ...add]}) : set({ tabs: [...add]}),
    removeTab: (name) => set({ tabs: get().tabs?.filter((tab) => tab.name !== name) }),
    removeAllTabs: () => set({ tabs: undefined }),
    setTabModified: (name, code) => {
        const found = get().tabs.find((t) => t.name === name);
        if (found) {
            set({ tabs: get().tabs.map((t) => {
                if (t.name === name) {
                    // return { ...t, modified: true, contents: code };
                    return { ...t, modified: true };
                }
                return t;
            })});
        }
    },
    setTabNotModified: (name) => {
        const found = get().tabs.find((t) => t.name === name);
        if (found) {
            set({ tabs: get().tabs.map((t) => {
                if (t.name === name) {
                    return { ...t, modified: false };
                }
                return t;
            })});
        }
    }
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
    xml: any
}

export interface FlowEdtitState {
    mode: FlowEditType
    setMode: (v: FlowEditType) => void,
    blockObject: BlockObjectType | undefined
    setBlockObject: (b: BlockObjectType | undefined) => void
}

export const useFlowEditState = create<FlowEdtitState>((set) =>({
    mode: { name: FlowEditMode.idle, target: undefined },
    setMode: (v) => set({ mode: v }),
    blockObject: undefined,
    setBlockObject: (b) => set({ blockObject: b })
}))