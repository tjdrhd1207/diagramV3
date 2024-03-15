import { Box, Button, Stack, Typography } from "@mui/material"
import { CustomModal, CustomModalAction, CustomModalContents, CustomModalTitle } from "../common/modal"
import { Info, Warning } from "@mui/icons-material"

interface DialogProps {
    open: boolean | undefined,
    onClose: () => void,
    title: string,
    result: string | undefined,
    children: React.ReactNode
}

export const FetchResultDialog = (props: DialogProps) => {

    const renderIcon = () => {
        if (props.result === "OK") {
            return <Info color="success" fontSize="large"/>
        } else {
            return <Warning color="warning" fontSize="large"/>
        }
    }

    return (
        <CustomModal open={props.open? props.open : false} onClose={props.onClose}>
            <CustomModalTitle title={props.title} />
            <CustomModalContents>
                <Stack direction="row" gap={2} alignItems="center">
                    {renderIcon()}
                    {props.children}
                </Stack>
            </CustomModalContents>
            <CustomModalAction>
                <Button size="small" onClick={props.onClose}>Confirm</Button>
            </CustomModalAction>
        </CustomModal>
    )
}