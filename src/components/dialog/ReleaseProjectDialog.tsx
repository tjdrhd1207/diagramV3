import { useDialogState } from "@/store/dialog-store";
import { useProjectStore } from "@/store/workspace-store";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal";
import { create } from "zustand";
import { ReleaseServerInformation } from "@/service/global";
import { FormSelect, FormText } from "../common/form";
import { Button, Stack } from "@mui/material";
import { getReleaseServerInfos } from "@/service/fetch/crud/release";
import { releaseProject } from "@/service/fetch/func/release";

interface DialogState {
    releaseServerInfos: ReleaseServerInformation[];
    setReleaseServerInfos: (releaseServerInfos: ReleaseServerInformation[]) => void;
    releaseServer: string;
    setReleaseServer: (releaseServer: string) => void;
    releaseDescription: string;
    setReleaseDescription: (releaseDescription: string) => void;
}

const _useDialogStore = create<DialogState>((set) =>({
    releaseServerInfos: [],
    setReleaseServerInfos: (releaseServerInfos) => set({ releaseServerInfos }),
    releaseServer: "",
    setReleaseServer: (releaseServer) => set({ releaseServer }),
    releaseDescription: "",
    setReleaseDescription: (releaseDescription) => set({ releaseDescription })
}))

export const RelaseProjectDialog = () => {
    const projectID = useProjectStore((state) => state.projectID);

    const open = useDialogState((state) => state.openReleaseProjectDialog);
    const setOpen = useDialogState((state) => state.setOpenReleaseProjectDialog);

    const releaseServerInfos = _useDialogStore((state) => state.releaseServerInfos);
    const setReleaseServerInfos = _useDialogStore((state) => state.setReleaseServerInfos);
    const releaseServer = _useDialogStore((state) => state.releaseServer);
    const setReleaseServer = _useDialogStore((state) => state.setReleaseServer);
    const releaseDescription = _useDialogStore((state) => state.releaseDescription);
    const setReleaseDescription = _useDialogStore((state) => state.setReleaseDescription);

    const handleClose = () => setOpen(false);

    const handleTransitionEnter = () => {
        getReleaseServerInfos({
            onOK: (data: any) => {
                setReleaseServerInfos(data);
            },
            onError: (message) => {

            }
        });
    };

    const handleRelease = () => {
        releaseProject(projectID, releaseServer, releaseDescription, {
            onOK: (data) => {
                alert(data);
                handleClose();
            },
            onError: (message) => {

            }
        });
    };

    return (
        <CustomModal open={open} onClose={handleClose} onTransitionEnter={handleTransitionEnter}>
            <CustomModalTitle title="Release Project" />
            <CustomModalContents>
                <Stack width="30vw">
                    <FormSelect
                        formTitle="Release Server" formValue={releaseServer} onFormChanged={setReleaseServer}
                        options={releaseServerInfos.map(({ releaseServerAlias: alias, releaseServerURL: url }) => ({ label: `(${alias}) ${url}`, value: alias }))}
                    />
                    <FormText formTitle="Reason" formValue={releaseDescription} onFormChanged={setReleaseDescription} />
                </Stack>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" disabled={!releaseServer} onClick={handleRelease}>Release</Button>
                <Button size="small" onClick={handleClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}