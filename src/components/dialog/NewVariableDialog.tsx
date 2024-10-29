import { VariableInfo } from "@/service/global";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalProps, CustomModalTitle } from "../common/modal";
import { create } from "zustand";
import { Button, Stack } from "@mui/material";
import { FormSelect, FormText } from "../common/form";
import { createVariable } from "@/service/fetch/crud/variables";
import { useProjectStore } from "@/store/workspace-store";

export interface NewVariableDialogState {
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface DialogState {
    variableType: string | undefined;
    setVariableType: (variableType: string) => void;
    variableName: string | undefined;
    setVariableName: (variableName: string) => void;
    defaultValue: string | undefined;
    setDefaultValue: (defaultValue: string) => void;
    variableDescription: string | undefined;
    setVariableDescription: (variableDescription: string) => void;
    setInitState: () => void;
}

const _useNewVariableDialogStore = create<DialogState>((set) =>({
    variableType: undefined,
    setVariableType: (variableType) => set({ variableType: variableType }),
    variableName: undefined,
    setVariableName: (variableName) => set({ variableName: variableName}),
    defaultValue: undefined,
    setDefaultValue: (defaultValue) => set({ defaultValue: defaultValue }),
    variableDescription: undefined,
    setVariableDescription: (variableDescription) => set({ variableDescription: variableDescription }),
    setInitState: () => set({ variableType: "", variableName: "", defaultValue: "", variableDescription: "" })
}))

interface NewVariableDialogProps extends CustomModalProps {
    onCreate: () => void;
}

export const NewVariableDialog = (props: NewVariableDialogProps) => {
    const { open, onClose, onCreate } = props;

    const projectID = useProjectStore((state) => state.projectID);

    const variableType = _useNewVariableDialogStore((state) => state.variableType);
    const setVariableType = _useNewVariableDialogStore((state) => state.setVariableType);
    const variableName = _useNewVariableDialogStore((state) => state.variableName);
    const setVariableName = _useNewVariableDialogStore((state) => state.setVariableName);
    const defaultValue = _useNewVariableDialogStore((state) => state.defaultValue);
    const setDefaultValue = _useNewVariableDialogStore((state) => state.setDefaultValue);
    const variableDescription = _useNewVariableDialogStore((state) => state.variableDescription);
    const setVariableDescription = _useNewVariableDialogStore((state) => state.setVariableDescription);
    const setInitState = _useNewVariableDialogStore((state) => state.setInitState);

    const handleTransitionEnter = () => {
        setInitState();
    };

    const handleCreate = () => {
        if (variableType && variableName) {
            const newVariableInfo: VariableInfo = {
                variableAccessKey: "app", variableType: variableType, variableName: variableName,
                defaultValue: defaultValue? defaultValue : "", variableDescription: variableDescription? variableDescription : ""
            };

            createVariable(projectID, newVariableInfo, {
                onOK: (data) => {
                    onCreate();
                    if (onClose) {
                        onClose();
                    }
                },
                onError: (message) => {}
            })
        }

    };

    return (
        <CustomModal open={open} onClose={onClose} onTransitionEnter={handleTransitionEnter}>
            <CustomModalTitle title="New Project Variable" />
            <CustomModalContents>
                <Stack>
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
                >Create</Button>
                <Button size="small" onClick={onClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}