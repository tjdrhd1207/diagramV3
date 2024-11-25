import { InterfaceInformation } from "@/service/global";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalProps, CustomModalTitle } from "../common/modal";
import { Button, Stack } from "@mui/material";
import { FormText } from "../common/form";
import { create } from "zustand";
import { AlertState } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";

export interface NewInterfaceDialogState {
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface DialogState {
    interfaceCode: string;
    setInterfaceCode: (interfaceCode: string) => void;
    interfaceName: string;
    setInterfaceName: (interfaceName: string) => void;
}

const _useNewInterfaceDialogStore = create<DialogState & AlertState>((set) => ({
    interfaceCode: "",
    setInterfaceCode: (interfaceCode) => set({ interfaceCode: interfaceCode }),
    interfaceName: "",
    setInterfaceName: (interfaceName) => set({ interfaceName: interfaceName }),
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false }),
}));

interface NewInterfaceDialogProps extends CustomModalProps {
    interfaceInfos: InterfaceInformation[];
    onCreate: (info: InterfaceInformation) => void;
}

export const NewInterfaceDialog = (props: NewInterfaceDialogProps) => {
    const { open, interfaceInfos, onClose, onCreate } = props;

    const interfaceCode = _useNewInterfaceDialogStore((state) => state.interfaceCode);
    const setInterfaceCode = _useNewInterfaceDialogStore((state) => state.setInterfaceCode);
    const interfaceName = _useNewInterfaceDialogStore((state) => state.interfaceName);
    const setInterfaceName = _useNewInterfaceDialogStore((state) => state.setInterfaceName);

    const alert = _useNewInterfaceDialogStore((state) => state.alert);
    const alertMessage = _useNewInterfaceDialogStore((state) => state.message);
    const showAlert = _useNewInterfaceDialogStore((state) => state.showAlert);
    const hideAlert = _useNewInterfaceDialogStore((state) => state.hideAlert);

    const handleTransitionEnter = () => {
        setInterfaceCode("");
        setInterfaceName("");
    }

    const handleCreate = () => {
        if (interfaceCode) {
            if (!interfaceInfos.find((info) => info.interfaceCode === interfaceCode)) {
                onCreate({ interfaceCode, interfaceName, interfaceItems: { fixedItems: [], iterativeItems: [] } });
                if (onClose) {
                    onClose();
                }
            }
        }
    };

    return (
        <CustomModal open={open} onClose={onClose} onTransitionEnter={handleTransitionEnter}>
            <CustomModalTitle title="New InterfaceCode" />
            <CustomModalContents>
                <Stack width="20vw">
                    <FormText required autoFocus formTitle="Code" formValue={interfaceCode} onFormChanged={(value) => setInterfaceCode(value)} />
                    <FormText formTitle="Name" formValue={interfaceName} onFormChanged={(value) => setInterfaceName(value)} />
                </Stack>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" disabled={!interfaceCode} onClick={handleCreate}>Create</Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
            <CustomSnackbar open={alert} close={hideAlert} severity="error" message={alertMessage} />
        </CustomModal>
    )
}