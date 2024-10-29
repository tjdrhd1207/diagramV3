import { create } from "zustand";

interface DialogState {
    showNewFlowDialog: boolean,
    openNewFlowDialog: () => void,
    closeNewFlowDialog: () => void,
    showNewProjectDialog: boolean,
    openNewProjectDialog: () => void,
    closeNewProjectDialog: () => void
    showOpenProjectDialog: boolean,
    openOpenProjectDialog: () => void,
    closeOpenProjectDialog: () => void
    showCloseProjectDialog: boolean,
    openCloseProjectDialog: () => void,
    closeCloseProjectDialog: () => void,
}

export const useDialogState = create<DialogState>((set) => ({
    showNewFlowDialog: false,
    openNewFlowDialog: () => set({ showNewFlowDialog: true }),
    closeNewFlowDialog: () => set({ showNewFlowDialog: false }),
    showNewProjectDialog: false,
    openNewProjectDialog: () => set({ showNewProjectDialog: true }),
    closeNewProjectDialog: () => set({ showNewProjectDialog: false }),
    showOpenProjectDialog: false,
    openOpenProjectDialog: () => set({ showOpenProjectDialog: true }),
    closeOpenProjectDialog: () => set({ showOpenProjectDialog: false }),
    showCloseProjectDialog: false,
    openCloseProjectDialog: () => set({ showCloseProjectDialog: true }),
    closeCloseProjectDialog: () => set({ showCloseProjectDialog: false })
}))