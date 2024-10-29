"use client"

import { Button } from "@mui/material";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalProps, CustomModalTitle } from "../common/modal"
import { deleteFlow } from "@/service/fetch/crud/project";
import { useProjectStore } from "@/store/workspace-store";

export interface DeleteFlowDialogStore {
    open: boolean;
    projectID: string | undefined;
    flowName: string | undefined;
    openDialog: (projectID: string, flowName: string) => void;
    closeDialog: () => void;
}

interface DeleteFlowDialogProps extends CustomModalProps {
    projectID: string | undefined,
    flowName: string | undefined,
    onDelete: () => void;
}

export const DeleteFlowDialog = (props: DeleteFlowDialogProps) => {
    const { open, projectID, flowName, onClose, onDelete } = props;

    const deleteProjectFlow = useProjectStore((state) => state.deleteProjectFlow);

    const handleDeleteFlow = async () => {
        if (projectID && flowName) {
            await deleteFlow(projectID, flowName, {
                onOK: (data) => {
                    deleteProjectFlow(flowName);
                    if (onClose) {
                        onClose();
                    }
                },
                onError: (message) => {

                }
            });
        }
    }

    return (
        <CustomModal open={open? open: false} onClose={onClose}>
            <CustomModalTitle title={`Are you sure you want to delete '${flowName}'?`} />
            <CustomModalContents>
                You can...
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" color="error" 
                    onClick={projectID? () => handleDeleteFlow() : undefined}>
                        Delete
                </Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}