"use client"

import { useDialogState } from "@/store/dialog-store"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalInfoBox, CustomModalTitle } from "../common/modal";
import { Alert, AlertColor, Backdrop, Button, CircularProgress, Typography } from "@mui/material";
import { ToggleContents } from "../common/toggler";
import { create } from "zustand";
import { FormSelect, FormText } from "../common/form";
import React from "react";
import { AlertState, LoadingState, NeedValidate } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";
import { createProject } from "@/service/fetch/crud/project";
import { inherits } from "util";

interface NewProjectDialogState extends NeedValidate {
    workspaceName: string;
    onWorkspaceNameChanged: (value: string) => void;
    workspaceNameDisabled: boolean;
    projectName: string;
    onProjectNameChanged: (value: string) => void;
    projectNameDisabled: boolean;
    projectNameAlert: boolean;
    projectNameAlertSeverity: AlertColor | undefined;
    projectNameAlertMessage: string | undefined;
    showProjectNameAlert: (serverity: AlertColor, message: string) => void;
    hideProjectNameAlert: () => void;
    description: string;
    onDescriptionChanged: (value: string) => void;
    descriptionDisabled: boolean;
    setEnable: () => void;
    setDisable: () => void;
}

const _useNewProjectDialogState = create<NewProjectDialogState & AlertState & LoadingState>((set) => ({
    workspaceName: "default",
    onWorkspaceNameChanged: (value) => {
        set({ workspaceName: value });
        if (value) {
            set({ projectNameDisabled: false, descriptionDisabled: false });
        } else {
            set({ projectNameDisabled: true, descriptionDisabled: true, valid: false });
        }
    },
    workspaceNameDisabled: false,
    projectName: "",
    onProjectNameChanged: (value) => {
        if (value) {
            const pattern = /^[a-zA-Z0-9\uAC00-\uD7A3_][a-zA-Z0-9\uAC00-\uD7A3._-]*$/
            if (pattern.test(value)) {
                set({ projectName: value, valid: true, projectNameAlert: false });
            } else {
                set({ projectName: value, valid: false, projectNameAlert: true, projectNameAlertSeverity: "error",
                    projectNameAlertMessage: "Name can contain only lowercase or uppercase letters, digits, dots, underscores or dashes."
                });
            }
        } else {
            set({ projectName: "", valid: false });
        }
    },
    projectNameDisabled: true,
    projectNameAlert: false,
    projectNameAlertSeverity: undefined,
    projectNameAlertMessage: undefined,
    showProjectNameAlert: (serverity, message) => set({projectNameAlert: true, projectNameAlertSeverity: serverity, projectNameAlertMessage: message }),
    hideProjectNameAlert: () => set({ projectNameAlert: false }),
    description: "",
    onDescriptionChanged: (value) => set({ description: value }),
    descriptionDisabled: true,
    setEnable: () => set({ projectNameDisabled: false, descriptionDisabled: false }),
    setDisable: () => set({ projectNameDisabled: true, descriptionDisabled: true }),
    valid: false,
    setValid: (value) => set({ valid: value }),
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

interface NewProjectDialogProps {
    onOK?: (projectID: string, projectName: string) => void;
}

export const NewProjectDialog = (props: NewProjectDialogProps) => {
    const { onOK } = props;

    const open = useDialogState((state) => state.showNewProjectDialog);
    const setClose = useDialogState((state) => state.closeNewProjectDialog);

    const workspaceName = _useNewProjectDialogState((state) => state.workspaceName);
    const workspaceNameDisabled = _useNewProjectDialogState((state) => state.workspaceNameDisabled);
    const onWorkspaceNameChanged = _useNewProjectDialogState((state) => state.onWorkspaceNameChanged);

    const projectName = _useNewProjectDialogState((state) => state.projectName);
    const projectNameDisabled = _useNewProjectDialogState((state) => state.projectNameDisabled);
    const onProjectNameChanged = _useNewProjectDialogState((state) => state.onProjectNameChanged);
    const projectNameAlert = _useNewProjectDialogState((state) => state.projectNameAlert);
    const projectNameAlertSeverity = _useNewProjectDialogState((state) => state.projectNameAlertSeverity);
    const projectNameAlertMessage = _useNewProjectDialogState((state) => state.projectNameAlertMessage);
    const showProjectNameAlert = _useNewProjectDialogState((state) => state.showProjectNameAlert);
    const hideProjectNameAlert = _useNewProjectDialogState((state) => state.hideProjectNameAlert);

    const description = _useNewProjectDialogState((state) => state.description);
    const descriptionDisabled = _useNewProjectDialogState((state) => state.descriptionDisabled);
    const onDescriptionChanged = _useNewProjectDialogState((state) => state.onDescriptionChanged);

    const setEnable = _useNewProjectDialogState((state) => state.setEnable);
    const setDisable = _useNewProjectDialogState((state) => state.setDisable);

    const loading = _useNewProjectDialogState((state) => state.loading);
    const loadingStart = _useNewProjectDialogState((state) => state.loadingStart);
    const loadingDone = _useNewProjectDialogState((state) => state.loadingDone);

    const valid = _useNewProjectDialogState((state) => state.valid);

    const alert = _useNewProjectDialogState((state) => state.alert);
    const alertMessage = _useNewProjectDialogState((state) => state.message);
    const showAlert = _useNewProjectDialogState((state) => state.showAlert);
    const hideAlert = _useNewProjectDialogState((state) => state.hideAlert);

    const handleModalEnter = () => {
        onWorkspaceNameChanged("default");
        onProjectNameChanged("");
        onDescriptionChanged("");
    }

    const handleClose = (projectID: string | undefined) => {
        if (onOK && projectID && projectName) {
            onOK(projectID, projectName);
        }
        setClose();
    }

    const handleNewProject = async () => {
        loadingStart();
        await createProject({
            workspaceName: workspaceName,
            projectName: projectName,
            projectDescription: description,
            designerVersion: "3"
        }, {
            onOK: (data: any) => {
                if (data) {
                    handleClose(data);
                }
            },
            onError: (message) => {
                showAlert("filled", "error", message);
            }
        });
        loadingDone();
    }

    return (
        <>
            <CustomModal open={open} onClose={setClose} onTransitionEnter={handleModalEnter}>
                <CustomModalTitle title="New Project" />
                <CustomModalContents>
                    <CustomModalInfoBox>
                        <Typography variant="body2" gutterBottom>
                            <li>새로운 프로젝트를 생성합니다. 프로젝트 이름은 이름 규칙을 따르는 것을 권장 합니다.</li>
                            <li>프로젝트 삭제는 관리자 권한이 필요합니다.</li>
                        </Typography>
                        <ToggleContents title="Project Naming rules">
                            <Typography variant="body2">
                                ✅ 프로젝트 이름은 한글, 영어 대소문자, 숫자, 밑줄(_)로 시작해야 합니다.<br />
                                ✅ 프로젝트 이름에는 점(.), 짧은 선(-), 밑줄(_) 포함될 수 있습니다.<br /><br />
                                🚫 프로젝트 이름에는 공백, 특수문자가 포함할 수 없습니다.
                            </Typography>
                        </ToggleContents>
                    </CustomModalInfoBox>
                    <FormSelect required disabled={workspaceNameDisabled} formTitle="Workspace" formValue={workspaceName} 
                        onFormChanged={(value) => onWorkspaceNameChanged(value)} options={[{ value: "default", label: "default" }]} />
                    <FormText required  disabled={projectNameDisabled} formTitle="Project Name" formValue={projectName}
                        onFormChanged={(value) => onProjectNameChanged(value)} />
                    {
                        projectNameAlert && <Alert severity={projectNameAlertSeverity} variant="filled">
                            {projectNameAlertMessage}
                        </Alert>
                    }
                    <FormText disabled={descriptionDisabled} formTitle="Description" formValue={description}
                        onFormChanged={(value) => onDescriptionChanged(value)} />
                </CustomModalContents>
                <CustomModalAction>
                    <Button size="small" variant="contained" disabled={!valid} onClick={handleNewProject}>Create</Button>
                    <Button size="small" onClick={setClose}>Cancel</Button>
                </CustomModalAction>
                <CustomSnackbar open={alert} close={hideAlert} severity="error" message={alertMessage} />
                <Backdrop open={loading} invisible>
                    <CircularProgress />
                </Backdrop>
            </CustomModal>
        </>
    )
}