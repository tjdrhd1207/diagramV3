import { create } from "zustand";

export const useLocalStore = create((set, get) => ({
	project_info: {
		workspace_name: null,
		project_name: null,
		project_id: null,
		description: null,
		project_meta: null,
	},
	block_meta: null,
	setProjectInfo: (info) => set({ project_info: {
		workspace_name: info.workspace_name? info.workspace_name : get().project_info.workspace_name,
		project_name: info.project_name? info.project_name : get().project_info.project_name,
		project_id: info.project_id? info.project_id : get().project_info.project_id,
		description: info.description? info.description : get().project_info.description,
		project_meta: info.project_meta? info.project_meta : get().project_info.project_meta
	}}),
	setBlockMeta: (meta) => set({ block_meta: meta })
}))