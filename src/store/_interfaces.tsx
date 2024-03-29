export interface TabState {
    tab: any,
    setTab: (value: any) => void,
}

export interface Cleanable {
    clean: () => void
}

export interface NeedValidate {
    valid: boolean,
    setValid: (value: boolean) => void
}

export type MenuPosition = {
    mouseX: number,
    mouseY: number,
}