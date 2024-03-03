import { create } from "zustand";

export const useDialogStore = create((set, get) => ({
	showNewProjectDialog: false,
	openNewProjectDialog: () => set({ showNewProjectDialog: true }),
	closeNewProjectDialog: () => set({ showNewProjectDialog: false }),
	showOpenProjectDialog: false,
	openOpenProjectDialog: () => set({ showOpenProjectDialog: true }),
	closeOpenProjectDialog: () => set({ showOpenProjectDialog: false }),
	showDataExplorerDialog: false,
	openDataExplorerDialog: () => set({ showDataExplorerDialog: true }),
	closeDataExplorerDialog: () => set({ showDataExplorerDialog: false }),
}))