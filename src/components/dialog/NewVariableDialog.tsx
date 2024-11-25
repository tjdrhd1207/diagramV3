import { VariableInformation } from "@/service/global";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalProps, CustomModalTitle } from "../common/modal";
import { create } from "zustand";
import { Button, Stack } from "@mui/material";
import { FormSelect, FormText } from "../common/form";
import { AlertState } from "@/store/_interfaces";
import { CustomSnackbar } from "../custom-snackbar";

export interface NewVariableDialogState {
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface DialogState {
    variableType: string;
    setVariableType: (variableType: string) => void;
    variableName: string;
    setVariableName: (variableName: string) => void;
    defaultValue: string;
    setDefaultValue: (defaultValue: string) => void;
    variableDescription: string;
    setVariableDescription: (variableDescription: string) => void;
    setInitState: () => void;
}

const _useNewVariableDialogStore = create<DialogState & AlertState>((set) =>({
    variableType: "string",
    setVariableType: (variableType) => set({ variableType: variableType }),
    variableName: "",
    setVariableName: (variableName) => set({ variableName: variableName}),
    defaultValue: "",
    setDefaultValue: (defaultValue) => set({ defaultValue: defaultValue }),
    variableDescription: "",
    setVariableDescription: (variableDescription) => set({ variableDescription: variableDescription }),
    setInitState: () => set({ variableType: "", variableName: "", defaultValue: "", variableDescription: "" }),
    alert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    showAlert: (variant, serverity, message) => set({ alert: true, variant: variant, serverity: serverity, message: message }),
    hideAlert: () => set({ alert: false }),
}))

interface NewVariableDialogProps extends CustomModalProps {
    variableInfos: VariableInformation[];
    onCreate: (info: VariableInformation) => void;
}

export const NewVariableDialog = (props: NewVariableDialogProps) => {
    const { open, variableInfos, onClose, onCreate } = props;

    const variableType = _useNewVariableDialogStore((state) => state.variableType);
    const setVariableType = _useNewVariableDialogStore((state) => state.setVariableType);
    const variableName = _useNewVariableDialogStore((state) => state.variableName);
    const setVariableName = _useNewVariableDialogStore((state) => state.setVariableName);
    const defaultValue = _useNewVariableDialogStore((state) => state.defaultValue);
    const setDefaultValue = _useNewVariableDialogStore((state) => state.setDefaultValue);
    const variableDescription = _useNewVariableDialogStore((state) => state.variableDescription);
    const setVariableDescription = _useNewVariableDialogStore((state) => state.setVariableDescription);
    const setInitState = _useNewVariableDialogStore((state) => state.setInitState);

    const alert = _useNewVariableDialogStore((state) => state.alert);
    const alertMessage = _useNewVariableDialogStore((state) => state.message);
    const showAlert = _useNewVariableDialogStore((state) => state.showAlert);
    const hideAlert = _useNewVariableDialogStore((state) => state.hideAlert);

    const handleTransitionEnter = () => {
        setInitState();
    };

    const handleCreate = () => {
        if (variableType && variableName) {

            if (variableInfos.find((info) => info.variableName === variableName)) {
                showAlert("filled", "error", `variableName(${variableName}) already exists`);
            } else {
                onCreate({ 
                    variableAccessKey: "app", variableType: variableType, variableName: variableName,
                    defaultValue: defaultValue? defaultValue : "", variableDescription: variableDescription? variableDescription : ""
                });

                if (onClose) {
                    onClose();
                }
            }
        }

    };

    return (
        <>
            <CustomModal open={open} onClose={onClose} onTransitionEnter={handleTransitionEnter}>
                <CustomModalTitle title="New Project Variable" />
                <CustomModalContents>
                    <Stack width="30vw">
                        <FormText formTitle="Access Key" formValue="app" disabled onFormChanged={() => {}}/>
                        <FormSelect
                            formTitle="Variable Type" formValue={variableType} required onFormChanged={setVariableType}
                            options={[
                                { label: "String", value: "string" },
                                { label: "Boolean", value: "boolean" },
                                { label: "Int64", value: "int64" }
                            ]}
                        />
                        <FormText formTitle="Variable Name" formValue={variableName} required onFormChanged={setVariableName} />
                        <FormText formTitle="Default Value" formValue={defaultValue} onFormChanged={setDefaultValue} />
                        <FormText formTitle="Description" formValue={variableDescription} onFormChanged={setVariableDescription} />
                    </Stack>
                </CustomModalContents>
                <CustomModalAction>
                    <Button 
                        size="small" variant="contained"onClick={handleCreate}
                        disabled={variableType && variableName? false : true}
                    >
                        Create
                    </Button>
                    <Button size="small" onClick={onClose}>Cancel</Button>
                </CustomModalAction>
                <CustomSnackbar open={alert} close={hideAlert} severity="error" message={alertMessage} />
            </CustomModal>
        </>
    )
}