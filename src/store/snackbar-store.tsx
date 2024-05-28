import { AlertColor } from "@mui/material";
import { create } from "zustand";

interface SnackbarStore {
    open: boolean;
    duration: number;
    severity: AlertColor
    message: string | undefined;
    show: (severity: AlertColor, message: string) => void;
    close: () => void;
};

export const useSnackbarStore = create<SnackbarStore>((set) => ({
    open: false,
    duration: 6000,
    severity: "info",
    message: undefined,
    show: (severity, message) => set({ open: true, severity: severity, message: message}),
    close: () => set({ open: false })
}));