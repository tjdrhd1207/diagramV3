import { useDialogState } from "@/store/dialog-store";
import { create } from "zustand";
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal";
import { FormSelect, FormText } from "../common/form";
import { Button, Stack } from "@mui/material";
import { useProjectStore, useDiagramMetaStore } from "@/store/workspace-store";
import { getFlowInfos } from "@/service/fetch/crud/flows";
import { searchFromFlows, searchFromFunctions, searchFromInterfaces, searchFromVariables } from "@/service/all/search";
import { useBottomPanelStore, useSearchReportStore } from "@/store/flow-editor-store";
import { SearchReport } from "@/service/global";
import { getFunctionsScript } from "@/service/fetch/crud/functions";
import { getVariableInfos } from "@/service/fetch/crud/variables";
import { getInterfaceInfos } from "@/service/fetch/crud/interfaces";

interface DialogState {
    keyword: string;
    setKeyword: (keyword: string) => void;
    include: string;
    setInclude: (target: string) => void;
}

const _useKeywordSearchDialogStore = create<DialogState>((set) => ({
    keyword: "",
    setKeyword: (keyword) => set({ keyword }),
    include: "",
    setInclude: (target) => set({ include: target })
}));

export const KeywordSearchDialog = () => {

    const projectID = useProjectStore((state) => state.projectID);
    const meta = useDiagramMetaStore((state) => state.meta);

    const open = useDialogState((state) => state.openKeywordSearchDialog);
    const setOpen = useDialogState((state) => state.setOpenKeywordSearchDialog);

    const keyword = _useKeywordSearchDialogStore((state) => state.keyword);
    const setKeyword = _useKeywordSearchDialogStore((state) => state.setKeyword);
    const include = _useKeywordSearchDialogStore((state) => state.include);
    const setInclude = _useKeywordSearchDialogStore((state) => state.setInclude);

    const setBottomPanelTab = useBottomPanelStore((state) => state.setBottomPanelTab);

    const setSearchReport = useSearchReportStore((state) => state.setSearchReport);

    const handleClose = () => {
        setOpen(false);
    };

    const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (keyword) {
                handleSearch();
            }
        }
    }

    const handleSearch = async () => {
        if (projectID && meta) {
            //const roots: SearchRoot[] = [];
            const report: SearchReport = {
                flowSearchResults: [],
                functionSearchResults: [],
                variableSearchResults: [],
                interfaceSearchResults: []
            }

            await getFlowInfos(projectID, true, {
                onOK: (data: any) => {
                    if (data) {
                        report.flowSearchResults = searchFromFlows(keyword, data, meta);
                    }
                },
                onError: (message) => {
                    
                }
            });

            await getFunctionsScript(projectID, {
                onOK: (data: any) => {
                    if (data) {
                        report.functionSearchResults = searchFromFunctions(keyword, data);
                    }
                },
                onError: (message) => {

                }
            });

            await getVariableInfos(projectID, {
                onOK: (data: any) => {
                    report.variableSearchResults = searchFromVariables(keyword, data);
                },
                onError: (message) => {

                }
            });

            await getInterfaceInfos(projectID, {
                onOK: (data: any) => {
                    report.interfaceSearchResults = searchFromInterfaces(keyword, data);
                },
                onError: (message) => {

                }
            });

            if (report.flowSearchResults.length > 0 || report.functionSearchResults.length > 0
                || report.interfaceSearchResults.length > 0 || report.variableSearchResults.length > 0) {
                setSearchReport(keyword, report);
            }
            
            setBottomPanelTab("search");
            handleClose();
        }
    };
    
    return (
        <>
            <CustomModal open={open} onClose={handleClose}>
                <CustomModalTitle title="Search Keyword" />
                <CustomModalContents>
                    <Stack width="30vw" onKeyDown={handleEnter}>
                        <FormText autoFocus required formTitle="Keyword" formValue={keyword} onFormChanged={setKeyword} />
                        <FormSelect
                            formTitle="Include" formValue={include} onFormChanged={setInclude}
                            options={[{ value: "*", label: "all(*)" }]}
                        />
                    </Stack>
                </CustomModalContents>
                <CustomModalAction>
                    <Button size="small" variant="contained" disabled={!keyword} onClick={handleSearch}>Search</Button>
                    <Button size="small" onClick={handleClose}>Cancel</Button>
                </CustomModalAction>
            </CustomModal>
        </>
    )
}