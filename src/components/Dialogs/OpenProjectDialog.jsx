import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, FormControl, FormControlLabel, FormLabel, Modal, Radio, RadioGroup, Stack, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import { TabPanel } from "../UI/Tab";
import { QuickFilteredDataGrid } from "../UI/CustomDataGrid";
import { DialogInfoBox } from "../UI/Dialog";
import { getProjectList, getSnapshotList } from "../../api/interface";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow"
import { useDialogStore } from "../../store/DialogStore";
import { dialogStyle } from "./Styles";

const now_columns = [
    { field: 'workspace_name', headerName: '워크스페이스', flex: 0.3 },
    { field: 'project_name', headerName: '이름', flex: 0.5 },
    { field: 'project_id', headerName: 'ID', flex: 0.3 },
    { field: 'description', headerName: '설명', flex: 1 },
    { field: 'last_modified', type: 'dateTime', headerName: '최종 수정', flex: 0.5 },
];

const snapshot_colums = [
    { field: 'workspace_name', headerName: '워크스페이스', flex: 0.3 },
    { field: 'project_name', headerName: '이름', flex: 0.5 },
    { field: 'project_version', headerName: '버전', flex: 0.3 },
    { field: 'create_datetime', type: 'dateTime', headerName: '생성 일시', flex: 0.5 },
    { field: 'description', headerName: '설명', flex: 0.5 },
    { field: 'scenario_key', headerName: '시나리오 키', flex: 0.3 },
]

const DialogDesc = () => {
    return (
        <DialogInfoBox>
            <Typography variant="body1">
                편집할 프로젝트를 선택합니다.
            </Typography>
            <Typography variant="body2" color="green">
                ✅ 프로젝트 권한에 따라 목록에 표시되지 않을 수 있습니다.
            </Typography>
        </DialogInfoBox>
    )
}

const useProjectStore = create(set => ({
    projectList: [],
    snapshotList: [],
    tabValue: 0,
    targetProject: { project_id: null, project_version: null },
    setProjectList: (list) => set({ projectList: [...list] }),
    setSnapshotList: (list) => set({ snapshotList: [...list] }),
    setTabValue: (value) => set({ tabValue: value }),
    setTargetProject: (id, ver) => set({ targetProject: { project_id: id, project_version: ver } })
}));

const OpenProjectDialog = () => {
    const open = useDialogStore(state => state.showOpenProjectDialog);
    const setClose = useDialogStore(state => state.closeOpenProjectDialog);

    const {
        projectList, setProjectList,
        snapshotList, setSnapshotList,
        tabValue, setTabValue,
        targetProject, setTargetProject,
    } = useProjectStore(useShallow(state => state));

    const handleDialogClose = () => setClose();

    const handleTabChange = (event, value) => {
        setTabValue(value);
        setTargetProject(null, null);
    }

    const handleRowClick = (selected) => {
        if (tabValue === 0) {
            setTargetProject(selected.row.project_id, null);
        } else {
            setTargetProject(selected.row.project_id, selected.row.project_version);
        }
    }

    const handleOpenProject = () => {
        alert('OpenProject;' + JSON.stringify(targetProject));
        setClose();
    }

    const updateProjects = () => {
        let forGrid = [];
        getProjectList().then(response => {
            response.map(e => {
                forGrid.push({
                    workspace_name: e.workspace_name,
                    project_name: e.project_name,
                    project_id: e.project_id,
                    last_modified: new Date(e.update_date + ' ' + e.update_time),
                    description: e.description
                })
            });
            setProjectList(forGrid);
        })
    }

    const updateSnapshots = () => {
        let forGrid = [];
        getSnapshotList().then(response => {
            response.map(e => {
                forGrid.push({
                    workspace_name: e.workspace_name,
                    project_name: e.project_name,
                    project_id: e.project_id,
                    project_version: e.project_version,
                    create_datetime: new Date(e.create_date + ' ' + e.create_time),
                    description: e.description,
                    scenario_key: e.scenario_key
                })
            });
            setSnapshotList(forGrid);
        })
    }

    React.useEffect(() => {
        if (open) {
            updateProjects();
            updateSnapshots();
        }
    }, [open])

    return (
        // <Modal open={open} onClose={handleDialogClose}>
        //     <Fade in={open}>
        //         <Box sx={dialogStyle}>
        //             <Typography variant="h6" component="h2">
        //                 프로젝트 열기
        //             </Typography>
        //         </Box>
        //         <Stack gap={1} paddingBlock={1}>

        //         </Stack>
        //     </Fade>
        // </Modal>
        <Dialog
            open={open}
            onClose={handleDialogClose}
            maxWidth="xl"
            fullWidth
        >
            <DialogTitle id="open-project-dialog-title">
                프로젝트 열기
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Stack gap={1}>
                    <DialogDesc />
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        textColor="secondary"
                        indicatorColor="secondary"
                    >
                        <Tab label="현재 버전" />
                        <Tab label="스냅샷 버전" />
                    </Tabs>
                    <TabPanel value={tabValue} index={0}>
                        <QuickFilteredDataGrid
                            columns={now_columns}
                            rows={projectList}
                            getRowId={(row) => row.project_id}
                            onRowClick={handleRowClick}
                            sx={{ height: "50vh" }}
                        />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <Stack
                            rowGap={2}
                            sx={{ height: "50vh" }}
                        >
                            <QuickFilteredDataGrid
                                columns={snapshot_colums}
                                rows={snapshotList}
                                getRowId={(row) => { return row.project_name + "-" + row.project_version; }}
                                onRowClick={handleRowClick}
                            />
                            <FormControl>
                                <FormLabel>열기 옵션</FormLabel>
                                <RadioGroup
                                    row
                                    defaultValue={"readonly"}
                                >
                                    <FormControlLabel value="readonly" control={<Radio size="small" />} label="읽기 전용" />
                                    <FormControlLabel value="restore" control={<Radio size="small" color="error" />} label="되돌리기" />
                                </RadioGroup>
                            </FormControl>
                        </Stack>
                    </TabPanel>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disabled={!targetProject.project_id} onClick={handleOpenProject}>열기</Button>
                <Button autoFocus onClick={setClose}>취소</Button>
            </DialogActions>
        </Dialog>
    )
}

export default OpenProjectDialog