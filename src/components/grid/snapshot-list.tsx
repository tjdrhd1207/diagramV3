import { GridActionsCellItem, GridCallbackDetails, GridColDef, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import React from "react";
import { create } from "zustand";
import { CustomDataGrid } from "../common/grid";
import { ToggleOffTwoTone, ToggleOnTwoTone } from "@mui/icons-material";
import { Box, Button, Stack } from "@mui/material";
import { APIResponse } from "@/consts/server-object";

interface DeleteAlertProps {
    open: boolean;
    setOpen: () => void;
    setClose: () => void;
};

const _useDeleteAlertProps = create<DeleteAlertProps>((set, get) => ({
    open: false,
    setOpen: () => set({ open: true }),
    setClose: () => set({ open: false })
}));

interface SnapshotInfoStore {
    id: string;
    version: string;
    setInfo: (id: string, version: string) => void;
}

const _useSnapShotInfoStore = create<SnapshotInfoStore>((set) => ({
    id: "",
    version: "",
    setInfo: (id, version) => set({ id: id, version: version })
}))

export const SnapShotList = () => {
    const [ rows, setRows ] = React.useState<Array<object>>([]);
    const [ loading, setLoading ] = React.useState(false);

    const projectID = _useSnapShotInfoStore((state) => state.id);
    const projectVersion = _useSnapShotInfoStore((state) => state.version);
    const setInfo = _useSnapShotInfoStore((state) => state.setInfo);

    const open = _useDeleteAlertProps((state) => state.open);
    const openAlert = _useDeleteAlertProps((state) => state.setOpen);
    const closeAlert = _useDeleteAlertProps((state) => state.setClose);

    const updateSnapshotList = () => {
        setLoading(true);
        fetch("/api/snapshot").then((response) => response.json()).then((json) => {
            let forGrid: Array<object> = [];
            const { rows } = json;
            rows.map((r: any) => {
                forGrid.push({
                    workspace_name: r.WORKSPACE_NAME,
                    project_name: r.PROJECT_NAME,
                    project_id: r.PROJECT_ID,
                    project_version: r.PROJECT_VERSION,
                    snapshot_description: r.SNAPSHOT_DESCRIPTION,
                    active: r.DISABLE === "false"? true : false,
                    created: new Date(r.CREATE_DATE + " " + r.CREATE_TIME)
                })
                setRows(forGrid);
            })
            setLoading(false);
        })
    }

    React.useEffect(() => {
        updateSnapshotList();
    }, [])

    const handleSnapshotStateChange = (id: string, version: string, active: boolean) => {
        fetch(`/api/snapshot/${id}/${version}?action=${active? "enable" : "disable"}`, { method: "POST" })
            .then((response) => response.json())
            .then((json) => {
                const apiResponse: APIResponse = json;
                if (apiResponse.result === "OK") {
                    updateSnapshotList();
                }
            })
    }

    const columns: GridColDef[] = [
        { field: "workspace_name", headerName: "Worspace", headerAlign: "center", align: "center",  flex: 0.05 },
        { field: "project_name", headerName: "Name", headerAlign: "center", align: "center",  flex: 0.1 },
        { field: "project_id", headerName: "ID", headerAlign: "center", align: "center", flex: 0.1 },
        { field: "project_version", headerName: "Version", headerAlign: "center", align: "center", flex: 0.05 },
        { field: "snapshot_description", headerName: "Description", headerAlign: "center", flex: 0.2 },
        { field: "created", type: 'dateTime', headerName: "Created", headerAlign: "center", flex: 0.1 },
        { field: "active", type: "actions", headerName: "Active", headerAlign: "center", align: "center",  flex: 0.05, cellClassName: "actions", getActions: (params) => {
            const { row } = params;
            const { project_id, project_version, active } = row;
            if (active) {
                return [
                    <GridActionsCellItem
                        icon={<ToggleOnTwoTone color="success" />} 
                        label="on"
                        onClick={() => {
                            handleSnapshotStateChange(project_id, project_version, false);
                        }}
                    />
                ]
            } else {
                return [
                    <GridActionsCellItem
                        icon={<ToggleOffTwoTone color="disabled" />} 
                        label="off"
                        onClick={() => {
                            handleSnapshotStateChange(project_id, project_version, true);
                        }}
                    />
                ]
            }
        }},
    ]

    const handleRowSelected = (params: GridRowParams, event: MuiEvent, details: GridCallbackDetails) => {
        if (params) {
            const { row } = params;
            const { project_id, project_version, active } = row;
            if (active) {
                setInfo(project_id, project_version);
            } else {
                setInfo("", "");
            }
        }
    }

    return (
        <>
            <Stack gap={1} width="100%" height="100%">
                <Stack direction="row" width="100%" justifyContent="end">
                    <Button variant="contained" color="primary" disabled>Deploy</Button>
                </Stack>
                <CustomDataGrid
                    columns={columns}
                    rows={rows}
                    getRowId={(row) => `${row.project_id}-${row.project_version}`}
                    loading={loading}
                    // onRowClick={handleRowSelected}
                />
            </Stack>
        </>
    )
}