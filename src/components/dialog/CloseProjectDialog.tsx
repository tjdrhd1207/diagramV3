"use client"

import { useDialogState } from "@/store/dialog-store"
import { CustomModal, CustomModalContents, CustomModalTitle } from "../common/modal";

export const CloseProjectDialog = () => {
    const open = useDialogState((state) => state.openCloseProjectDialog);
    const setOpen = useDialogState((state) => state.setOpenCloseProjectDialog);

    return (
        <CustomModal open={open} onClose={() => setOpen(false)}>
            <CustomModalTitle title="Close Project" />
        </CustomModal>
    )
}