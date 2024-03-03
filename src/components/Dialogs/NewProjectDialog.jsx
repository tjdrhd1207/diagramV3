import React from "react"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, Modal, Stack, Typography, } from "@mui/material"
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { persist } from "zustand/middleware"
import { ToggleContents } from "../UI/Toggler";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle, DialogInfoBox } from "../UI/Dialog";
import { useLocalStore } from "../../store/LocalStore";
import { RESULT_CODE, createProject, getProjectList, openProject } from "../../api/interface";
import { parseProjectXML } from "../../api/project";
import { FormSelect, FormText } from "../UI/Form";
import { useDialogStore } from "../../store/DialogStore";

const DialogDesc = () => {
    return (
        <DialogInfoBox>
            <Typography variant="body1" gutterBottom>
                새로운 프로젝트를 생성합니다. 프로젝트 이름은 이름 규칙을 따르는 것을 권장 합니다.
            </Typography>
            <Typography variant="body2" color="orange" gutterBottom>
                ⚠️ 프로젝트 삭제는 관리자 권한이 필요합니다.
            </Typography>
            <ToggleContents
                title={"이름 규칙"}
            >
                <Box sx={{ paddingBlock: "5px" }}>
                    <Typography variant="body2">
                        ✅ 프로젝트 이름은 영어 대소문자, 숫자, 밑줄로 시작해야 합니다.<br />
                        ✅ 프로젝트 이름에는 점, 짧은 선, 더하기가 포함될 수 있습니다.<br /><br />
                        🚫 프로젝트 이름에는 공백, 특수문자가 포함할 수 없습니다.
                    </Typography>
                </Box>
            </ToggleContents>
        </DialogInfoBox>
    )
}

const formObject = (props) => {
    return {
        title: null, required: null, input: '', disabled: null, color: 'primary', helperText: null,
        ...props
    }
}

const useFormStore = create(
    persist((set, get) => ({
        workspace: formObject({ title: '워크스페이스', required: true }),
        project: formObject({ title: '프로젝트', required: true, disabled: true }),
        description: formObject({ title: '설명', required: false, disabled: true }),
        workspaceList: null,
        workspaceChanged: (event) => {
            const input = event.target.value;
            const disabled = input ? false : true;
            set({
                workspace: { ...get().workspace, input: input },
                project: { ...get().project, disabled: disabled },
                description: { ...get().description, disabled: disabled }
            });
        },
        projectChanged: (event) => {
            const input = event.target.value;
            let helperText = '', color = 'primary';
            if (input === '') {
                helperText = '🚫 이름은 필수 항목입니다.';
                color = 'error';
            }
            set(state => ({ project: { ...state.project, input: input, helperText: helperText, color: color } }))
        },
        descriptionChanged: (event) => {
            const input = event.target.value;
            set(state => ({ description: { ...state.description, input: input } }))
        },
        setWorkspaceList: (projectList) => {
            if (Array.isArray(projectList)) {
                let temp = [];
                projectList.map(project => {
                    const { workspace_name, project_name, project_id } = project;
                    const founded = temp.find((workspace => workspace.workspace_name == workspace_name));
                    if (founded) {
                        founded.project_list.push({ project_id: project_id, project_name: project_name })
                    } else {
                        temp.push({ workspace_name: workspace_name, project_list: [{ project_id: project_id, project_name: project_name }] })
                    }
                })
                set({ workspaceList: [...temp] })
            }
        }
    }),
    { name: 'new-project-dialog-storage' })
);

const NewProjectDialog = () => {
    const open = useDialogStore(state => state.showNewProjectDialog);
    const setClose = useDialogStore(state => state.closeNewProjectDialog);

    const {
        workspace, workspaceChanged,
        project, projectChanged,
        description, descriptionChanged,
        workspaceList, setWorkspaceList
    } = useFormStore(useShallow(state => state));

    const {
        projectInfo, setProjectInfo
    } = useLocalStore(useShallow(state => state));

    React.useEffect(() => {
        if (open) {
            getProjectList().then((response) => {
                setWorkspaceList(response);
            });
        }
    }, [open])

    const handleDialogClose = () => setClose();

    const handleCreateProject = () => {
        createProject(workspace.input, project.input, description.input)
            .then((response) => {
                const { result_code, error_message, data } = response;
                if (result_code && result_code == RESULT_CODE.OK) {
                    const project_id = data.project_id;
                    setProjectInfo({
                        workspace_name: workspace.input,
                        project_name: project.input,
                        project_id: project_id,
                        description: description.input
                    });
                    handleDialogClose();
                } else {
                    alert(error_message);
                }
            }).then(() => {
                openProject('prj-123123', 'IVR_SIMPLE.xml')
                    .then(response => {
                        const meta = parseProjectXML(response)
                        console.log(meta);
                        setProjectInfo({
                            project_meta: meta
                        })
                    });
            }
        );
    }

    return (
        <CustomModal open={open} onClose={handleDialogClose}>
            <CustomModalTitle title={"프로젝트 생성"}/>
            <CustomModalContents>
                <DialogDesc />
                <Stack rowGap={1} padding={"5px"}>
                    <FormSelect
                        formState={workspace}
                        onFormChanged={workspaceChanged}
                        options={workspaceList}
                    />
                    <FormText
                        formState={project}
                        onFormChanged={projectChanged}
                    />
                    <FormText
                        formState={description}
                        onFormChanged={descriptionChanged}
                    />
                </Stack>
            </CustomModalContents>
            <CustomModalAction>
                {/* <Box width="100%" paddingInline="5px">
                    <Typography variant="caption">Error Message: </Typography>
                </Box> */}
                <Button variant="contained" 
                    disabled={(workspace.input && project.input) ? false : true} 
                    onClick={handleCreateProject}
                >
                        생성
                </Button>
                <Button onClick={handleDialogClose} autoFocus>취소</Button>
            </CustomModalAction>
        </CustomModal>
    )
}

export default NewProjectDialog