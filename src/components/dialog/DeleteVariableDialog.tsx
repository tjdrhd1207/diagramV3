import { Button } from "@mui/material";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalProps, CustomModalTitle } from "../common/modal";
import { useProjectStore } from "@/store/workspace-store";
import { VariableInformation } from "@/service/global";

export interface DeleteVariableDialogState {
    open: boolean;
    variableInfo: VariableInformation | undefined;
    setOpen: (variableInfo: VariableInformation | undefined) => void;
}

interface DeleteVariableDialogProps extends CustomModalProps {
    variableInfo: VariableInformation | undefined;
    onDelete: (info: VariableInformation) => void;
}

export const DeleteVariableDialog = (props: DeleteVariableDialogProps) => {
    const { open, variableInfo, onClose, onDelete } = props;
    
    const projectID = useProjectStore((state) => state.projectID);
    
    let variableAccessKey: string = "";
    let variableName: string = "";

    if (variableInfo) {
        variableAccessKey = variableInfo.variableAccessKey;
        variableName = variableInfo.variableName;
    }

    const handleDeleteVariable = () => {
        if (projectID && variableInfo) {
            onDelete(variableInfo);
            if (onClose) {
                onClose();
            }
        }
    }

    return (
        <CustomModal open={open? open: false} onClose={onClose}>
            <CustomModalTitle title={`Are you sure you want to delete '${variableAccessKey}:${variableName}'?`} />
            <CustomModalContents>
                ⚠️ You cannot restore this Variable
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" color="error" onClick={handleDeleteVariable}>Delete</Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}