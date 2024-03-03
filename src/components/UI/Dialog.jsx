import { Box, Fade, Modal, Stack, Typography } from "@mui/material"
import { Children } from "react"

const modalStyle = () => {
    return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    }
}

const DialogInfoBox = ({
    children,
}) => {
    return (
        <Stack
            rowGap={1}
            border={"1px solid lightgray"}
            borderRadius={"5px"}
            padding={"10px"}
        >
            {children}
        </Stack>
    )
}

const CustomModalTitle = ({
    title
}) => {
    return (
        <Typography variant="h6" component="h2">
            {title}
        </Typography>
    )
}

const CustomModalContents = ({
    children
}) => {
    return (
        <Stack rowGap={1} paddingBlock={1}>
            {Children.map(children, child => child)}
        </Stack>
    )
}

const CustomModalAction = ({
    children
}) => {
    return (
        <Stack direction="row" justifyContent="end">
            {Children.map(children, child => child)}
        </Stack>
    )
}

const CustomModal = ({
    open,
    onClose,
    children
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Fade in={open}>
                <Box sx={modalStyle}>
                    {Children.map(children, child => child)}
                </Box>
            </Fade>
        </Modal>
    )
}

export { CustomModal, CustomModalTitle, CustomModalContents, CustomModalAction, DialogInfoBox }