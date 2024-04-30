"use client"

import { Box, Button, Stack } from "@mui/material";
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
    const [rows, setRows] = React.useState<Array<object>>([]);
    const [loading, setLoading] = React.useState(false);
    // const [ openAlert, setOpenAlert ] = React.useState({ open: false, title: "Delete Project", project_id: "", project_name: "" });

    const openNewProjectDialog = useDialogState((state) => state.openNewProjectDialog);
    
    const projectID = _useProjectIDStore((state) => state.id);
    const setProjectID = _useProjectIDStore((state) => state.setID);

    const openDeleteAlert = _useDeleteAlertStore((state) => state.open);
    const project_name = _useDeleteAlertStore((state) => state.projectName);
    const setOpenDeleteAlert = _useDeleteAlertStore((state) => state.setOpen);
    const setCloseDeleteAlert = _useDeleteAlertStore((state) => state.setClose);

    const openCreateShapshot = _useCreatSnapshotStore((state) => state.open);
    const setOpenCreateSnapshot = _useCreatSnapshotStore((state) => state.setOpen);
    const setCloseCreateSnapshot = _useCreatSnapshotStore((state) => state.setClose);

    const updateProjectList = () => {
        setLoading(true);
        fetch("/api/project").then((response) => response.json()).then((json) => {
            let forGrid: Array<object> = [];
            const { rows } = json;
            rows.map((row: any) => {
                forGrid.push({
                    workspace_name: row.WORKSPACE_NAME,
                    project_name: row.PROJECT_NAME,
                    project_id: row.PROJECT_ID,
                    project_description: row.PROJECT_DESCRIPTION,
                    last_modified: new Date(row.UPDATE_DATE + ' ' + row.UPDATE_TIME)
                })
            })
            setRows(forGrid);
            setLoading(false);
        });
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
        { field: 'workspace_name', headerName: 'Workspace', headerAlign: "center", flex: 0.1 },
        { field: 'project_name', headerName: 'Name', headerAlign: "center", flex: 0.1 },
        { field: 'project_id', headerName: 'ID', headerAlign: "center", flex: 0.2 },
        { field: 'project_description', headerName: 'Description', headerAlign: "center", flex: 0.3 },
        { field: 'last_modified', type: 'dateTime', headerName: 'Last Modified', headerAlign: "center", flex: 0.2 },
        {
            field: "actions", type: "actions", headerName: "Actions", headerAlign: "center", flex: 0.1, cellClassName: "actions", getActions: (params) => {
                const { row } = params;
                const { project_id, project_name } = row;
                return [
                    <GridActionsCellItem
                        icon={<CloudDoneTwoTone color="info" fontSize="small" />}
                        label="snapshot"
                        onClick={() => {
                            setProjectID(project_id);
                            setOpenCreateSnapshot();
                        }}
                    />,
                    <GridActionsCellItem
                        icon={<DeleteTwoTone color="error" fontSize="small" />}
                        label="delete"
                        onClick={() => {
                            setProjectID(project_id);
                            setOpenDeleteAlert(project_name);
                        }}
                    />
                ]
            },
        },
    ];

    const handleRowSelected = (params: GridRowParams, event: MuiEvent, details: GridCallbackDetails) => {
        if (params) {
            const { row } = params;
            const { project_id } = row;
            setProjectID(project_id);

            console.log(project_id);
        }
    }

    return (
        <Box width="100%" height="100%" padding="5px">
            <CustomDataGrid 
                columns={columns}
                rows={rows}
                getRowId={(row) => row.project_id}
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
            <NewProjectDialog onClose={updateProjectList} />
            <DeleteAlertDialog
                open={openDeleteAlert}
                title={"Delete Project"}
                target={project_name}
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