"use client"

import { useDialogState } from "@/store/dialog-store"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalInfoBox, CustomModalTitle } from "../common/modal";
import { Backdrop, Button, CircularProgress, Typography } from "@mui/material";
import { ToggleContents } from "../common/toggler";
import { create } from "zustand";
import { FormSelect, FormText } from "../common/form";
import React from "react";
import { AlertState, NeedValidate } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";
import { createProject } from "@/service/fetch/crud/project";

interface NewProjectDialogState extends NeedValidate {
    workspace: string;
    onWorkspaceChanged: (value: string) => void;
    workspaceDisabled: boolean;
    project: string;
    onProjectChanged: (value: string) => void;
    projectDisabled: boolean;
    description: string;
    onDescriptionChanged: (value: string) => void;
    descriptionDisabled: boolean;
    setEnable: () => void;
    setDisable: () => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const _useNewProjectDialogState = create<NewProjectDialogState & AlertState>((set) => ({
    workspace: "default",
    onWorkspaceChanged: (value) => {
        set({ workspace: value });
        value? set({ projectDisabled: false, descriptionDisabled: false }) 
            : set({ projectDisabled: true, descriptionDisabled: true });
    },
    workspaceDisabled: false,
    project: "",
    onProjectChanged: (value) => {
        value? set({ project: value, valid: true }) : set({ project: value, valid: false });
    },
    projectDisabled: true,
    description: "",
    onDescriptionChanged: (value) => set({ description: value }),
    descriptionDisabled: true,
    setEnable: () => set({ projectDisabled: false, descriptionDisabled: false }),
    setDisable: () => set({ projectDisabled: true, descriptionDisabled: true }),
    loading: false,
    setLoading: (loading) => set({ loading: loading }),
    valid: false,
    setValid: (value) => set({ valid: value }),
    showAlert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    setShow: (variant, serverity, message) => set({ showAlert: true, variant: variant, serverity: serverity, message: message }),
    setHide: () => set({ showAlert: false })
}))

export const NewProjectDialog = (props: {
    onClose?: () => void;
}) => {
    const open = useDialogState((state) => state.showNewProjectDialog);
    const setClose = useDialogState((state) => state.closeNewProjectDialog);

    const workspace = _useNewProjectDialogState((state) => state.workspace);
    const workspaceDisabled = _useNewProjectDialogState((state) => state.workspaceDisabled);
    const onWorkspaceChanged = _useNewProjectDialogState((state) => state.onWorkspaceChanged);

    const project = _useNewProjectDialogState((state) => state.project);
    const projectDisabled = _useNewProjectDialogState((state) => state.projectDisabled);
    const onProjectChanged = _useNewProjectDialogState((state) => state.onProjectChanged);

    const description = _useNewProjectDialogState((state) => state.description);
    const descriptionDisabled = _useNewProjectDialogState((state) => state.descriptionDisabled);
    const onDescriptionChanged = _useNewProjectDialogState((state) => state.onDescriptionChanged);

    const setEnable = _useNewProjectDialogState((staet) => staet.setEnable);
    const setDisable = _useNewProjectDialogState((staet) => staet.setDisable);

    const loading = _useNewProjectDialogState((staet) => staet.loading);
    const setLoading = _useNewProjectDialogState((staet) => staet.setLoading);

    const valid = _useNewProjectDialogState((state) => state.valid);

    const showAlert = _useNewProjectDialogState((state) => state.showAlert);
    const alertMessage = _useNewProjectDialogState((state) => state.message);
    const setShow = _useNewProjectDialogState((state) => state.setShow);
    const setHide = _useNewProjectDialogState((state) => state.setHide);

    const handleModalEnter = () => {
        workspace? setEnable() : setDisable();
    }

    const handleNewProject = () => {
        setLoading(true);
        createProject({
            workspaceName: workspace,
            projectName: project,
            projectDescription: description
        }, {
            onOK: (data) => { 
                setLoading(false);
                setClose();
            },
            onError: (message) => { 
                setLoading(false);
                setClose();
            }
        });
    }

    return (
        <>
            <CustomModal open={open} onClose={setClose} onTransitionEnter={handleModalEnter}>
                <CustomModalTitle title="New Project" />
                <CustomModalContents>
                    <CustomModalInfoBox>
                        <Typography variant="body1" gutterBottom>
                            새로운 프로젝트를 생성합니다. 프로젝트 이름은 이름 규칙을 따르는 것을 권장 합니다.
                        </Typography>
                        <Typography variant="body1" color="orange" gutterBottom>
                            ⚠️ 프로젝트 삭제는 관리자 권한이 필요합니다.
                        </Typography>
                        <ToggleContents title="Project Naming rules">
                            <Typography variant="body2">
                                ✅ 프로젝트 이름은 영어 대소문자, 숫자, 밑줄로 시작해야 합니다.<br />
                                ✅ 프로젝트 이름에는 점, 짧은 선, 더하기가 포함될 수 있습니다.<br /><br />
                                🚫 프로젝트 이름에는 공백, 특수문자가 포함할 수 없습니다.
                            </Typography>
                        </ToggleContents>
                    </CustomModalInfoBox>
                    <FormSelect required disabled={workspaceDisabled} formTitle="Workspace" formValue={workspace} 
                        onFormChanged={(value) => onWorkspaceChanged(value)} options={[{ name: "default" }]} />
                    <FormText required autoFocus disabled={projectDisabled} formTitle="Project Name" formValue={project}
                        onFormChanged={(value) => onProjectChanged(value)} />
                    <FormText disabled={descriptionDisabled} formTitle="Description" formValue={description}
                        onFormChanged={(value) => onDescriptionChanged(value)} />
                </CustomModalContents>
                <CustomModalAction>
                    <Button size="small" variant="contained" disabled={!valid} onClick={handleNewProject}>Create</Button>
                    <Button size="small" onClick={setClose}>Cancel</Button>
                    <CustomSnackbar open={showAlert} close={setHide} severity="error" message={alertMessage} />
                </CustomModalAction>
                <Backdrop open={loading} invisible>
                    <CircularProgress />
                </Backdrop>
            </CustomModal>
        </>
    )
}