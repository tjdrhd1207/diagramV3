import { Modal, Sheet, ModalClose, Typography } from "@mui/joy"
import React from "react"

export default function DataManager(props) {
	return (
		<Modal
			aria-labelledby="modal-title"
			aria-describedby="modal-desc"
			open={props.open}
			onClose={() => props.setOpen(false)}
			sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
		>
			<Sheet
				variant="outlined"
				sx={{
					maxWidth: 500,
					borderRadius: 'md',
					p: 3,
					boxShadow: 'lg',
				}}
			>
				<ModalClose variant="plain" sx={{ m: 1 }} />
				<Typography
					component="h2"
					id="modal-title"
					level="h4"
					textColor="inherit"
					fontWeight="lg"
					mb={1}
				>
					This is the modal title
				</Typography>
				<Typography id="modal-desc" textColor="text.tertiary">
					Make sure to use <code>aria-labelledby</code> on the modal dialog with an
					optional <code>aria-describedby</code> attribute.
				</Typography>
			</Sheet>
		</Modal>
	)
}