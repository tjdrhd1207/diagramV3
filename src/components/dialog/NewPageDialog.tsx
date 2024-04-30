"use client"

import { useDialogState } from "@/store/dialog-store"
import { create } from "zustand"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal"
import { FormText } from "../common/form"
import { Button, InputAdornment, TextField } from "@mui/material"
import { useEditorTabState } from "@/store/flow-editor-store"
import { useProjectStore } from "@/store/workspace-store"
import React from "react"
import { APIResponse } from "@/consts/server-object"
import { NodeWrapper } from "@/lib/diagram"
import { $Page_Attribute_name, $Page_Attribute_start, $Page_Attribute_tag, $Page_Tag, $ScenarioPages_Tag } from "@/consts/flow-editor"

interface InputState {
    name: string,
    setName: (value: string) => void
    color: string,
    setColor: (value: string) => void,
    helperText: string,
    setHelperText: (text: string) => void
}

const _useInputState = create<InputState>((set) => ({
    name: "",
    setName: (value) => set({ name: value }),
    color: "primary",
    setColor: (value) => set({ color: value }),
    helperText: "",
    setHelperText: (text) => set({ helperText: text})
}))

export const NewPageDialog = () => {
    const open = useDialogState((state) => state.showNewPageDialog);
    const setClose = useDialogState((state) => state.closeNewPageDialog);

    const name = _useInputState((state) => state.name);
    const setName = _useInputState((state) => state.setName);
    const color = _useInputState((state) => state.color);
    const setColor = _useInputState((state) => state.setColor);
    const helperText = _useInputState((state) => state.helperText);
    const setHelperText = _useInputState((state) => state.setHelperText);
    
    const scenarioPages = useProjectStore((state) => state.scenarioPages);
    const addScenarioPages = useProjectStore((state) => state.addScenarioPages);

    const projectID = useProjectStore((state) => state.projectID);
    const projectName = useProjectStore((state) => state.projectName);
    const projectXML = useProjectStore((state) => state.projectXML);

    const tabs = useEditorTabState((state) => state.tabs);
    const setTab = useEditorTabState((state) => state.setTab);
    const addTabs = useEditorTabState((state) => state.addTabs);

    const handleFormChanged = (value: string) => {
        setColor("primary");
        setHelperText("");
        setName(value);
    }

    const handleNewPage = () => {
        const found = scenarioPages.find((t) => t.name === `${name}.xml`);
        if (found) {
            setColor("error");
            setHelperText("Page name is duplicated");
        } else {
            let url = `/api/project/${projectID}/${name}.xml?action=create`;
            fetch(url, {
                method: "POST",
                cache: "no-cache"
            }).then((response) => response.json()).then((json) => {
                let apiResponse: APIResponse = json;
                if (apiResponse.result === "OK") {
                    // addScenarioPages([{ name: `${name}.xml`, start: false, tag: "", lastOpened: false }])
                    const wrapper = NodeWrapper.parseFromXML(projectXML);
                    const scenarioPages = wrapper.child($ScenarioPages_Tag);
                    const page = scenarioPages.appendChild($Page_Tag);
                    page.attr($Page_Attribute_name, `${name}.xml`);
                    page.attr($Page_Attribute_start, "false");
                    page.attr($Page_Attribute_tag, "")
                    url = `/api/project/${projectID}/${projectName}.xml?action=save`;
                    const xmlString = wrapper.toString();
                    fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/xml",
                        },
                        body: xmlString
                    }).then((response) => response.json()).then((json) => {
                        apiResponse = json;
                        if (apiResponse.result === "OK") {

                        }
                    })
                }
            }).finally(() => {
                setName("");
                setClose();
            })
        }
    }

    return (
        <CustomModal open={open} onClose={setClose}>
            <CustomModalTitle title="New Page" />
            <CustomModalContents>
                <FormText autoFocus required disabled={false} formTitle="Page Name" color={color} helperText={helperText}
                    formValue={name} onFormChanged={handleFormChanged} endAdornment={<InputAdornment position="end">.xml</InputAdornment>} />
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" variant="contained" disabled={(name === "" || color === "error")} onClick={handleNewPage}>OK</Button>
                <Button size="small" onClick={setClose}>Cancel</Button>
            </CustomModalAction>
        </CustomModal>
    )
}