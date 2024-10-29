import { create } from "zustand"
import { Cleanable } from "./_interfaces"

export interface FlowInfo {
    name: string,
    start: boolean,
    tag: string,
}

interface ProjectState extends Cleanable {
    projectID: string,
    setProjectID: (id: string) => void,
    projectName: string,
    setProjectName: (name: string) => void,
    projectXML: string,
    setProjectXML: (xml: string) => void
    projectFlows: Array<FlowInfo>,
    setProjectFlows: (pages: Array<FlowInfo>) => void,
    addProjectFlows: (pages: Array<FlowInfo>) => void,
    deleteProjectFlow: (name: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
        projectID: "",
        setProjectID: (id) => set({ projectID: id }),
        projectName: "",
        setProjectName: (name) => set({ projectName: name }),
        projectXML: "",
        setProjectXML: (xml) => set({ projectXML: xml }),
        projectFlows: [],
        setProjectFlows: (pages) => set({ projectFlows: pages }),
        addProjectFlows: (pages) => set({ projectFlows: [...get().projectFlows, ...pages] }),
        deleteProjectFlow: (name) => set({ projectFlows: [...get().projectFlows.filter((p) => p.name !== name)]}),
        clean: () => set({ projectID: "", projectName: "", projectXML: "", projectFlows: [] })
    }),
)

interface DiagramMetaState extends Cleanable {
    meta: any;
    setMeta: (value: object) => void;
    jumpableTagNames: Array<string>;
    setJumpableTagNames: (names: Array<string>) => void;
}

export const useDiagramMetaStore = create<DiagramMetaState>((set) => ({
    meta: undefined,
    setMeta: (value) => set({ meta: value }),
    jumpableTagNames: [],
    setJumpableTagNames: (names) => set({ jumpableTagNames: names }),
    clean: () => set({ meta: undefined, jumpableTagNames: [] })
}))