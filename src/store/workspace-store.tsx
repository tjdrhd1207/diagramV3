import { create } from "zustand"
import { Cleanable } from "./_interfaces"

export interface PageInfo {
    name: string,
    start: boolean,
    tag: string,
    lastOpened: boolean
}

interface ProjectState extends Cleanable {
    projectID: string,
    setProjectID: (id: string) => void,
    projectName: string,
    setProjectName: (name: string) => void,
    projectXML: string,
    setProjectXML: (xml: string) => void
    scenarioPages: Array<PageInfo>,
    setScenaioPages: (pages: Array<PageInfo>) => void,
    addScenarioPages: (pages: Array<PageInfo>) => void,
    deleteScenarioPage: (name: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
        projectID: "",
        setProjectID: (id) => set({ projectID: id }),
        projectName: "",
        setProjectName: (name) => set({ projectName: name }),
        projectXML: "",
        setProjectXML: (xml) => set({ projectXML: xml }),
        scenarioPages: [],
        setScenaioPages: (pages) => set({ scenarioPages: pages }),
        addScenarioPages: (pages) => set({ scenarioPages: [...get().scenarioPages, ...pages] }),
        deleteScenarioPage: (name) => set({ scenarioPages: [...get().scenarioPages.filter((p) => p.name !== name)]}),
        clean: () => set({ projectID: "", projectName: "", projectXML: "", scenarioPages: [] })
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