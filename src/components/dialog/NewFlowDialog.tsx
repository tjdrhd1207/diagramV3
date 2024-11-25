"use client"

import { useDialogState } from "@/store/dialog-store"
import { create } from "zustand"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal"
import { FormText } from "../common/form"
import { Button, InputAdornment, TextField } from "@mui/material"
import { useBlockAttributeState, useEditorTabState, useFlowEditState } from "@/store/flow-editor-store"
import { useProjectStore } from "@/store/workspace-store"
import React from "react"
import { NeedValidate, TextFormState } from "@/store/_interfaces"
import { createFlow } from "@/service/fetch/crud/flows"

interface NewFlowDialogState extends NeedValidate {
    flowName: TextFormState;
    flowTag: TextFormState;
    onFlowNameChanged: (value: string) => void;
    onFlowTageChanged: (value: string) => void;
} 

const _useNewFlowDialogState = create<NewFlowDialogState>((set) => ({
    flowName: {
        value: "",
        color: "primary",
        helperText: "",
        valid: false
    },
    flowTag: {
        value: "",
        color: "primary",
        helperText: "",
        valid: true
    },
    onFlowNameChanged: (value) => set((state) => ({ flowName: { ...state.flowName, value: value }})),
    onFlowTageChanged: (value) => set((state) => ({ flowTag: { ...state.flowTag, value: value }})),
    valid: false,
    setValid: (value) => set({ valid: value })
}))

export const NewFlowDialog = () => {
    const open = useDialogState((state) => state.showNewFlowDialog);
    const setClose = useDialogState((state) => state.closeNewFlowDialog);

    const flowName = _useNewFlowDialogState((state) => state.flowName.value);
    const flowNameColor = _useNewFlowDialogState((state) => state.flowName.color);
    const flowNameHelpertext = _useNewFlowDialogState((state) => state.flowName.helperText);
    const flowNameValid = _useNewFlowDialogState((state) => state.flowName.valid);
    const onFlowNameChanged = _useNewFlowDialogState((state) => state.onFlowNameChanged);

    const flowTag = _useNewFlowDialogState((state) => state.flowTag.value);
    const flowTagColor = _useNewFlowDialogState((state) => state.flowTag.color);
    const flowTagHelperText = _useNewFlowDialogState((state) => state.flowTag.helperText);
    const flowTagValid = _useNewFlowDialogState((state) => state.flowTag.valid);
    const onFlowTageChanged = _useNewFlowDialogState((state) => state.onFlowTageChanged);
    
    const projectFlows = useProjectStore((state) => state.projectFlows);
    const addProjectFlows = useProjectStore((state) => state.addProjectFlows);

    const projectID = useProjectStore((state) => state.projectID);
    const projectName = useProjectStore((state) => state.projectName);

    const tabs = useEditorTabState((state) => state.tabs);
    const setTab = useEditorTabState((state) => state.setTab);
    const addTabs = useEditorTabState((state) => state.addTabs);

    const addFlowEditState = useFlowEditState((state) => state.addState);
    const addBlockAttributeState = useBlockAttributeState((state) => state.addState);

    const handleNewPage = async () => {
        if (flowName) {
            const fullFlowName = `${flowName}.dxml`;
            await createFlow(projectID, { flowName: fullFlowName, flowTag: flowTag, startFlow: false }, {
                onOK: (data) => {
                    addProjectFlows([{ flowName: fullFlowName, flowSource: data, startFlow: false, flowTag: flowTag }]);
                    
                    if (data) {
                        addTabs([{ name: fullFlowName, modified: false, origin: data, contents: data, type: "dxml" }]);
                        addFlowEditState(fullFlowName);
                        addBlockAttributeState(fullFlowName);
                        setTab(fullFlowName);
                    }
                    setClose();
                },
                onError: (message) => {
                    console.log(message);
                }
            });
        }
    }

    return (
        <CustomModal open={open} onClose={setClose}>
            <CustomModalTitle title="New Flow" />
            <CustomModalContents>
                <FormText autoFocus required disabled={false} formTitle="Flow Name" color={flowNameColor} helperText={flowNameHelpertext}
                    formValue={flowName} onFormChanged={onFlowNameChanged} endAdornment={<InputAdornment position="end">.xml</InputAdornment>} />
                <FormText disabled={false} formTitle="Tag" color={flowTagColor} helperText={flowTagHelperText}
                    formValue={flowTag} onFormChanged={onFlowTageChanged}/>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" disabled={flowNameValid} onClick={handleNewPage}>OK</Button>
                <Button size="small" onClick={setClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}