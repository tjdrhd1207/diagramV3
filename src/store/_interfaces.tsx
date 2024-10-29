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

export interface LoadingState {
    loading: boolean,
    loadingStart: () => void;
    loadingDone: () => void;
}

export interface AlertState {
    alert: boolean
    variant: "filled" | "standard" | "outlined" | undefined;
    serverity: AlertColor | undefined;
    message: string | undefined;
    showAlert: (variant: "filled" | "standard" | "outlined" | undefined, serverity: AlertColor | undefined, message: string | undefined) => void;
    hideAlert: () => void;
}

export interface TextFormState {
    value: string;
    color: string;
    helperText: string;
    valid: boolean;
}