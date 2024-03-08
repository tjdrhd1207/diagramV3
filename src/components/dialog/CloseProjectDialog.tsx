import { useDialogState } from "@/store/dialog-store"
import { CustomModal, CustomModalContents, CustomModalTitle } from "../common/modal";

export const CloseProjectDialog = () => {
    const open = useDialogState((state) => state.showCloseProjectDialog);
    const setClose = useDialogState((state) => state.closeCloseProjectDialog);

    return (
        <CustomModal open={open} onClose={setClose}>
            <CustomModalTitle title="Close Project" />
        </CustomModal>
    )
}