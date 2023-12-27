import { Autocomplete, Box, Button, Chip, Collapse, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemIcon, ListItemText, Stack, TextField, Typography, createFilterOptions } from "@mui/material"
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import React from "react"
import { GET_WORKSPACE_INFO_URL } from "../../../../api/serverinfo";
import axios from 'axios'

const workspaceInfo = [
	{name: "은행", projects: ["main", "loan", ]},
	{name: "카드", projects: ["main", "loan", "temp"]},
	{name: "생명", projects: ["main", ]},
]

const projectList = [
	'IVR_DEMO',
	'TEMP',
];

const DialogDesc = () => {
	const [expanded, setExpanded] = React.useState(false);

	const handleSetOpen = () => {
		setExpanded(!expanded);
	}

	return (
		<Container disableGutters
			sx={{
				width: "500px",
			}}
		>
			<Stack>
				<Typography variant="body1">
					{"새로운 프로젝트를 생성합니다. 프로젝트 이름은 이름 규칙을 따르는 것을 권장 합니다."}
				</Typography>
				<Stack
					direction="row"
					alignItems="center"
					onClick={handleSetOpen}
					sx={{
						borderBlockEnd: "1px solid lightgray"
					}}
				>
					{expanded ? <ExpandLess /> : <ExpandMore />}
					<Typography variant="subtitle2">
						이름 규칙
					</Typography>
				</Stack>
				<Collapse
					in={expanded}
					timeout="auto"
					unmountOnExit
				>
					<Box sx={{ paddingBlock: "5px" }}>
						<Typography variant="body2">
							✅ 프로젝트 이름은 영어 대소문자, 숫자, 밑줄로 시작해야 합니다.<br />
							✅ 프로젝트 이름에는 점, 짧은 선, 더하기가 포함될 수 있습니다.<br /><br />
							🚫 프로젝트 이름에는 공백, 특수문자가 포함할 수 없습니다.
						</Typography>
					</Box>
				</Collapse>
			</Stack>
		</Container>
	)
}

const InputWorkspace = ({
	workspace,
	setWorkspace,
	wsInfo
}) => {

	const wsOnChange = (event, newValue) => {
		if (typeof newValue === 'string') {
			setWorkspace({
				name: newValue,
			});
		} else if (newValue && newValue.inputValue) {
			setWorkspace({
				name: newValue.inputValue,
			});
		} else {
			setWorkspace(newValue);
		}
	}

	const filter = createFilterOptions();
	const wsFilterOpts = (options, params) => {
		const filtered = filter(options, params);

		const { inputValue } = params;
		const isExisting = options.some((option) => inputValue === option.name);
		if (inputValue !== '' && !isExisting) {
			filtered.push({
				inputValue,
				name: `Add "${inputValue}"`
			});
		}

		return filtered;
	}

	const wsGetOptLabel = (option) => {
		if (typeof option === 'string') {
			return option;
		}
		if (option.inputValue) {
			return option.inputValue;
		}
		return option.name;
	}

	const wsRenderOpts = (props, option) => {
		return (
			<Box component="li" {...props}>
				{option.name}
			</Box>
		)
	}

	return (
		<Autocomplete
			disablePortal
			size="small"
			value={workspace}
			onChange={wsOnChange}
			filterOptions={wsFilterOpts}
			getOptionLabel={wsGetOptLabel}
			renderOption={wsRenderOpts}
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
			options={wsInfo? wsInfo : []}
			freeSolo
		/>
	)
}

const InputProjectName = ({
	projectName,
	setProjectName
}) => {
	const vaildateProjectName = (input) => {
		if (input == '' || input == null) {
			setProjectName({ ...projectName, name: undefined, validate: false, helperText: "⚠️ 이름은 필수 항목입니다." });
			return;
		}
		if (projectList.find(name => name === input)) {
			setProjectName({ ...projectName, name: undefined, validate: false, helperText: "⚠️ 입력하신 프로젝트 이름이 존재합니다." })
		} else {
			setProjectName({ ...projectName, name: input, validate: true, helperText: "" })
		}
	}

	return (
		<TextField
			label="Project Name *"
			variant="standard"
			error={!projectName.validate}
			helperText={projectName.helperText}
			onChange={(event) => vaildateProjectName(event.target.value)}
			sx={{ width: "500px" }}
		/>
	)
}


const NewProjectDialog = ({
	open,
	handleClose,
}) => {
	const initProjectName = {
		validate: false,
		helperText: "⚠️ 이름은 필수 항목입니다.",
	}
	const [projectName, setProjectName] = React.useState(initProjectName);
	const [workspace, setWorkspace] = React.useState(null);
	const [wsInfo, setWSInfo] = React.useState(null);

	React.useEffect(() => {
		if (open) {
			setProjectName(initProjectName);

			let wsInfo = [];
			axios
				.get(GET_WORKSPACE_INFO_URL)
				.then(res => {
					const data = res.data;
					if (Array.isArray(data)) {
						setWSInfo(data);
					}
				});
	
		}
	}, [open])

	const handleDlgClose = () => {
		handleClose();
	}

	const handleCreateProject = () => {
		alert(JSON.stringify(workspace) + JSON.stringify(projectName));
		handleClose();
	}

	return (
		<Dialog
			open={open}
			onClose={handleDlgClose}
		>
			<DialogTitle id="new-project-dialog-title">
				{"프로젝트 생성"}
			</DialogTitle>
			<Divider />
			<DialogContent>
				<Stack gap={1}>
					<DialogDesc />
					<InputWorkspace workspace={workspace} setWorkspace={setWorkspace} wsInfo={wsInfo}/>
					<InputProjectName projectName={projectName} setProjectName={setProjectName} />
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" disabled={(!projectName.validate) || (!workspace)} onClick={handleCreateProject}>생성</Button>
				<Button onClick={handleDlgClose} autoFocus>취소</Button>
			</DialogActions>
		</Dialog>
	)
}

export default NewProjectDialog