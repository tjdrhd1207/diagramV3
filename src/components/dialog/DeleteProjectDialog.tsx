"use client"

import { Backdrop, Button, CircularProgress, Typography } from "@mui/material";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle, CustomModalProps, CustomModalInfoBox } from "../common/modal";
import { create } from "zustand";
import { FormText } from "../common/form";
import { deleteProject, getProjectInfoByID } from "@/service/fetch/crud/project";
import { AlertState, LoadingState } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";

export interface DeleteProjectDialogStore {
    open: boolean;
    projectID: string | undefined;
    openDialog: (projectID: string, projectName: string) => void;
    closeDialog: () => void;
};

interface DialogStore {
    projectName: string;
    projectDescription: string;
    setProjectInfo: (projectName: string, projectDescription: string) => void;
    confirmText: string;
    confirmed: boolean;
    onConfirmTextChanged: (value: string | undefined) => void;
    setConfirmed: (confirmed: boolean) => void;
    initializeState: () => void;
}

const _useDialogStore = create<DialogStore & AlertState & LoadingState>((set) => ({
    projectName: "",
    projectDescription: "",
    setProjectInfo: (projectName, projectDescription) => set({ projectName: projectName, projectDescription: projectDescription }),
    confirmText: "",
    confirmed: false,
    onConfirmTextChanged: (value) => set({ confirmText: value }),
    setConfirmed: (confirmed) => set({ confirmed: confirmed }),
    initializeState: () => set({ confirmText: "", confirmed: false }),
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false }),
    loading: false,
    loadingStart: () => set({ loading: true }),
    loadingDone: () => set({ loading: false })
}))

interface DeleteProjectDialogProps extends CustomModalProps {
    projectID: string | undefined;
    onDelete: () => void;
}

export const DeleteProjectDialog = (props: DeleteProjectDialogProps) => {
    const { open, projectID, onClose, onDelete } = props;

    const projectName = _useDialogStore((state) => state.projectName);
    const projectDescription = _useDialogStore((state) => state.projectDescription);
    const setProjectInfo = _useDialogStore((state) => state.setProjectInfo);

    const confirmText = _useDialogStore((state) => state.confirmText);
    const confirmed = _useDialogStore((state) => state.confirmed);
    const onConfirmTextChanged = _useDialogStore((state) => state.onConfirmTextChanged);
    const setConfirmed = _useDialogStore((state) => state.setConfirmed);
    const initializeState = _useDialogStore((state) => state.initializeState);

    const alert = _useDialogStore((state) => state.alert);
    const alertMessage = _useDialogStore((state) => state.message);
    const showAlert = _useDialogStore((state) => state.showAlert);
    const hideAlert = _useDialogStore((state) => state.hideAlert);

    const loading = _useDialogStore((state) => state.loading);
    const loadingStart = _useDialogStore((state) => state.loadingStart);
    const loadingDone = _useDialogStore((state) => state.loadingDone);

    const handleTransitionEnter = () => {
        if (projectID) {
            loadingStart();
            getProjectInfoByID(projectID, {
                onOK: (data: any) => {
                    const { projectInfo } = data;
                    const { 
                        WORKSPACE_NAME: workspaceName,
                        PROJECT_NAME: projectName,
                        PROJECT_DESCRIPTION: projectDescription } = projectInfo;

                    setProjectInfo(projectName, projectDescription);
                    loadingDone();
                },
                onError: (message: any) => {
                    loadingDone();
                }
            });
            initializeState();
        }
    }

    const handleDeleteProject = async () => {
        if (projectID) {
            loadingStart();
            await deleteProject(projectID, {
                onOK: () => {
                    onDelete();
                    if (onClose) {
                        onClose();
                    }
                },
                onError: (message) => {
                    showAlert("filled", "error", message);
                    loadingDone();
                }
            });
        }
        
    }

    return (
        <CustomModal open={open? open : false} onClose={onClose} onTransitionEnter={handleTransitionEnter}>
            <CustomModalTitle title="Are you absolutely sure?" />
            <CustomModalContents>
                <CustomModalInfoBox>
                    <Typography variant="body1">
                        {"You are about to delete this project containing:"}
                    </Typography>
                    <Typography variant="body2">
                        <li>{`Project Name: ${projectName}`}</li>
                        <li>{`Project ID: ${projectID}`}</li>
                        <li>{`Project Description: ${projectDescription}`}</li>
                    </Typography>
                </CustomModalInfoBox>
                <Typography variant="body1">Enter the following to confirm:</Typography>
                <Typography variant="body1"><code>{projectName}</code></Typography>
                <FormText required={false} autoFocus disabled={false} formTitle="" formValue={confirmText} 
                    onFormChanged={(value) => {
                        onConfirmTextChanged(value);
                        if (value && projectName === value) {
                            setConfirmed(true);
                        } else {
                            setConfirmed(false);
                        }
                    }}
                />
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" color="error" disabled={!confirmed} 
                    onClick={projectID? () => handleDeleteProject() : undefined}>
                        Delete
                </Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
            <CustomSnackbar open={alert} close={hideAlert} severity="error" message={alertMessage} />
            <Backdrop open={loading} invisible>
                <CircularProgress />
            </Backdrop>
        </CustomModal>
    )
}