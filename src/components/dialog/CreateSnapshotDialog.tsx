"use client"

import { Button } from "@mui/material";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal";
import { NeedValidate } from "@/store/_interfaces";
import { create } from "zustand";
import { FormText } from "../common/form";

interface InputState extends NeedValidate {
    version: string;
    onVersionChanged: (value: string) => void;
    description: string;
    onDescriptionChanged: (value: string) => void;
};

const _useInputState = create<InputState>((set) => ({
    version: "",
    onVersionChanged: (value) => {
        set({ version: value });
        value? set({ valid: true }) : set({ valid: false });
    },
    description: "",
    onDescriptionChanged: (value) => set({ description: value }),
    valid: false,
    setValid: (value) => set({ valid: value })
}));


interface DialogProps {
    open: boolean;
    onClose: () => void;
    onCreate?: (version: string, description: string) => void;
};

export const CreateSnapshotDialog = (props: DialogProps) => {
    const { open, onClose, onCreate } = props;

    const version = _useInputState((state) => state.version);
    const onVersionChanged = _useInputState((state) => state.onVersionChanged);
    const description = _useInputState((state) => state.description);
    const onDescriptionChanged = _useInputState((state) => state.onDescriptionChanged);
    const valid = _useInputState((state) => state.valid);

    return (
        <CustomModal open={open} onClose={onClose}>
            <CustomModalTitle title="Create Snapshot" />
            <CustomModalContents>
                <FormText required formTitle="Version" formValue={version} onFormChanged={(value) => onVersionChanged(value)} />
                <FormText formTitle="Description" formValue={description} onFormChanged={(value) => onDescriptionChanged(value)} />
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" disabled={!valid} onClick={onCreate? () => onCreate(version, description) : undefined}>Create</Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
};