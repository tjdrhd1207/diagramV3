import { create } from "zustand"

export interface PageInfo {
    name: string,
    start: boolean,
    tag: string,
    lastOpened: boolean
}

interface ProjectState {
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
    deleteScenarioPage: (name) => set({ scenarioPages: [...get().scenarioPages.filter((p) => p.name !== name)]})
}))

interface DiagramMetaState {
    meta: any,
    setMeta: (value: object) => void
}

export const useDiagramMetaStore = create<DiagramMetaState>((set) => ({
    meta: undefined,
    setMeta: (value) => set({ meta: value })
}))