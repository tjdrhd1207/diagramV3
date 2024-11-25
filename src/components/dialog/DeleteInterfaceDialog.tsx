import { InterfaceInformation } from "@/service/global";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalProps, CustomModalTitle } from "../common/modal";
import { Button } from "@mui/material";

export interface DeleteInterfaceDailogState {
    open: boolean;
    interfaceInfo: InterfaceInformation | undefined;
    setOpen: (interfaceInfo: InterfaceInformation | undefined) => void;
}

interface DeleteInterfaceDialogProps extends CustomModalProps {
    interfaceInfo: InterfaceInformation | undefined;
    onDelete: (interfaceCode: string) => void;
}

export const DeleteInterfaceDialog = (props: DeleteInterfaceDialogProps) => {
    const { open, interfaceInfo, onClose, onDelete } = props;

    const handleDelete = () => {
        if (interfaceInfo) {
            onDelete(interfaceInfo.interfaceCode);
        }

        if (onClose) {
            onClose();
        }
    }

    return (
        <CustomModal open={open} onClose={onClose}>
            <CustomModalTitle title={`Are you sure delete ${interfaceInfo?.interfaceCode}`} />
            <CustomModalContents>
                ⚠️ You cannot restore this InterfaceCode
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}