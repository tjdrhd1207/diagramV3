"use client"

import { Alert, Box, Button, Snackbar, Stack } from "@mui/material";
import { CustomDataGrid } from "../common/grid";
import React from "react";
import { DataGrid, GridActionsCellItem, GridCallbackDetails, GridColDef, GridRowParams, GridToolbarContainer, GridToolbarQuickFilter, MuiEvent } from "@mui/x-data-grid";
import { CloudDone, CloudDoneTwoTone, Delete, DeleteTwoTone } from "@mui/icons-material";
import { useDialogState } from "@/store/dialog-store";
import { NewProjectDialog } from "../dialog/NewProjectDialog";
import { DeleteProjectDialog, DeleteProjectDialogStore } from "../dialog/DeleteProjectDialog";
import { create } from "zustand";
import { APIResponse } from "@/consts/server-object";
import { CreateSnapshotDialog } from "../dialog/CreateSnapshotDialog";
import { deleteProject, getProjectInfos } from "@/service/fetch/crud/project";
import { AlertState, LoadingState } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";

interface ProjectListGridStore {
    rows: any[];
    setRows: (data: any[]) => void;
    projectID: string | undefined;
    setProjectID: (projectID: string) => void;
}

const _useProjectListGridStore = create<ProjectListGridStore & LoadingState & AlertState>((set) => ({
    rows: [],
    setRows: (data) => set({ rows: data }),
    projectID: undefined,
    setProjectID: (projectID) => set({ projectID: projectID }),
    loading: false,
    loadingStart: () => set({ loading: true }),
    loadingDone: () => set({ loading: false }),
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false })
}))

interface CreateSnapShotStore {
    open: boolean;
    setOpen: () => void;
    setClose: () => void;
}

const _useCreatSnapshotStore = create<CreateSnapShotStore>((set) => ({
    open: false,
    setOpen: () => set({ open: true }),
    setClose: () => set({ open: false })
}))

const _useDeleteProjectDialogStore = create<DeleteProjectDialogStore>((set) => ({
    open: false,
    projectID: undefined,
    openDialog: (projectID, projectName) => set({ open: true, projectID: projectID }),
    closeDialog: () => set({ open: false })
}));

