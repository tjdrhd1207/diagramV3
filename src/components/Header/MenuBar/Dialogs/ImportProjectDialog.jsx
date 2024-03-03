import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, Input, InputAdornment, InputLabel, Stack, Typography } from "@mui/material";
import { DialogInfoBox } from "../../../UI/Dialog";
import { AttachFile, Close } from "@mui/icons-material";
import React from "react";
import { MuiFileInput } from "mui-file-input";

const DialogDesc = () => {
	return (
		<DialogInfoBox>
			<Typography variant="body1" gutterBottom>
				불러올 프로젝트를 선택합니다.
			</Typography>
			<Typography variant="body2" color="orange" gutterBottom>
				⚠️ 시나리오디자이너 v2의 프로젝트를 불러온 후 수정하게되면 v3 형식으로 저장됩니다.
			</Typography>
		</DialogInfoBox>
	)
}

const InputDirectory = () => {
	const [file, setFile] = React.useState(null)

	const handleChange = (newFile) => {
		setFile(newFile)
	}

	return (
		<MuiFileInput
			required
			size="small"
			variant="standard"
			label="대상 프로젝트"
			value={file}
			onChange={handleChange}
			InputProps={{
				inputProps: {
					accept: ".zip"
				},
				startAdornment: <AttachFile fontSize="small"/>
			}}
			clearIconButtonProps={{
				title: "Remove",
				children: <Close fontSize="small" />
			}}
		/>
	)
}

const InputWorkspace = () => {
	return (
		<>
		</>
	)
}

const ImportProjectDialog = ({
	open,
	handleClose,
}) => {
	const handleDlgClose = () => {
		handleClose();
	}

	return (
		<Dialog
			open={open}
			onClose={handleDlgClose}
		>
			<DialogTitle id="import-project-dialog-title">
				프로젝트 불러오기
			</DialogTitle>
			<Divider />
			<DialogContent>
				<Stack rowGap={1}>
					<DialogDesc />
					<Stack rowGap={1} padding={"5px"}>
						<InputDirectory />
						<InputWorkspace />
					</Stack>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button variant="contained">불러오기</Button>
				<Button autoFocus>취소</Button>
			</DialogActions>
		</Dialog>
	)
}

export default ImportProjectDialog