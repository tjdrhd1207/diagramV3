import { Snackbar, Alert, AlertColor } from "@mui/material"

interface CustomSnackbarProps {
    open: boolean;
    close: () => void;
    severity: AlertColor;
    message: string | undefined;
}

export const CustomSnackbar = (props: CustomSnackbarProps) => {
    const { open, close, severity, message } = props;

    const handleClose = () => {
        close();
    };

    return (
        <Snackbar open={open} autoHideDuration={null} onClose={handleClose}
            // anchorOrigin={{
            //     vertical: 'bottom',
            //     horizontal: 'center',
            // }}
        >
            <Alert onClose={handleClose} severity={severity} variant="filled">
                {message? message : <></>}
            </Alert>
        </Snackbar>
    )
}