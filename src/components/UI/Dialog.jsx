import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Paper, Typography } from "@mui/material";
import React from "react";
import Draggable from "react-draggable";

const PaperComponent = (props) => {
	const nodeRef = React.createRef();
	return (
		<Draggable
			handle="#draggable-dialog-title"
			cancel={'[class*="MuiDialogContent-root"]'}
			bounds="body"
			nodeRef={nodeRef}
		>
			<Paper ref={nodeRef} {...props} />
		</Draggable>
	);
}

export const DraggableDialog = (props) => {

	return (
		<Dialog
			open={props.open}
			onClose={props.handleClose}
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
		>
			<DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
				Subscribe
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					To subscribe to this website, please enter your email address here. We
					will send updates occasionally.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={props.handleClose}>
					Cancel
				</Button>
				<Button onClick={props.handleClose}>Subscribe</Button>
			</DialogActions>
		</Dialog>
	)
}