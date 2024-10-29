"use client"

import { useDialogState } from "@/store/dialog-store"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalInfoBox, CustomModalTitle } from "../common/modal";
import { Box, Button, Skeleton, Tab, Tabs, Typography } from "@mui/material";
import { create } from "zustand";
import { TabPanel } from "../common/tab";
import { CustomDataGrid } from "../common/grid";
import React from "react";
import { GridCallbackDetails, GridColDef, GridRowParams, GridToolbarContainer, GridToolbarQuickFilter, MuiEvent } from "@mui/x-data-grid";
import { XMLParser } from "fast-xml-parser";
import { FlowInfo, useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";
import { AlertState, LoadingState, TabState } from "@/store/_interfaces";
import { getFlowNames, getProjectInfos } from "@/service/fetch/crud/project";
import { CustomSnackbar } from "../custom-snackbar";

const dev_columns: GridColDef[] = [
    { field: 'workspaceName', headerName: 'Workspace', flex: 0.3 },
    { field: 'projectName', headerName: 'Name', flex: 0.5 },
    { field: 'projectID', headerName: 'ID', flex: 0.5 },
    { field: 'projectDescription', headerName: 'Description', flex: 1 },
    { field: 'lastModified', type: 'dateTime', headerName: 'Last Modified', flex: 0.7 },
];

const snapshot_colums = [
    { field: 'workspaceName', headerName: '워크스페이스', flex: 0.3 },
    { field: 'projectName', headerName: '이름', flex: 0.5 },
    { field: 'project_version', headerName: '버전', flex: 0.3 },
    { field: 'create_datetime', type: 'dateTime', headerName: '생성 일시', flex: 0.5 },
    { field: 'description', headerName: '설명', flex: 0.5 },
    { field: 'scenario_key', headerName: '시나리오 키', flex: 0.3 },
]

const useTabState = create<TabState>((set) => ({
    tab: 0,
    setTab: (value) => set({ tab: value })
}))

interface ProjectData {
    workspaceName: string,
    projectName: string,
    projectID: string,
    lastModified: Date,
    description: string
}

interface OpenProjectDialogState {
    projects: Array<object>,
    setProjects: (list: Array<object>) => void
    snapshots: Array<object>,
    setSnapshots: (list: Array<object>) => void,
    rowData: ProjectData | undefined,
    setRowData: (row: ProjectData | undefined) => void
}

const _useOpenProjectDialogState = create<OpenProjectDialogState & LoadingState & AlertState>((set) => ({
    projects: [],
    setProjects: (list) => set({ projects: [...list] }),
    snapshots: [],
    setSnapshots: (list) => set({ snapshots: [...list] }),
    loading: false,
    loadingStart: () => set({ loading: true }),
    loadingDone: () => set({ loading: false }),
    rowData: undefined,
    setRowData: (row) => set({ rowData: row }),
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false })
}))

interface OpenProjectDialogProps {
    onOK?: (projectID: string | undefined, projectName: string | undefined) => void;
}

