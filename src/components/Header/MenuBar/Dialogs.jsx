import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider, Stack, Autocomplete, TextField } from "@mui/material"
import React from "react"

export const SimpleDialog = ({
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


export const NewProjectDialog = ({
	open,
	handleClose,
}) => {
	const projectList = [
		'IVR_DEMO',
		'TEMP'
	];

	const initNameState = {
		validate: false,
		helperText: "⚠️ 이름은 필수 항목입니다.",
	}
	const [nameState, setNameState] = React.useState(initNameState);

	const vaildateProjectName = (input) => {
		if (input == '' || input == null) {
			setNameState({...nameState, validate: false, helperText: "⚠️ 이름은 필수 항목입니다."});
			return;
		}
		if (projectList.find(name => name === input)) {
			setNameState({...nameState, validate: false, helperText: "⚠️ 입력하신 프로젝트 이름이 존재합니다."})
		} else {
			setNameState({...nameState, validate: true, helperText: ""})
		}
	}

	const handleDlgClose = () => {
		handleClose();
	}

	React.useEffect(() => {
		if (open) {
			setNameState(initNameState);
		}
	}, [open])

	return (
		<Dialog
			open={open}
			onClose={handleDlgClose}
		>
			<DialogTitle id="new-project-dialog-title">
				{"Create New Project"}
			</DialogTitle>
			<Divider />
			<DialogContent>
				<Stack gap={1}>
					<Autocomplete
						disablePortal
						size="small"
						defaultValue="Default"
						renderInput={(params) => {
							return (
									<TextField 
										{...params}
										label="Domain"
										variant="standard"
										sx={{ width: "500px" }}
									/>
								)
							}}
						options={[]}
					/>
					<TextField 
						label="Project Name *"
						variant="standard"
						error={!nameState.validate}
						helperText={nameState.helperText}
						onChange={(event) => vaildateProjectName(event.target.value)}
						sx={{ width: "500px" }}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" disabled={!nameState.validate} onClick={handleDlgClose}>Create</Button>
				<Button onClick={handleDlgClose} autoFocus>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	)
}