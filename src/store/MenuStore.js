import { create } from "zustand";

export const useMenuStore = create(set => ({
	menuOpen: false,
	setMenuOpen: (open) => set({ menuOpen: open})
}))