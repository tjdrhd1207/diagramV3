import { useSnackbarStore } from "@/store/snackbar-store"
import { Snackbar, Alert, AlertColor } from "@mui/material"

interface CustomSnackbarProps {
    open: boolean;
    close: () => void;
    severity: AlertColor;
    message: string | undefined;
}

export const CustomSnackbar = (props: CustomSnackbarProps) => {
    const { open, close, severity, message } = props;
    // const open = useSnackbarStore((state) => state.open);
    // const close = useSnackbarStore((state) => state.close);
    // const severity = useSnackbarStore((state) => state.severity);
    // const message = useSnackbarStore((state) => state.message);

    const handleClose = () => {
        close();
    };

    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}
            // anchorOrigin={{
            //     vertical: 'bottom',
            //     horizontal: 'center',
            // }}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message? message : <></>}
            </Alert>
        </Snackbar>
    )
}