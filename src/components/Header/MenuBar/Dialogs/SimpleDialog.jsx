import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material"

const SimpleDialog = ({
	open,
	handleClose,
}) => {
	return (
		<Dialog
			open={open}
			onClose={handleClose}
		>
			<DialogTitle id="simple-dialog-title">
				{"Simple Dialog"}
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="simple-dialog-description">
					테스트를 위한 임시 다이얼로그 입니다.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Disagree</Button>
				<Button onClick={handleClose} autoFocus>
					Agree
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default SimpleDialog