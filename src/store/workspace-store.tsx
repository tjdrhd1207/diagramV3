import { create } from "zustand"
import { NeedClean } from "./_interfaces"
import { FlowInformation } from "@/service/global"

export interface FlowInfo {
    name: string,
    start: boolean,
    tag: string,
}

interface ProjectState extends NeedClean {
    projectID: string,
    setProjectID: (id: string) => void,
    projectName: string,
    setProjectName: (name: string) => void,
    projectXML: string,
    setProjectXML: (xml: string) => void
    projectFlows: FlowInformation[],
    setProjectFlows: (infos: FlowInformation[]) => void,
    addProjectFlows: (infos: FlowInformation[]) => void,
    deleteProjectFlow: (flowName: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
        projectID: "",
        setProjectID: (id) => set({ projectID: id }),
        projectName: "",
        setProjectName: (name) => set({ projectName: name }),
        projectXML: "",
        setProjectXML: (xml) => set({ projectXML: xml }),
        projectFlows: [],
        setProjectFlows: (infos) => set({ projectFlows: infos }),
        addProjectFlows: (infos) => set({ projectFlows: [...get().projectFlows, ...infos] }),
        deleteProjectFlow: (flowName) => set({ projectFlows: [...get().projectFlows.filter((p) => p.flowName !== flowName)]}),
        clean: () => set({ projectID: "", projectName: "", projectXML: "", projectFlows: [] })
    }),
)

interface DiagramMetaState extends NeedClean {
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