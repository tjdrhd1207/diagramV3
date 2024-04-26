"use client"

import { Divider, IconButton, MenuItem, MenuList, Popper, Stack, Tooltip } from "@mui/material"
import { editor_tab_height, header_height } from "@/consts/g-style-vars"
import { AddIcCallTwoTone, CalculateTwoTone, CalendarMonthTwoTone, CallEndTwoTone, CallSplitTwoTone, CallTwoTone, CheckCircleTwoTone, CodeTwoTone, ContentCutTwoTone, CropDinTwoTone, DeleteTwoTone, DialpadTwoTone, FileOpenTwoTone, HotelTwoTone, LanguageTwoTone, LinkTwoTone, MicNoneTwoTone, MicTwoTone, MoveUpTwoTone, MusicNoteTwoTone, MusicOffTwoTone, NoteTwoTone, PanToolTwoTone, PauseTwoTone, PhoneForwardedTwoTone, PlayCircleTwoTone, QuestionMark, QuestionMarkTwoTone, RecordVoiceOverTwoTone, RingVolumeTwoTone, SettingsTwoTone, StopCircleTwoTone, SyncTwoTone, TaskTwoTone, TextFieldsTwoTone, TouchAppTwoTone, VolumeUpTwoTone, WebTwoTone, WorkHistoryTwoTone } from "@mui/icons-material"
import React from "react"
import { useFlowEditState, FlowEditMode, useEditorTabState } from "@/store/flow-editor-store"

const item_radius = { borderRadius: "8px" }

type BlockGroup = { 
    group: string,
    divider?: boolean
    rootComponent?: React.ReactNode,
    tooltip?: string,
    subComponents?: Array<{ key: string, node: React.ReactNode }>
}

const blockItems: Array<BlockGroup> = [
    { group: "hand", rootComponent: <PanToolTwoTone fontSize="small" /> },
    { group: "select", rootComponent: <TouchAppTwoTone fontSize="small" /> },
    { group: "divider-1", divider: true },
    {
        group: "call-control", rootComponent: <></>, tooltip: "Call Control",
        subComponents: [
            { key: "WaitCallNode", node: <RingVolumeTwoTone fontSize="small" /> },
            { key: "AnswerCallNode", node: <CallTwoTone fontSize="small" /> },
            { key: "MakeCallNode", node: <AddIcCallTwoTone fontSize="small" /> },
            { key: "HangupNode", node: <CallEndTwoTone fontSize="small" /> },
            { key: "TransferNode", node: <PhoneForwardedTwoTone fontSize="small" /> },
        ]
    },
    {
        group: "flow-control", rootComponent: <></>, tooltip: "Flow Control",
        subComponents: [
            { key: "EmptyNode", node : <CropDinTwoTone fontSize="small" /> },
            { key: "CatchNode", node : <MoveUpTwoTone fontSize="small" /> },
            { key: "CallPageNode", node : <FileOpenTwoTone fontSize="small" /> },
            { key: "ReturnPageNode", node : <TaskTwoTone fontSize="small" /> },
            { key: "GotoPageNode", node : <LinkTwoTone fontSize="small" /> },
            { key: "PauseNode", node : <PauseTwoTone fontSize="small" /> },
            { key: "EndScenarioNode", node : <HotelTwoTone fontSize="small" /> },
        ]
    },
    {
        group: "audio", rootComponent: <VolumeUpTwoTone fontSize="small" />, tooltip: "Audio",
        subComponents: [
            { key: "PromptNode", node: <VolumeUpTwoTone fontSize="small" /> },
            { key: "GetDigitsNode", node: <DialpadTwoTone fontSize="small" /> },
            { key: "GetDigitPromptNode", node: <DialpadTwoTone fontSize="small" />} ,
            { key: "GetDigitsPromptNode", node: <DialpadTwoTone fontSize="small" /> },
            { key: "StartMOHNode", node: <MusicNoteTwoTone fontSize="small" /> },
            { key: "StopMOHNode", node: <MusicOffTwoTone fontSize="small" /> },
            { key: "GetTTSStreamNode", node: <TextFieldsTwoTone fontSize="small" /> },
            { key: "GetTTSStreamPromptNode", node: <TextFieldsTwoTone fontSize="small" /> },
            { key: "ClearBufferNode", node: <DeleteTwoTone fontSize="small" /> },
            { key: "PromptLanguageNode", node: <LanguageTwoTone fontSize="small" /> },
        ]
    },
    {
        group: "record", rootComponent: <MicTwoTone fontSize="small" />, tooltip: "Record",
        subComponents: [
            { key: "RecordNode", node: <MicTwoTone fontSize="small" /> },
            { key: "ASRNode", node: <RecordVoiceOverTwoTone fontSize="small" /> },
            { key: "PromptASRNode", node: <RecordVoiceOverTwoTone fontSize="small" /> },
            { key: "StartTransRecNode", node: <MicTwoTone fontSize="small" /> },
            { key: "ctlTransRecNode", node: <MicNoneTwoTone fontSize="small" /> },
        ]
    },
    { group: "divider-2", divider: true },
    {
        group: "logical", rootComponent: <CodeTwoTone fontSize="small" />, tooltip: "Logic",
        subComponents : [
            { key: "ScriptNode", node: <CodeTwoTone fontSize="small" /> },
            { key: "IfNode", node: <QuestionMarkTwoTone fontSize="small" /> },
            { key: "CompareNode", node: <CalculateTwoTone fontSize="small" /> },
            { key: "SwitchNode", node: <CallSplitTwoTone fontSize="small" /> },
        ]
    },
    { group: "divider-3", divider: true },
    {
        group: "interface", rootComponent: <SyncTwoTone fontSize="small" />, tooltip: "Interface",
        subComponents: [
            { key: "NetworkStreamNode", node: <SyncTwoTone fontSize="small" /> },
            { key: "NetworkStreamNodeEx", node: <SyncTwoTone fontSize="small" /> },
            { key: "GetStreamNode", node: <ContentCutTwoTone fontSize="small" /> },
            { key: "GetStreamsNode", node: <ContentCutTwoTone fontSize="small" /> },
        ]
    },
    {
        group: "oamp", rootComponent: <WebTwoTone fontSize="small" />, tooltip: "for OAMP",
        subComponents: [
            { key: "ServiceStartNode", node: <PlayCircleTwoTone fontSize="small" /> },
            { key: "ServiceEndNode", node: <StopCircleTwoTone fontSize="small" /> },
            { key: "ServiceCheckNode", node: <CheckCircleTwoTone fontSize="small" /> },
            { key: "HolidayNode", node: <CalendarMonthTwoTone fontSize="small" /> },
            { key: "WorkTimeNode", node: <WorkHistoryTwoTone fontSize="small" /> },
        ]
    },
    { group: "[MEMO]", rootComponent: <NoteTwoTone fontSize="small" />, tooltip: "Memo" },
    { group: "divider-4", divider: true },
    { group: "setttings", rootComponent: <SettingsTwoTone fontSize="small" />, tooltip: "Settings" },
]

