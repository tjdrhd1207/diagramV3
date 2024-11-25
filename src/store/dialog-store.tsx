import { create } from "zustand";

interface DialogState {
    showNewFlowDialog: boolean;
    openNewFlowDialog: () => void;
    closeNewFlowDialog: () => void;
    showNewProjectDialog: boolean;
    openNewProjectDialog: () => void;
    closeNewProjectDialog: () => void;
    showOpenProjectDialog: boolean;
    openOpenProjectDialog: () => void;
    closeOpenProjectDialog: () => void;
    openCloseProjectDialog: boolean;
    setOpenCloseProjectDialog: (open: boolean) => void;
    openKeywordSearchDialog: boolean;
    setOpenKeywordSearchDialog: (open: boolean) => void;
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
    openCloseProjectDialog: false,
    setOpenCloseProjectDialog: (open) => set({ openCloseProjectDialog: open }),
    openKeywordSearchDialog: false,
    setOpenKeywordSearchDialog: (open) => set({ openKeywordSearchDialog: open })
}))