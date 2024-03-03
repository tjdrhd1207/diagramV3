import { create } from "zustand";

interface DialogState {
    showNewPageDialog: boolean,
    openNewPageDialog: () => void,
    closeNewPageDialog: () => void,
    showNewProjectDialog: boolean,
    openNewProjectDialog: () => void,
    closeNewProjectDialog: () => void
    showOpenProjectDialog: boolean,
    openOpenProjectDialog: () => void,
    closeOpenProjectDialog: () => void
}

export const useDialogState = create<DialogState>((set) => ({
    showNewPageDialog: false,
    openNewPageDialog: () => set({ showNewPageDialog: true }),
    closeNewPageDialog: () => set({ showNewPageDialog: false }),
    showNewProjectDialog: false,
    openNewProjectDialog: () => set({ showNewProjectDialog: true }),
    closeNewProjectDialog: () => set({ showNewProjectDialog: false }),
    showOpenProjectDialog: false,
    openOpenProjectDialog: () => set({ showOpenProjectDialog: true }),
    closeOpenProjectDialog: () => set({ showOpenProjectDialog: false })
}))