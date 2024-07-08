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

export interface AlertState {
    showAlert: boolean
    variant: "filled" | "standard" | "outlined" | undefined;
    serverity: AlertColor | undefined;
    message: string | undefined;
    setShow: (variant: "filled" | "standard" | "outlined" | undefined, serverity: AlertColor | undefined, message: string | undefined) => void;
    setHide: () => void;
}