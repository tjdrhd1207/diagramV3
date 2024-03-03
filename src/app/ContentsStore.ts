import { create } from "zustand";

interface ContentState {
	content: string,
	setContent: (by: string) => void
}

export const useContentsStore = create<ContentState>((set) => ({
	content: "",
	setContent: (by) => set(() => ({ content: by }))
}))

interface LintResultState {
	lintResult: string,
	setLintResult: (by: string) => void
}

export const useLintResultStore = create<LintResultState>((set) => ({
	lintResult: "",
	setLintResult: (by) => set(() => ({ lintResult: by }))
}))