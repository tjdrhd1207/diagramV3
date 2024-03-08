"use client"

import { useDialogState } from "@/store/dialog-store"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalInfoBox, CustomModalTitle } from "../common/modal";
import { Button, Typography } from "@mui/material";
import { ToggleContents } from "../common/toggler";
import { create } from "zustand";
import { FormSelect, FormText } from "../common/form";
import React from "react";

interface InputState {
    workspace: string,
    onWorkspaceChanged: (value: string) => void,
    workspaceDisabled: boolean,
    project: string,
    onProjectChanhed: (value: string) => void,
    projectDisabled: boolean,
    description: string,
    onDescriptionChanged: (value: string) => void,
    descriptionDisabled: boolean,
}

const useInputState = create<InputState>((set) => ({
    workspace: "",
    onWorkspaceChanged: (value) => {
        set({ workspace: value });
        value? set({ projectDisabled: false, descriptionDisabled: false}) : set({ projectDisabled: true, descriptionDisabled: true });
    },
    workspaceDisabled: false,
    project: "",
    onProjectChanhed: (value) => set(() => ({ project: value })),
    projectDisabled: true,
    description: "",
    onDescriptionChanged: (value) => set(() => ({ description: value })),
    descriptionDisabled: true,
}))

export const NewProjectDialog = () => {
    const open = useDialogState((state) => state.showNewProjectDialog);
    const setClose = useDialogState((state) => state.closeNewProjectDialog);

    const workspace = useInputState((state) => state.workspace);
    const workspaceDisabled = useInputState((state) => state.workspaceDisabled);
    const onWorkspaceChanged = useInputState((state) => state.onWorkspaceChanged);

    const project = useInputState((state) => state.project);
    const projectDisabled = useInputState((state) => state.projectDisabled);
    const onProjectChanged = useInputState((state) => state.onProjectChanhed);

    const description = useInputState((state) => state.description);
    const descriptionDisabled = useInputState((state) => state.descriptionDisabled);
    const onDescriptionChanged = useInputState((state) => state.onDescriptionChanged);

    const handleNewProject = () => {
        const url = "api/project?action=create";
        fetch(url, {
             method: "POST",
             body: JSON.stringify({ workspace_name: "default", project_name: "DEMO", description: "" })
        }).then((response) => response.json()).then((json) => {
            console.log(json);
        })
        // setClose();
    }

    return (
        <CustomModal open={open} onClose={setClose}>
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
                    onFormChanged={(value) => onWorkspaceChanged(value)} options={[{ name: "a" }]} />
                <FormText required disabled={projectDisabled} formTitle="Project Name" formValue={project}
                    onFormChanged={(value) => onProjectChanged(value)} />
                <FormText disabled={descriptionDisabled} formTitle="Description" formValue={description}
                    onFormChanged={(value) => onDescriptionChanged(value)} />
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" onClick={handleNewProject}>OK</Button>
                <Button size="small" onClick={setClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}