"use client"

import { Divider, IconButton, Menu, MenuItem, MenuList, Popper, Stack, Tooltip } from "@mui/material"
import { grey } from "@mui/material/colors"
import { editor_tab_height, header_height } from "@/consts/g-style-vars"
import { AddIcCall, Calculate, CalendarMonth, Call, CallEnd, CallSplit, CheckCircle, Code, ContentCut, CropDin, Delete, Description, Dialpad, Extension, FileOpen, Hotel, Language, Link, Mic, MicNone, MoveUp, MusicNote, MusicOff, Note, PanTool, PanToolTwoTone, Pause, PhoneForwarded, PlayCircle, QuestionMark, RecordVoiceOver, RingVolume, Settings, StopCircle, Sync, Task, TextFields, TouchApp, TouchAppTwoTone, VolumeUp, Web, WorkHistory } from "@mui/icons-material"
import React from "react"
import { useFlowEditState, FlowEditMode } from "@/store/flow-editor-store"
import { create } from "zustand"

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
        group: "record", rootComponent: <Mic fontSize="small" />, tooltip: "Record",
        subComponents: [
            { key: "RecordNode", node: <Mic fontSize="small" /> },
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

    const setMode = useFlowEditState((state) => state.setMode);

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
            setMode({ name: FlowEditMode.create, target: selected.key });
        }
        handleClose();
    }

    const handleItemClick = (key: string) => {
        setSelected({ key: key, node: props.subIcons.find((i) => i.key === key)?.node });
        setMode({ name: FlowEditMode.create, target: key });
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
                        backgroundColor: grey[100], borderRadius: "8px", border: `1px solid ${grey[400]}`,
                        boxShadow: `0px 0px 4px 4px ${grey[200]}` 
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

    const handleItemClick = (key: string) => {
        setMode({ name: FlowEditMode.create, target: key });
    }

    return (
        <Stack direction="row" gap={0.5}
            sx={{
                height: "50px",
                backgroundColor: grey[100],
                position: "absolute", top: `calc(${header_height} + ${editor_tab_height} + 1%)`, left: `50%`, 
                transform: "translate(-50%, 0%)",
                boxShadow: `0px 0px 4px 4px ${grey[200]}`,
                border: `1px solid ${grey[400]}`, borderRadius: "15px",
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