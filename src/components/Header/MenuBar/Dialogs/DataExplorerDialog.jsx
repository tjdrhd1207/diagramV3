import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Tab, Tabs } from "@mui/material";
import { useLocalStore } from "../../../../store/LocalStore";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { TabPanel } from "../../../UI/Tab";
import { QuickFilteredDataGrid } from "../../../UI/CustomDataGrid"
import React from "react";
import { useDialogStore } from "../../../../store/DialogStore";
import { JSEditor } from "../../../UI/CustomEditor";

const variables_columns = [
    { field: 'type', headerName: 'Type', flex: 0.5 },
    { field: 'name', headerName: 'Name', flex: 0.5 },
    { field: 'init_value', headerName: 'Default', flex: 0.5 },
    { field: 'description', headerName: 'Description', flex: 1 },
];

const useDataExplorerStore = create((set) => ({
    tab: 0,
    variables: null,
    functions: null,
    messages: null,
    setTab: (value) => set({ tab: value })
}))

const DataExplorerDialog = () => {
    const open = useDialogStore(state => state.showDataExplorerDialog);
    const setOpen = useDialogStore(state => state.setShowDataExplorerDialog);

    const project_info = useLocalStore(state => state.project_info);
    const { tab, setTab } = useDataExplorerStore(useShallow(state => state));

    const [code, setCode] = React.useState(
        ``
    )

    const handleDialogClose = (event, reason) => {
        if (reason && reason === 'backdropClick') {
            return;
        }
        setOpen(false);
    }

    const handleTabChange = (event, value) => setTab(value);

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            maxWidth="xl"
            fullWidth
        >
            <DialogTitle id="data-explorer-dialog-title">
                데이터 정의
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    textColor="secondary"
                    indicatorColor="secondary"
                >
                    <Tab label="Variables" />
                    <Tab label="Functions" />
                    <Tab label="Messages" />
                </Tabs>
                <TabPanel value={tab} index={0}>
                    <QuickFilteredDataGrid
                        columns={variables_columns}
                        rows={project_info.project_meta ?
                            project_info.project_meta.variables.find((item) => item.key === 'app').variable : null}
                        getRowId={(row) => row.name}
                        sx={{
                            height: "50vh",
                            border: "0px",
                            '& .MuiDataGrid-row:hover': {
                                color: 'primary.main',
                            },
                        }} onRowClick={undefined}
                    />
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    {/* <Box
                        sx={{
                            height: "40vh",
                            // overflow: "visible",
                        }}
                    > */}
                        <JSEditor />
                    {/* </Box> */}
                </TabPanel>
                <TabPanel value={tab} index={2}>
                    <Box
                        sx={{ height: "50vh" }}
                    >
                    </Box>
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button variant="contained">저장</Button>
                <Button autoFocus onClick={handleDialogClose}>취소</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DataExplorerDialog