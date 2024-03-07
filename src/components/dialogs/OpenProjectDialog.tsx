"use client"

import { useDialogState } from "@/store/dialog-store"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalInfoBox, CustomModalTitle } from "../common/modal";
import { Button, Skeleton, Tab, Tabs, Typography } from "@mui/material";
import { create } from "zustand";
import { TabPanel, TabState } from "../common/tab";
import { QuickFilteredDataGrid } from "../common/grid";
import React from "react";
import { GridCallbackDetails, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { XMLParser } from "fast-xml-parser";
import { PageInfo, useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";

const dev_columns = [
    { field: 'workspace_name', headerName: 'Workspace', flex: 0.3 },
    { field: 'project_name', headerName: 'Name', flex: 0.5 },
    { field: 'project_id', headerName: 'ID', flex: 0.5 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'last_modified', type: 'dateTime', headerName: 'Last Modified', flex: 0.7 },
];

const snapshot_colums = [
    { field: 'workspace_name', headerName: '워크스페이스', flex: 0.3 },
    { field: 'project_name', headerName: '이름', flex: 0.5 },
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
    workspace_name: string,
    project_name: string,
    project_id: string,
    last_modified: Date,
    description: string
}

interface GridDataState {
    projects: Array<object>,
    setProjects: (list: Array<object>) => void
    snapshots: Array<object>,
    setSnapshots: (list: Array<object>) => void,
    loading: boolean,
    loadingStart: () => void,
    loadingDone: () => void,
    rowData: ProjectData | undefined,
    setRowData: (row: ProjectData | undefined) => void

}

const useGridDataState = create<GridDataState>((set) => ({
    projects: [],
    setProjects: (list) => set({ projects: [...list] }),
    snapshots: [],
    setSnapshots: (list) => set({ snapshots: [...list] }),
    loading: false,
    loadingStart: () => set({ loading: true }),
    loadingDone: () => set({ loading: false }),
    rowData: undefined,
    setRowData: (row) => set({ rowData: row })
}))

export const OpenProjectDialog = () => {
    const open = useDialogState((state) => state.showOpenProjectDialog);
    const setClose = useDialogState((state) => state.closeOpenProjectDialog);

    const meta = useDiagramMetaStore((state) => state.meta);
    const setMeta = useDiagramMetaStore((state) => state.setMeta);
    const setJumpableTagNames = useDiagramMetaStore((state) => state.setJumpableTagNames);

    const setProjectID = useProjectStore((state) => state.setProjectID);
    const setProjectName = useProjectStore((state) => state.setProjectName);
    const setProjectXML = useProjectStore((state) => state.setProjectXML);
    const setScenarioPages = useProjectStore((state) => state.setScenaioPages);

    const tab = useTabState((state) => state.tab);
    const setTab = useTabState((state) => state.setTab);

    const projects = useGridDataState((state) => state.projects);
    const setProjects = useGridDataState((state) => state.setProjects);

    const loading = useGridDataState((state) => state.loading);
    const loadingStart = useGridDataState((state) => state.loadingStart);
    const loadingDone = useGridDataState((state) => state.loadingDone);

    const rowData = useGridDataState((state) => state.rowData);
    const setRowData = useGridDataState((state) => state.setRowData);

    const updateProjects = () => {
        loadingStart();
        fetch("/api/project").then((response) => response.json()).then((json) => {
            let forGrid: Array<object> = [];
            const { rows } = json;
            rows.map((row: any) => {
                forGrid.push({
                    workspace_name: row.workspace_name,
                    project_name: row.project_name,
                    project_id: row.project_id,
                    last_modified: new Date(row.update_date + ' ' + row.update_time),
                    description: row.description
                })
            })
            setProjects(forGrid);
            loadingDone();
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
        if (!meta) {
            const url = "/api/block-meta";
            fetch(url).then((response) => response.json()).then((json) => {
                setMeta(json)
                let jumpableTagNames: Array<string> = [];
                const nodes = json.nodes;
                if (nodes) {
                    Object.entries<any>(nodes).forEach(([ key, value ]) => {
                        if (value.isJumpable) {
                            jumpableTagNames.push(value.buildTag);
                        }
                    })
                }
                setJumpableTagNames(jumpableTagNames);
            });
        }

        const project_id = rowData?.project_id;
        const project_name = rowData?.project_name;
        if (project_id && project_name) {
            const url = `/api/project/${project_id}/${project_name}.xml`;
            fetch(url).then((response) => response.text()).then((text) => {
                setProjectXML(text);
                const projectObj = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" }).parse(text);
                const pages = projectObj.scenario?.["scenario-pages"]?.page;
                let pageInfo: PageInfo[] = [];
                if (Array.isArray(pages)) {
                    pages.map((page: any) => {
                        pageInfo.push({
                            name: page.name,
                            start: page.start? true : false,
                            tag: page.tag,
                            lastOpened: page.lastOpened
                        })
                    })
                } else {
                    pageInfo.push({
                        name: pages.name,
                        start: pages.start? true : false,
                        tag: pages.tag,
                        lastOpened: pages.lastOpened
                    })
                }
                setProjectID(project_id);
                setProjectName(project_name);
                setScenarioPages(pageInfo);
                setClose();
            })
        }
    }

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
                <Tabs variant="fullWidth" textColor="secondary" indicatorColor="secondary"
                    value={tab} onChange={handleTabChanged}
                >
                    <Tab label="Dev version" />
                    <Tab label="Snapshot version" />
                </Tabs>
                <TabPanel state={tab} value={0} sx={{ width: "50vw", height: "50vh" }}>
                    <QuickFilteredDataGrid 
                        columns={dev_columns}
                        rows={projects}
                        getRowId={(row) => row.project_id}
                        onRowClick={handleRowSelected}
                        loading={loading}
                    />
                </TabPanel>
                <TabPanel state={tab} value={1} sx={{ width: "50vw", height: "50vh" }}>
                    <Skeleton variant="rounded" width="100%" height="100%" />
                </TabPanel>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" disabled={!rowData} onClick={handleOpenProject}>OK</Button>
                <Button size="small">Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}