export const ProjectListGrid = () => {
    const rows = _useProjectListGridStore((state) => state.rows);
    const setRows = _useProjectListGridStore((state) => state.setRows);
    const loading = _useProjectListGridStore((state) => state.loading);
    const loadingStart = _useProjectListGridStore((state) => state.loadingStart);
    const loadingDone = _useProjectListGridStore((state) => state.loadingDone);

    const alert = _useProjectListGridStore((state) => state.alert);
    const alertMessage = _useProjectListGridStore((state) => state.message);
    const showAlert = _useProjectListGridStore((state) => state.showAlert);
    const hideAlert = _useProjectListGridStore((state) => state.hideAlert);

    const openNewProjectDialog = useDialogState((state) => state.openNewProjectDialog);
    
    const projectID = _useProjectListGridStore((state) => state.projectID);
    const setProjectID = _useProjectListGridStore((state) => state.setProjectID);

    const showDeleteProjectDialog = _useDeleteProjectDialogStore((state) => state.open);
    const projectIDforDelete = _useDeleteProjectDialogStore((state) => state.projectID);
    const openDeleteProjectDialog = _useDeleteProjectDialogStore((state) => state.openDialog);
    const closeDeleteProjectDialog = _useDeleteProjectDialogStore((state) => state.closeDialog);

    const openCreateShapshot = _useCreatSnapshotStore((state) => state.open);
    const setOpenCreateSnapshot = _useCreatSnapshotStore((state) => state.setOpen);
    const setCloseCreateSnapshot = _useCreatSnapshotStore((state) => state.setClose);

    const updateProjectList = () => {
        loadingStart();
        getProjectInfos({
            onOK: (data: any) => {
                const { projectInfos } = data;
                let forGrid: any[] = [];
                projectInfos.map((row: any) => {
                    const { workspaceName, projectName, projectID, projectDescription,
                            updateDate, updateTime } = row;
                    forGrid.push({
                        workspaceName: workspaceName,
                        projectName: projectName,
                        projectID: projectID,
                        projectDescription: projectDescription,
                        lastModified: new Date(updateDate + " " + updateTime)
                    });
                })
                setRows(forGrid);
                loadingDone();
            },
            onError: (message: any) => {
                showAlert("filled", "error", message);
                loadingDone();
            }
        })
    }

    React.useEffect(() => {
        updateProjectList();
    }, []);

    const handleNewProject = () => {
        openNewProjectDialog();
    }

    const handleCreateSnapshot = (version: string, description: string) => {
        // fetch(`/api/snapshot/${projectID}?action=create`, {
        //         method: "POST",
        //         body: JSON.stringify({
        //             project_version: version,
        //             snapshot_description: description
        //         })
        //     }).then((response) => response.json())
        //     .then((json) => {
        //         const apiResponse: APIResponse = json;
        //         if (apiResponse.result === "OK") {
        //             // updateProjectList();
        //         };
        //     }).finally(() => setCloseCreateSnapshot());
    }

    const columns: Array<GridColDef> = [
        { field: "workspaceName", headerName: "Workspace", headerAlign: "center", align: "center", flex: 0.1 },
        { field: "projectName", headerName: "Name", headerAlign: "center", flex: 0.1 },
        { field: "projectID", headerName: "ID", headerAlign: "center", flex: 0.2 },
        { field: "projectDescription", headerName: "Description", headerAlign: "center", flex: 0.3 },
        { field: "lastModified", type: "dateTime", headerName: 'Last Modified', headerAlign: "center", flex: 0.2 },
        {
            field: "actions", type: "actions", headerName: "Actions", headerAlign: "center", flex: 0.1, cellClassName: "actions", getActions: (params) => {
                const { row } = params;
                const { projectID, projectName } = row;
                if (projectID && projectName) {
                    return [
                        <GridActionsCellItem
                            icon={<CloudDoneTwoTone color="info" fontSize="small" />}
                            label="snapshot"
                            onClick={() => {
                                setOpenCreateSnapshot();
                            }}
                        />,
                        <GridActionsCellItem
                            icon={<DeleteTwoTone color="error" fontSize="small" />}
                            label="delete"
                            onClick={() => openDeleteProjectDialog(projectID, projectName)}
                        />
                    ];
                } else {
                    return [];
                }
            },
        },
    ];

    const handleRowSelected = (params: GridRowParams, event: MuiEvent, details: GridCallbackDetails) => {
        if (params) {
            const { row } = params;
            const { projectID } = row;
            setProjectID(projectID);
        }
    }

    return (
        <Box width="100%" height="100%" padding="5px">
            <CustomDataGrid
                columns={columns}
                rows={rows}
                getRowId={(row) => row.projectID}
                onRowClick={handleRowSelected}
                customToolbar={() => 
                    <GridToolbarContainer sx={{ width: "100%" }}>
                        <Stack direction="row" width="100%" padding="5px">
                            <Box width="50%">
                                <GridToolbarQuickFilter fullWidth />
                            </Box>
                            <Stack direction="row" justifyContent="end" width="100%" gap={1}>
                                <Button variant="outlined" size="small" disabled>New Workspace</Button>
                                <Button variant="outlined" size="small" onClick={handleNewProject}>New Project</Button>
                                <Button variant="outlined" size="small" color="success" 
                                    disabled={!projectID? true : false} href={`/designer?id=${projectID}`}
                                >
                                    Open Project
                                </Button>
                            </Stack>
                        </Stack>
                    </GridToolbarContainer>
                }
                loading={loading}
            />
            <CustomSnackbar open={alert} close={hideAlert} severity="error" message={alertMessage} />
            <NewProjectDialog onOK={updateProjectList} />
            <DeleteProjectDialog
                open={showDeleteProjectDialog}
                projectID={projectIDforDelete}
                onClose={() => closeDeleteProjectDialog()}
                onDelete={() => updateProjectList()}
            />
            <CreateSnapshotDialog
                open={openCreateShapshot}
                onClose={() => setCloseCreateSnapshot()}
                onCreate={(version, description) => handleCreateSnapshot(version, description)}
            />
        </Box>
    )
}