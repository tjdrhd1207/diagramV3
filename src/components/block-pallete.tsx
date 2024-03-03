import { Box, Divider, IconButton, Menu, MenuItem, MenuList, Popper, Stack, Tooltip } from "@mui/material"
import { grey } from "@mui/material/colors"
import { attribute_manager_width, editor_tab_height, explorer_width, header_height } from "./global/g-style-vars"
import { AddIcCall, Calculate, CalendarMonth, Call, CallEnd, CallSplit, CheckCircle, Code, ContentCut, Delete, Description, Dialpad, Extension, FileOpen, Hotel, Language, Link, Mic, MicNone, MoveUp, MusicNote, MusicOff, Note, PanTool, Pause, PhoneForwarded, PlayCircle, QuestionMark, RecordVoiceOver, Settings, StopCircle, Sync, Task, TextFields, TouchApp, VolumeUp, Web, WorkHistory } from "@mui/icons-material"
import React from "react"
import { useFlowEditState, EDIT_MODE_NAMES } from "@/store/flow-editor-store"

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
            { key: "WaitCallNode", node: <Call fontSize="small" /> },
            { key: "MakeCall", node: <AddIcCall fontSize="small" /> },
            { key: "EndCall", node: <CallEnd fontSize="small" /> },
            { key: "TransferCall", node: <PhoneForwarded fontSize="small" /> },
        ]
    },
    {
        group: "flow-control", rootComponent: <></>, tooltip: "Flow Control",
        subComponents: [
            { key: "Event", node : <MoveUp fontSize="small" /> },
            { key: "CallPage", node : <FileOpen fontSize="small" /> },
            { key: "ReturnPage", node : <Task fontSize="small" /> },
            { key: "GoToPage", node : <Link fontSize="small" /> },
            { key: "Pause", node : <Pause fontSize="small" /> },
            { key: "EndScenario", node : <Hotel fontSize="small" /> },
        ]
    },
    {
        group: "audio", rootComponent: <VolumeUp fontSize="small" />, tooltip: "Audio",
        subComponents: [
            { key: "Prompt", node: <VolumeUp fontSize="small" /> },
            { key: "GetDigits", node: <Dialpad fontSize="small" /> },
            { key: "GetDigitPrompt", node: <Dialpad fontSize="small" />} ,
            { key: "GetDigitsPrompt", node: <Dialpad fontSize="small" /> },
            { key: "StartMOH", node: <MusicNote fontSize="small" /> },
            { key: "StopMOH", node: <MusicOff fontSize="small" /> },
            { key: "TTS", node: <TextFields fontSize="small" /> },
            { key: "TTSPrompt", node: <TextFields fontSize="small" /> },
            { key: "ClearBuffer", node: <Delete fontSize="small" /> },
            { key: "Language", node: <Language fontSize="small" /> },
        ]
    },
    {
        group: "record", rootComponent: <Mic fontSize="small" />, tooltip: "Record",
        subComponents: [
            { key: "Record", node: <Mic fontSize="small" /> },
            { key: "ASR", node: <RecordVoiceOver fontSize="small" /> },
            { key: "PromptASR", node: <RecordVoiceOver fontSize="small" /> },
            { key: "StartTransRecord", node: <Mic fontSize="small" /> },
            { key: "ControlTransRecord", node: <MicNone fontSize="small" /> },
        ]
    },
    { group: "divider-2", divider: true },
    {
        group: "logical", rootComponent: <Code fontSize="small" />, tooltip: "Logic",
        subComponents : [
            { key: "Script", node: <Code fontSize="small" /> },
            { key: "If", node: <QuestionMark fontSize="small" /> },
            { key: "Compare", node: <Calculate fontSize="small" /> },
            { key: "Switch", node: <CallSplit fontSize="small" /> },
        ]
    },
    { group: "divider-3", divider: true },
    {
        group: "interface", rootComponent: <Sync fontSize="small" />, tooltip: "Interface",
        subComponents: [
            { key: "NetworkStream", node: <Sync fontSize="small" /> },
            { key: "NetworkStreamEx", node: <Sync fontSize="small" /> },
            { key: "GetStream", node: <ContentCut fontSize="small" /> },
            { key: "GetStreams", node: <ContentCut fontSize="small" /> },
        ]
    },
    {
        group: "oamp", rootComponent: <Web fontSize="small" />, tooltip: "for OAMP",
        subComponents: [
            { key: "ServiceStart", node: <PlayCircle fontSize="small" /> },
            { key: "ServiceEnd", node: <StopCircle fontSize="small" /> },
            { key: "ServiceCheck", node: <CheckCircle fontSize="small" /> },
            { key: "Holiday", node: <CalendarMonth fontSize="small" /> },
            { key: "WorkTime", node: <WorkHistory fontSize="small" /> },
        ]
    },
    { group: "memo", rootComponent: <Note fontSize="small" />, tooltip: "Memo" },
    { group: "divider-4", divider: true },
    { group: "setttings", rootComponent: <Settings fontSize="small" />, tooltip: "Settings" },
]

type AnchorElObject = {
    name: string,
    anchorEl: null | HTMLElement
}

interface PopperState {
    states: AnchorElObject[],
    addState: (state: AnchorElObject) => void,
    setCloseOthers: (name: string) => void
}

