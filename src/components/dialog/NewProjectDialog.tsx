"use client"

import { useDialogState } from "@/store/dialog-store"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalInfoBox, CustomModalTitle } from "../common/modal";
import { Button, Stack, Typography } from "@mui/material";
import { ToggleContents } from "../common/toggler";
import { create } from "zustand";
import { FormSelect, FormText } from "../common/form";
import React from "react";
import { NeedValidate } from "@/store/_interfaces";
import { NewProjectRequest, NewProjectResponse } from "@/consts/server-object";
import { FetchResultDialog } from "./FetchResultDialog";

interface InputState extends NeedValidate {
    workspace: string,
    onWorkspaceChanged: (value: string) => void,
    workspaceDisabled: boolean,
    project: string,
    onProjectChanged: (value: string) => void,
    projectDisabled: boolean,
    description: string,
    onDescriptionChanged: (value: string) => void,
    descriptionDisabled: boolean,
    setEnable: () => void,
    setDisable: () => void
}

const _useInputState = create<InputState>((set) => ({
    workspace: "default",
    onWorkspaceChanged: (value) => {
        set({ workspace: value });
        value? set({ projectDisabled: false, descriptionDisabled: false}) 
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
    valid: false,
    setValid: (value) => set({ valid: value })
}))

export const NewProjectDialog = (props: {
    onClose?: () => void;
}) => {
    const open = useDialogState((state) => state.showNewProjectDialog);
    const setClose = useDialogState((state) => state.closeNewProjectDialog);

    const workspace = _useInputState((state) => state.workspace);
    const workspaceDisabled = _useInputState((state) => state.workspaceDisabled);
    const onWorkspaceChanged = _useInputState((state) => state.onWorkspaceChanged);

    const project = _useInputState((state) => state.project);
    const projectDisabled = _useInputState((state) => state.projectDisabled);
    const onProjectChanged = _useInputState((state) => state.onProjectChanged);

    const description = _useInputState((state) => state.description);
    const descriptionDisabled = _useInputState((state) => state.descriptionDisabled);
    const onDescriptionChanged = _useInputState((state) => state.onDescriptionChanged);

    const setEnable = _useInputState((staet) => staet.setEnable);
    const setDisable = _useInputState((staet) => staet.setDisable);

    const valid = _useInputState((state) => state.valid);

    const [ openAlert, setOpenAlert ] = React.useState<{open: boolean, response: NewProjectResponse | undefined}>();

    const handleModalEnter = () => {
        workspace? setEnable() : setDisable();
    }

    const handleAlertClose = () => {
        setOpenAlert({ open: false, response: openAlert?.response});
        setClose();

        if (props.onClose) {
            props.onClose();
        }
    }

    const handleNewProject = () => {
        const url = "/api/project?action=create";
        const newProject: NewProjectRequest = {
            workspace_name: workspace,
            project_name: project,
            description: description
        } 
        fetch(url, {
             method: "POST",
             body: JSON.stringify(newProject)
        }).then((response) => response.json()).then((json) => {
            const temp: NewProjectResponse = json;
            console.log(temp.result, temp.message, temp.rows.project_id); 
            setOpenAlert({ open: true, response: temp });
        });
        // setClose();
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
                    <FormText required disabled={projectDisabled} formTitle="Project Name" formValue={project}
                        onFormChanged={(value) => onProjectChanged(value)} />
                    <FormText disabled={descriptionDisabled} formTitle="Description" formValue={description}
                        onFormChanged={(value) => onDescriptionChanged(value)} />
                </CustomModalContents>
                <CustomModalAction>
                    <Button size="small" variant="contained" disabled={!valid} onClick={handleNewProject}>Create</Button>
                    <Button size="small" onClick={setClose}>Cancel</Button>
                </CustomModalAction>
            </CustomModal>
            <FetchResultDialog open={openAlert?.open} onClose={handleAlertClose} 
                title="Information" result={openAlert?.response?.result}
            >
                {
                    openAlert && 
                        <Stack>
                            <Typography variant="body2">{openAlert.response?.message}</Typography>
                        </Stack>
                }
            </FetchResultDialog>
        </>
    )
}