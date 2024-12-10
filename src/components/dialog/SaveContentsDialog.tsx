import { Button, Typography } from "@mui/material";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalInfoBox, CustomModalProps, CustomModalTitle } from "../common/modal";
import { DiffEditor } from "@monaco-editor/react";

export interface SaveContentsDialogState {
    open: boolean;
    target: string | undefined;
    origin: string | undefined;
    modified: string | undefined;
    setOpen: (open: boolean, target?: string, origin?: string, modified?: string) => void;
}

interface SaveContentsDialogProps extends CustomModalProps {
    target: string | undefined;
    origin: string | undefined;
    modified: string | undefined;
    onCloseWithSave: (target: string | undefined) => void;
    onCloseWithNoSave: (target: string | undefined) => void;
}

export const SaveContentsDialog = (props: SaveContentsDialogProps) => {
    const { open, onClose, target, origin, modified, onCloseWithSave, onCloseWithNoSave } = props;

    const handleSave = () => {
        onClose();
        onCloseWithSave(target);
    };

    const handleDoNotSave = () => {
        onClose();
        onCloseWithNoSave(target);
    };

    return (
        <CustomModal open={open} onClose={onClose}>
            <CustomModalTitle title="Save" />
            <CustomModalInfoBox>
                <Typography variant="body1">Do you want to save the changes you made to "{target}"?</Typography>
                <Typography variant="caption">⚠️ Your changes will be lost if you don't save them.</Typography>
            </CustomModalInfoBox>
            <CustomModalContents>
                <DiffEditor height="80vh" width="80vw" original={origin} modified={modified} options={{ readOnly: true }}/>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" color="success" variant="contained" onClick={handleSave}>Save</Button>
                <Button size="small" color="error" onClick={handleDoNotSave}>Don't save</Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}