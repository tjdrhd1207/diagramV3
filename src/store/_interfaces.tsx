export interface TabState {
    tab: any,
    setTab: (value: any) => void,
}

export interface Cleanable {
    clean: () => void
}