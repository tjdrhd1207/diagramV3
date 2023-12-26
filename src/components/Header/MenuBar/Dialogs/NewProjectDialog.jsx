import { Autocomplete, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography, createFilterOptions } from "@mui/material"
import React from "react"

const DialogDesc = () => {
	return (
		<Container disableGutters
			sx={{
				width: "500px",
			}}
		>
			<Stack>
				<Typography sx={{ fontSize: 14 }}>
					{"새로운 프로젝트를 생성합니다. 프로젝트 이름은 이름 규칙을 따르는 것을 권장 합니다."}
				</Typography>
				
			</Stack>
		</Container>
	)
}

const InputWorkspace = () => {
	return (
		<>
		</>
	)
}

const InputProjectName = () => {
	return (
		<>
		</>
	)
}


const NewProjectDialog = ({
	open,
	handleClose,
}) => {
	const [workspace, setWorkspace] = React.useState(null);

	const projectList = [
		'IVR_DEMO',
		'TEMP',
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

	const wsOnChange = (event, newValue) => {
		if (typeof newValue === 'string') {
			setWorkspace({
				title: newValue,
			});
		} else if (newValue && newValue.input) {
			setWorkspace({
				title: newValue.input,
			});
		} else {
			setWorkspace(newValue);
		}
	}

	const filter = createFilterOptions();
	const wsFilterOpts = (options, params) => {
		const filtered = filter(options, params);

		const { inputValue } = params;
		const isExisting = options.some((option) => inputValue === option.title);
		if (inputValue !== '' && !isExisting) {
			filtered.push({
				inputValue,
				title: `Add "${inputValue}"`,
			});
		}

		return filtered;
	}

	const wsOptLabel = (option) => {
		if (typeof option === 'string') {
			return option;
		}
		if (option.inputValue) {
			return option.inputValue;
		}
		return option.title;
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
				<Typography variant="h5">
					{"프로젝트 생성"}
				</Typography>
			</DialogTitle>
			<Divider />
			<DialogContent>
				<Stack gap={1}>
					<DialogDesc />
					<Autocomplete
						disablePortal
						size="small"
						value={workspace}
						onChange={wsOnChange}
						filterOptions={wsFilterOpts}
						getOptionLabel={wsOptLabel}
						renderOption={(props, option) => <li {...props}>{option.title}</li>}
						renderInput={(params) => {
							return (
								<TextField
									{...params}
									label="Workspace"
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

export default NewProjectDialog