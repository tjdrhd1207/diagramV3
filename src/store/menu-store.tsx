import { create } from "zustand"

interface MenuState {
    showMenu: boolean,
    openMenu: () => void,
    closeMenu: () => void
}

export const useMenuStore = create<MenuState>((set) => ({
    showMenu: false,
    openMenu: () => set(() => ({ showMenu: true})),
    closeMenu: () => set(() => ({ showMenu: false }))
}))