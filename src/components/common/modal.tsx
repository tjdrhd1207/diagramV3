import { Box, Fade, Modal, Stack, Typography } from "@mui/material"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, PromiseLikeOfReactNode, Children } from "react"

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 3,
}

const infoboxStyle = {
    border: "1px solid lightgray",
    borderRadius: "5px",
    padding: "10px"
}

export const CustomModalInfoBox = (
    props: {
        children: React.ReactNode
    }
) => {
    return (
        <Stack rowGap={1} sx={infoboxStyle}>
            {props.children}
        </Stack>
    )
}

export const CustomModalTitle = (
    props: {
        title: string
    }
) => {
    return (
        <Box>
            <Typography variant="h6">
                {props.title}
            </Typography>
        </Box>
    )
}

export const CustomModalContents = (
    props: {
        children: React.ReactNode
    }
) => {
    return (
        <Stack rowGap={1} paddingBlock={1}>
            {Children.map(props.children, child => child)}
        </Stack>
    )
}

export const CustomModalAction = (
    props: {
        children: React.ReactNode
    }
) => {
    return (
        <Stack gap={1} direction="row" justifyContent="end">
            {Children.map(props.children, child => child)}
        </Stack>
    )
}

export const CustomModal = (
    props: {
        open: boolean,
        onClose: () => void,
        onTransitionEnter?: () => void,
        children: React.ReactNode
    }
) => {
    return (
        <Modal open={props.open} onClose={props.onClose} onTransitionEnter={props.onTransitionEnter} disableRestoreFocus>
            <Fade in={props.open}>
                <Box sx={modalStyle}>
                    {Children.map(props.children, child => child)}
                </Box>
            </Fade>
        </Modal>
    )
}