const PalletItems = (
    props:{
        group: string,
        rootIcon: React.ReactNode,
        tooltip?: string
        subIcons: Array<{key: string, node: React.ReactNode}>,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const defaultSelect = props.subIcons?.[0];
    const [selected, setSelected] = React.useState<any>(defaultSelect);
    const open = Boolean(anchorEl);

    const setMode = useFlowEditState((state) => state.setMode);

    const handleMounseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleRootClick = () => {
        if (selected) {
            setMode({ name: EDIT_MODE_NAMES.edit, target: selected.key });
        }
        handleClose();
    }

    const handleItemClick = (key: string) => {
        setSelected({ key: key, node: props.subIcons.find((i) => i.key === key)?.node });
        handleClose();
    }
    
    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title={props.tooltip} placement="top" enterDelay={1000} enterNextDelay={1000}>
                <IconButton onMouseEnter={handleMounseEnter} onClick={handleRootClick} sx={{ ...item_radius }}>
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
                            <IconButton sx={{ ...item_radius }}>{b.rootComponent}</IconButton>
                        </Tooltip>
                    )
                }
            })}
            {/* <IconButton sx={{ ...item_radius }}><PanTool fontSize="small" /></IconButton>
            <IconButton sx={{ borderRadius: "8px" }}><TouchApp fontSize="small" /></IconButton>
            <Divider orientation="vertical" variant="middle" flexItem />
            <PalletItems group="call-control" rootIcon={<Call fontSize="small" />} 
                subIcons={[
                    { key: "WaitCallNode", node: <Call fontSize="small" /> },
                    { key: "MakeCall", node: <AddIcCall fontSize="small" /> },
                    { key: "EndCall", node: <CallEnd fontSize="small" /> },
                    { key: "TransferCall", node: <PhoneForwarded fontSize="small" /> },
                ]}
                tooltip="Call Control"
            />
            <PalletItems group="flow-control" rootIcon={<Description fontSize="small" />}
                subIcons={[
                    { key: "Event", node : <MoveUp fontSize="small" /> },
                    { key: "CallPage", node : <FileOpen fontSize="small" /> },
                    { key: "ReturnPage", node : <Task fontSize="small" /> },
                    { key: "GoToPage", node : <Link fontSize="small" /> },
                    { key: "Pause", node : <Pause fontSize="small" /> },
                    { key: "EndScenario", node : <Hotel fontSize="small" /> },
                ]}
                tooltip="Flow Control"
            />
            <PalletItems group="audio" rootIcon={<VolumeUp fontSize="small" />}
                subIcons={[
                    { key: "Prompt", node: <VolumeUp fontSize="small" /> },
                    { key: "GetDigits", node: <Dialpad fontSize="small" /> },
                    { key: "GetDigitPrompt", node: <Dialpad fontSize="small" />} ,
                    { key: "GetDigitsPrompt", node: <Dialpad fontSize="small" /> },
                    { key: "StartMOH", node: <MusicNote fontSize="small" /> },
                    { key: "StopMOH", node: <MusicOff fontSize="small" /> },
                    { key: "TTS", node: <TextFields fontSize="small" /> },
                    { key: "TTSPrompt", node: <TextFields fontSize="small" /> },
                    { key: "ClearBuffer", node: <Delete fontSize="small" /> },
                    { key: "Language", node: <Language fontSize="small" /> },
                ]}
                tooltip="Audio"
            />
            <PalletItems group="record" rootIcon={<Mic fontSize="small" />} 
                subIcons={[
                    { key: "Record", node: <Mic fontSize="small" /> },
                    { key: "ASR", node: <RecordVoiceOver fontSize="small" /> },
                    { key: "PromptASR", node: <RecordVoiceOver fontSize="small" /> },
                    { key: "StartTransRecord", node: <Mic fontSize="small" /> },
                    { key: "ControlTransRecord", node: <MicNone fontSize="small" /> },
                ]}
                tooltip="Record"
            />
            <Divider orientation="vertical" variant="middle" flexItem />
            <PalletItems group="logical" rootIcon={<Code fontSize="small" />}
                subIcons={[
                    { key: "Script", node: <Code fontSize="small" /> },
                    { key: "If", node: <QuestionMark fontSize="small" /> },
                    { key: "Compare", node: <Calculate fontSize="small" /> },
                    { key: "Switch", node: <CallSplit fontSize="small" /> },
                ]}
                tooltip="Logical"
            />
            <PalletItems group="interface" rootIcon={<Sync fontSize="small" />}
                subIcons={[
                    { key: "NetworkStream", node: <Sync fontSize="small" /> },
                    { key: "NetworkStreamEx", node: <Sync fontSize="small" /> },
                    { key: "GetStream", node: <ContentCut fontSize="small" /> },
                    { key: "GetStreams", node: <ContentCut fontSize="small" /> },
                ]}
                tooltip="Interface"
            />
            <Divider orientation="vertical" variant="middle" flexItem />
            <PalletItems group="oamp" rootIcon={<Web fontSize="small" />}
                subIcons={[
                    { key: "ServiceStart", node: <PlayCircle fontSize="small" /> },
                    { key: "ServiceEnd", node: <StopCircle fontSize="small" /> },
                    { key: "ServiceCheck", node: <CheckCircle fontSize="small" /> },
                    { key: "Holiday", node: <CalendarMonth fontSize="small" /> },
                    { key: "WorkTime", node: <WorkHistory fontSize="small" /> },
                ]}
                tooltip="OAMP"
            />
            <Tooltip title="Memo">
                <IconButton sx={{ borderRadius: "8px" }}><Note fontSize="small" /></IconButton>
            </Tooltip>
            <IconButton sx={{ borderRadius: "8px" }}><Extension fontSize="small" /></IconButton>
            <Divider orientation="vertical" variant="middle" flexItem />
            <IconButton sx={{ borderRadius: "8px" }}><Settings fontSize="small" /></IconButton> */}
        </Stack>
    )
}