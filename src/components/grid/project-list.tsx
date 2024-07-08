"use client"

import { Alert, Box, Button, Snackbar, Stack } from "@mui/material";
import { CustomDataGrid } from "../common/grid";
import React from "react";
import { DataGrid, GridActionsCellItem, GridCallbackDetails, GridColDef, GridRowParams, GridToolbarContainer, GridToolbarQuickFilter, MuiEvent } from "@mui/x-data-grid";
import { CloudDone, CloudDoneTwoTone, Delete, DeleteTwoTone } from "@mui/icons-material";
import { useDialogState } from "@/store/dialog-store";
import { NewProjectDialog } from "../dialog/NewProjectDialog";
import { DeleteAlertDialog } from "../dialog/DeleteAlertDialog";
import { create } from "zustand";
import { APIResponse } from "@/consts/server-object";
import { CreateSnapshotDialog } from "../dialog/CreateSnapshotDialog";
import { getProjectInfoList } from "@/service/fetch/crud/project";
import { AlertState } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";

interface ProjectListGridState {
    rows: any[];
    loading: boolean;
    setRows: (data: any[]) => void;
    setLoading: (loading: boolean) => void;
}

const _useProjectListGridState = create<ProjectListGridState & AlertState>((set) => ({
    rows: [],
    loading: false,
    setRows: (data) => set({ rows: data }),
    setLoading: (loading) => set({ loading: loading }),
    showAlert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    setShow: (variant, serverity, message) => set({ showAlert: true, variant: variant, serverity: serverity, message: message }),
    setHide: () => set({ showAlert: false })
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

interface DeleteAlertStore {
    open: boolean;
    projectName: string;
    setOpen: (name: string) => void;
    setClose: () => void;
};

const _useDeleteAlertStore = create<DeleteAlertStore>((set, get) => ({
    open: false,
    projectName: "",
    setOpen: (name) => set({ open: true, projectName: name }),
    setClose: () => set({ open: false })
}));

interface ProjectIDStore {
    id: string;
    setID: (id: string) => void;
}

const _useProjectIDStore = create<ProjectIDStore>((set) => ({
    id: "",
    setID: (id) => set({ id: id })
}))

export const ProjectListGrid = () => {
    const rows = _useProjectListGridState((state) => state.rows);
    const setRows = _useProjectListGridState((state) => state.setRows);
    const loading = _useProjectListGridState((state) => state.loading);
    const setLoading = _useProjectListGridState((state) => state.setLoading);

    const showAlert = _useProjectListGridState((state) => state.showAlert);
    const alertMessage = _useProjectListGridState((state) => state.message);
    const setShow = _useProjectListGridState((state) => state.setShow);
    const setHide = _useProjectListGridState((state) => state.setHide);

    const openNewProjectDialog = useDialogState((state) => state.openNewProjectDialog);
    
    const projectID = _useProjectIDStore((state) => state.id);
    const setProjectID = _useProjectIDStore((state) => state.setID);

    const openDeleteAlert = _useDeleteAlertStore((state) => state.open);
    const projectName = _useDeleteAlertStore((state) => state.projectName);
    const setOpenDeleteAlert = _useDeleteAlertStore((state) => state.setOpen);
    const setCloseDeleteAlert = _useDeleteAlertStore((state) => state.setClose);

    const openCreateShapshot = _useCreatSnapshotStore((state) => state.open);
    const setOpenCreateSnapshot = _useCreatSnapshotStore((state) => state.setOpen);
    const setCloseCreateSnapshot = _useCreatSnapshotStore((state) => state.setClose);

    const updateProjectList = () => {
        setLoading(true);
        getProjectInfoList({
            onOK: (data: any) => {
                const { projectInfos } = data;
                let forGrid: any[] = [];
                projectInfos.map((row: any) => {
                    const { workspaceName, projectName, projectID, projectDescription } = row;
                    forGrid.push({
                        workspaceName: workspaceName,
                        projectName: projectName,
                        projectID: projectID,
                        projectDescription: projectDescription,
                        lastModified: undefined
                    });
                })
                setRows(forGrid);
                setLoading(false);
            },
            onError: (message: any) => {
                setShow("filled", "error", message);
                setLoading(false);
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
        fetch(`/api/snapshot/${projectID}?action=create`, {
                method: "POST",
                body: JSON.stringify({
                    project_version: version,
                    snapshot_description: description
                })
            }).then((response) => response.json())
            .then((json) => {
                const apiResponse: APIResponse = json;
                if (apiResponse.result === "OK") {
                    updateProjectList();
                };
            }).finally(() => setCloseCreateSnapshot());
    }

    const handleDeleteProject = () => {
        fetch(`/api/project/${projectID}?action=delete`, { method: "POST" })
            .then((response) => response.json())
            .then((json) => {
                const apiResponse: APIResponse = json;
                if (apiResponse.result === "OK") {
                    updateProjectList();
                };
            }).finally(() => setCloseDeleteAlert());
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
                return [
                    <GridActionsCellItem
                        icon={<CloudDoneTwoTone color="info" fontSize="small" />}
                        label="snapshot"
                        onClick={() => {
                            setProjectID(projectID);
                            setOpenCreateSnapshot();
                        }}
                    />,
                    <GridActionsCellItem
                        icon={<DeleteTwoTone color="error" fontSize="small" />}
                        label="delete"
                        onClick={() => {
                            setProjectID(projectID);
                            setOpenDeleteAlert(projectName);
                        }}
                    />
                ]
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
                        <Stack direction="row" width="100%">
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
            <CustomSnackbar open={showAlert} close={setHide} severity="error" message={alertMessage} />
            <NewProjectDialog onClose={updateProjectList} />
            <DeleteAlertDialog
                open={openDeleteAlert}
                title={"Delete Project"}
                target={projectName}
                onClose={() => setCloseDeleteAlert()}
                onDelete={() => handleDeleteProject()}
            />
            <CreateSnapshotDialog
                open={openCreateShapshot}
                onClose={() => setCloseCreateSnapshot()}
                onCreate={(version, description) => handleCreateSnapshot(version, description)}
            />
        </Box>
    )
}