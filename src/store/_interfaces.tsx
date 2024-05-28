import { AlertColor } from "@mui/material";

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

export interface SnackbarStore {
    open: boolean;
    duration: number;
    severity: AlertColor
    message: string | undefined;
    show: (severity: AlertColor, message: string) => void;
    close: () => void;
};