export const OpenProjectDialog = (props: OpenProjectDialogProps) => {
    const { onOK } = props;
    const open = useDialogState((state) => state.showOpenProjectDialog);
    const setClose = useDialogState((state) => state.closeOpenProjectDialog);

    const tab = useTabState((state) => state.tab);
    const setTab = useTabState((state) => state.setTab);

    const projects = _useOpenProjectDialogState((state) => state.projects);
    const setProjects = _useOpenProjectDialogState((state) => state.setProjects);

    const loading = _useOpenProjectDialogState((state) => state.loading);
    const loadingStart = _useOpenProjectDialogState((state) => state.loadingStart);
    const loadingDone = _useOpenProjectDialogState((state) => state.loadingDone);

    const alert = _useOpenProjectDialogState((state) => state.alert);
    const alertMessage = _useOpenProjectDialogState((state) => state.message);
    const showAlert = _useOpenProjectDialogState((state) => state.showAlert);
    const hideAlert = _useOpenProjectDialogState((state) => state.hideAlert);

    const rowData = _useOpenProjectDialogState((state) => state.rowData);
    const setRowData = _useOpenProjectDialogState((state) => state.setRowData);

    const updateProjects = () => {
        loadingStart();
        getProjectInfos({
            onOK: (data: any) => {
                const { projectInfos } = data;
                let forGrid: any[] = [];
                projectInfos.map((row: any) => {
                    const { workspaceName, projectName, projectID, projectDescription,
                        updateDate, updateTime } = row;
                    if (workspaceName && projectName && projectID && projectDescription) {
                        forGrid.push({
                            workspaceName: workspaceName,
                            projectName: projectName,
                            projectID: projectID,
                            projectDescription: projectDescription,
                            lastModified: new Date(updateDate + " " + updateTime)
                        });
                    }
                })
                setProjects(forGrid);
                loadingDone();
            },
            onError: (message: any) => {
                showAlert("filled", "error", message);
                loadingDone();
            }
        })
    }

    const handleTabChanged = (event: React.SyntheticEvent<Element, Event>, value: any) => {
        setTab(value);
        setRowData(undefined);
    }

    const handleRowSelected = (params: GridRowParams, event: MuiEvent, details: GridCallbackDetails) => {
        params.row && setRowData(params.row);
    }

    const handleOpenProject = () => {
        if (rowData) {
            const { projectID, projectName } = rowData;
            if (projectID && projectName) {
                // loadingStart();
                // getFlowNames(projectID, {
                //     onOK: (data) => {},
                //     onError: (message) => {
                //         showAlert("filled", "error", message);
                //         loadingDone();
                //     }
                // })
                if (onOK) {
                    onOK(projectID, projectName);
                }
                setClose();
            }
        }
    }

    // const handleExportProject = () => {
    //     const project_id = rowData?.project_id;
    //     const project_name = rowData?.project_name;
    //     if (project_id && project_name) {
    //         const url = `/api/project/${project_id}?action=export`
    //         fetch(url, {
    //             method: "POST",
    //             cache: "no-cache",
    //         }).then((response) => response.blob()).then((blob) => {
    //             const url = window.URL.createObjectURL(new Blob([blob]));
    //             const link = document.createElement('a');
    //             link.href = url;
    //             link.setAttribute('download', 'export.zip');
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);
    //         }).catch(error => console.error('파일 가져오기 중 오류:', error));
    //     }
    // }

    return (
        <CustomModal open={open} onClose={setClose} onTransitionEnter={updateProjects}>
            <CustomModalTitle title="Open Project" />
            <CustomModalContents>
                <CustomModalInfoBox>
                    <Typography variant="body1">
                        편집할 프로젝트를 선택합니다.
                    </Typography>
                    <Typography variant="body2" color="green">
                        ✅ 프로젝트 권한에 따라 목록에 표시되지 않을 수 있습니다.
                    </Typography>
                </CustomModalInfoBox>
                <Tabs variant="fullWidth" value={tab} onChange={handleTabChanged}>
                    <Tab label="Dev version" />
                    <Tab label="Snapshot version" />
                </Tabs>
                <TabPanel reMount state={tab} value={0} sx={{ width: "50vw", height: "50vh" }}>
                    <CustomDataGrid 
                        columns={dev_columns}
                        rows={projects}
                        getRowId={(row) => row.projectID}
                        onRowClick={handleRowSelected}
                        loading={loading}
                        customToolbar={(props) => 
                            <GridToolbarContainer sx={{ width: "100%" }}>
                                <Box width="25%" padding="5px">
                                    <GridToolbarQuickFilter fullWidth />
                                </Box>
                            </GridToolbarContainer>
                        }
                    />
                </TabPanel>
                <TabPanel reMount state={tab} value={1} sx={{ width: "50vw", height: "50vh" }}>
                    <Skeleton variant="rounded" width="100%" height="100%" />
                </TabPanel>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" disabled={!rowData} onClick={handleOpenProject}>OK</Button>
                {/* <Button size="small" disabled={!rowData} onClick={handleExportProject}>Export</Button> */}
                <Button size="small" onClick={setClose}>Cancel</Button>
            </CustomModalAction>
            <CustomSnackbar open={alert} close={hideAlert} severity="error" message={alertMessage} />
        </CustomModal>
    )
}