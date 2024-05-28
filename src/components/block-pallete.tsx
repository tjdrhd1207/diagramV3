"use client"

import { Divider, IconButton, MenuItem, MenuList, Popper, Stack, Tooltip } from "@mui/material"
import { editor_tab_height, header_height } from "@/consts/g-style-vars"
import { AddIcCall, Calculate, CalculateTwoTone, CalendarMonth, CalendarMonthTwoTone, Call, CallEnd, CallSplit, CallSplitTwoTone, CheckCircle, CheckCircleTwoTone, Code, CodeTwoTone, ContentCut, ContentCutTwoTone, CropDin, CropDinTwoTone, Delete, DeleteTwoTone, Dialpad, DialpadTwoTone, FileOpen, FileOpenTwoTone, Hotel, HotelTwoTone, Language, LanguageTwoTone, Link, LinkTwoTone, Mic, MicNone, MicNoneTwoTone, MicTwoTone, MoveUp, MoveUpTwoTone, MusicNote, MusicNoteTwoTone, MusicOff, MusicOffTwoTone, Note, NoteTwoTone, PanTool, Pause, PauseTwoTone, PhoneForwarded, PlayCircle, PlayCircleTwoTone, QuestionMark, QuestionMarkTwoTone, RecordVoiceOver, RecordVoiceOverTwoTone, RingVolume, Settings, SettingsTwoTone, StopCircle, StopCircleTwoTone, Sync, SyncTwoTone, Task, TaskTwoTone, TextFields, TextFieldsTwoTone, TouchApp, VolumeUp, VolumeUpTwoTone, Web, WebTwoTone, WorkHistory, WorkHistoryTwoTone } from "@mui/icons-material"
import React from "react"
import { useFlowEditState, useEditorTabState } from "@/store/flow-editor-store"

const item_radius = { borderRadius: "8px" }

type BlockGroup = { 
    group: string,
    divider?: boolean
    rootComponent?: React.ReactNode,
    tooltip?: string,
    subComponents?: Array<{ key: string, node: React.ReactNode }>
}

const blockItems: Array<BlockGroup> = [
    { group: "hand", rootComponent: <PanTool fontSize="small" /> },
    { group: "select", rootComponent: <TouchApp fontSize="small" /> },
    { group: "divider-1", divider: true },
    {
        group: "call-control", rootComponent: <></>, tooltip: "Call Control",
        subComponents: [
            { key: "WaitCallNode", node: <RingVolume fontSize="small" /> },
            { key: "AnswerCallNode", node: <Call fontSize="small" /> },
            { key: "MakeCallNode", node: <AddIcCall fontSize="small" /> },
            { key: "HangupNode", node: <CallEnd fontSize="small" /> },
            { key: "TransferNode", node: <PhoneForwarded fontSize="small" /> },
        ]
    },
    {
        group: "flow-control", rootComponent: <></>, tooltip: "Flow Control",
        subComponents: [
            { key: "EmptyNode", node : <CropDin fontSize="small" /> },
            { key: "CatchNode", node : <MoveUp fontSize="small" /> },
            { key: "CallPageNode", node : <FileOpen fontSize="small" /> },
            { key: "ReturnPageNode", node : <Task fontSize="small" /> },
            { key: "GotoPageNode", node : <Link fontSize="small" /> },
            { key: "PauseNode", node : <Pause fontSize="small" /> },
            { key: "EndScenarioNode", node : <Hotel fontSize="small" /> },
        ]
    },
    {
        group: "audio", rootComponent: <VolumeUp fontSize="small" />, tooltip: "Audio",
        subComponents: [
            { key: "PromptNode", node: <VolumeUp fontSize="small" /> },
            { key: "GetDigitsNode", node: <Dialpad fontSize="small" /> },
            { key: "GetDigitPromptNode", node: <Dialpad fontSize="small" />} ,
            { key: "GetDigitsPromptNode", node: <Dialpad fontSize="small" /> },
            { key: "StartMOHNode", node: <MusicNote fontSize="small" /> },
            { key: "StopMOHNode", node: <MusicOff fontSize="small" /> },
            { key: "GetTTSStreamNode", node: <TextFields fontSize="small" /> },
            { key: "GetTTSStreamPromptNode", node: <TextFields fontSize="small" /> },
            { key: "ClearBufferNode", node: <Delete fontSize="small" /> },
            { key: "PromptLanguageNode", node: <Language fontSize="small" /> },
        ]
    },
    {
        group: "record", rootComponent: <MicTwoTone fontSize="small" />, tooltip: "Record",
        subComponents: [
            { key: "RecordNode", node: <MicTwoTone fontSize="small" /> },
            { key: "ASRNode", node: <RecordVoiceOver fontSize="small" /> },
            { key: "PromptASRNode", node: <RecordVoiceOver fontSize="small" /> },
            { key: "StartTransRecNode", node: <Mic fontSize="small" /> },
            { key: "ctlTransRecNode", node: <MicNone fontSize="small" /> },
        ]
    },
    { group: "divider-2", divider: true },
    {
        group: "logical", rootComponent: <Code fontSize="small" />, tooltip: "Logic",
        subComponents : [
            { key: "ScriptNode", node: <Code fontSize="small" /> },
            { key: "IfNode", node: <QuestionMark fontSize="small" /> },
            { key: "CompareNode", node: <Calculate fontSize="small" /> },
            { key: "SwitchNode", node: <CallSplit fontSize="small" /> },
        ]
    },
    { group: "divider-3", divider: true },
    {
        group: "interface", rootComponent: <Sync fontSize="small" />, tooltip: "Interface",
        subComponents: [
            { key: "NetworkStreamNode", node: <Sync fontSize="small" /> },
            { key: "NetworkStreamNodeEx", node: <Sync fontSize="small" /> },
            { key: "GetStreamNode", node: <ContentCut fontSize="small" /> },
            { key: "GetStreamsNode", node: <ContentCut fontSize="small" /> },
        ]
    },
    {
        group: "oamp", rootComponent: <Web fontSize="small" />, tooltip: "for OAMP",
        subComponents: [
            { key: "ServiceStartNode", node: <PlayCircle fontSize="small" /> },
            { key: "ServiceEndNode", node: <StopCircle fontSize="small" /> },
            { key: "ServiceCheckNode", node: <CheckCircle fontSize="small" /> },
            { key: "HolidayNode", node: <CalendarMonth fontSize="small" /> },
            { key: "WorkTimeNode", node: <WorkHistory fontSize="small" /> },
        ]
    },
    { group: "[MEMO]", rootComponent: <Note fontSize="small" />, tooltip: "Memo" },
    { group: "divider-4", divider: true },
    { group: "setttings", rootComponent: <Settings fontSize="small" />, tooltip: "Settings" },
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
    const setCreateMode = useFlowEditState((state) => state.setCreateMode);

    const tab = useEditorTabState((state) => state.tab);

    const handleItemClick = (key: string) => {
        setCreateMode(tab, key);
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