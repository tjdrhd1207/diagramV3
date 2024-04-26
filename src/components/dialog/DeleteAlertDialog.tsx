"use client"

import { Button, Typography } from "@mui/material";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal";

interface DialogProps {
    open: boolean | undefined;
    onClose: () => void;
    title: string | undefined;
    target: string | undefined;
    onDelete: () => void;
}

export const DeleteAlertDialog = (props: DialogProps) => {
    const { open, onClose, title, target, onDelete } = props;

    return (
        <CustomModal open={open? open : false} onClose={onClose}>
            <CustomModalTitle title={title? title : ""} />
            <CustomModalContents>
                <Typography variant="body2">
                    {`Are you sure you want to delete \"${target}\"`}
                </Typography>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" onClick={onClose}>Cancel</Button>
                <Button size="small" variant="contained" color="error" onClick={onDelete}>Delete</Button>
            </CustomModalAction>
        </CustomModal>
    )
}