const calculateDirection = (lastPosition: any, currentPosition: any) => {
    const dx = currentPosition.x - lastPosition.x;
    const dy = currentPosition.y - lastPosition.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
 };

const PalletItems = (
    props:{
        group: string,
        rootIcon: React.ReactNode,
        tooltip?: string
        subIcons: Array<{key: string, node: React.ReactNode}>,
}) => {
    const [lastMousePosition, setLastMousePosition] = React.useState({ x: 0, y: 0 });
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    
    const defaultSelect = props.subIcons?.[0];
    const [selected, setSelected] = React.useState<any>(defaultSelect);

    const setMode = useFlowEditState((state) => state.setMode);
    const setCreateMode = useFlowEditState((state) => state.setCreateMode);

    const tab = useEditorTabState((state) => state.tab);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
        setLastMousePosition({ x: event.clientX, y: event.clientY });
    }

    const handleMounseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (calculateDirection(lastMousePosition, { x: event.clientX, y: event.clientY }) !== "down") {
            setAnchorEl(null);
        }
    }

    const handleRootClick = () => {
        if (selected) {
            setCreateMode(tab, selected.key);
        }
        handleClose();
    }

    const handleItemClick = (key: string) => {
        setSelected({ key: key, node: props.subIcons.find((i) => i.key === key)?.node });
        setCreateMode(tab, key);
        handleClose();
    }

    return (
        <>
            <Tooltip title={props.tooltip} placement="top" enterDelay={1000} enterNextDelay={1000}>
                <IconButton onMouseEnter={handleMounseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
                    onClick={handleRootClick} 
                    sx={{ ...item_radius }}
                >
                    {selected? selected.node : <QuestionMark fontSize="small"/>}
                </IconButton>
            </Tooltip>
            <Popper anchorEl={anchorEl} open={open} placement="bottom-start" >
                <MenuList disablePadding onMouseLeave={handleClose}
                    sx={{
                        backgroundColor: "background.paper",
                        borderRadius: "8px", border: `0.5px solid`,
                    }}
                >
                    {props.subIcons.map((i) =>
                        <MenuItem key={i.key} dense autoFocus onClick={() => handleItemClick(i.key)}
                            sx={{ paddingInline: "8px"}}
                        >
                            <Stack direction="row" gap={1}>
                                {i.node}
                                {i.key}
                            </Stack>
                        </MenuItem>
                    )}
                </MenuList>
            </Popper>
        </>
    )
}

export const BlockPallete = () => {
    const setMode = useFlowEditState((state) => state.setMode);

    const tab = useEditorTabState((state) => state.tab);

    const handleItemClick = (key: string) => {
        setMode({ mode: FlowEditMode.create, targetPage: tab, targetBlock: key });
    }

    return (
        <Stack direction="row" gap={0.5} 
            bgcolor={(theme) => (theme.palette.grey[200])}
            boxShadow={(theme) => (theme.shadows[10])}
            sx={{
                height: "50px",
                position: "absolute", top: `calc(${header_height} + ${editor_tab_height} + 1%)`, left: `50%`, 
                transform: "translate(-50%, 0%)",
                border: `0.5px solid`, borderRadius: "15px",
                padding: 1,
                display: { xs: "none", md: "flex"}
            }}
        >
            {blockItems && blockItems.map((b) => {
                if (b?.divider) {
                    return <Divider key={b.group} orientation="vertical" variant="middle" flexItem />
                } else if (b?.subComponents) {
                    return (
                        <PalletItems key={b.group} group={b.group} rootIcon={b.rootComponent} 
                            subIcons={b.subComponents} tooltip={b.tooltip} />
                    )
                } else {
                    return (
                        <Tooltip key={b.group} title={b.tooltip}>
                            <IconButton draggable sx={{ ...item_radius }} onClick={() => handleItemClick(b.group)}>{b.rootComponent}</IconButton>
                        </Tooltip>
                    )
                }
            })}
        </Stack>
    )
}