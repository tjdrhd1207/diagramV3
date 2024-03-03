import { Box, Button, Container, Fab, Modal, Tab, Tabs } from "@mui/material";
import React from "react";
import HansolDiagram from "../../../api/diagram";
import { FlowContext } from "..";
import { JSEditor } from "../../UI/CustomEditor";
import { Add } from "@mui/icons-material";

const Library = HansolDiagram();

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			{...other}
		>
			{children}
		</div>
	);
}

class SVGDiagram extends React.Component {

	constructor(props) {
		super(props);
		this.diagram = null;
		this._svg = null;
	}
	
	componentDidMount() {
		let options = {
			useBackgroundPattern: true,
			linkLineType: "bezier",
			onBlockClicked: (block, userProps) => this.onBlockClicked(block, userProps),
		};
		this.diagram = new Library.Diagram("#" + this.props.pageName, options);
	}

	shouldComponentUpdate(nextProps, nextState) {
		// TODO 모든 텝이 같은 mode 를 참조 하고 있어 mode 가 변경될 때 아래 로직이 모두 실행 되는 문제 해결이 필요하다.
		if (this.props.mode.current !== nextProps.mode.current) {
			this.addBlock();
		}
		return true;
	}

	onBlockClicked(block, userProps) {
		if (this.props.setMode) {
			this.props.setMode({
				mode: "edit",
				current: this.props.mode.current,
				attributes: userProps,
			})
		}
		console.log(userProps);
	}

	addBlock() {
		let userProps = { "prompt": "main_menu.alw", count: 1 };
		this.diagram.setCreateMode(userProps);
	}

	render() {
		let self = this;

		return (
			<div
				style={{
					overflow: "scroll"
				}}
			>
				<svg xmlns="http://www.w3.org/2000/svg"
					ref={
						function (el) {
							self._svg = el;
						}
					}
					id={this.props.pageName}
					style={{
						backgroundColor: "#eee",
						width: "100%",
						height: "calc(100vh - var(--header-height) - 48px - 25px)",
					}}
				/>
			</div>
		);
	}
}

const FlowEditor = () => {
	const [value, setValue] = React.useState(0);

	const flowCtx = React.useContext(FlowContext);
	const {mode, setMode} = flowCtx;

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const [open, setOpen] = React.useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	return (
		<>
			<Box
				sx={{
					height: "calc(100vh - var(--header-height))",
					width: "calc(100vw - var(--sidebar-width) - var(--attrbar-width))",
					marginInline: "0px",
				}}
			>
				<Tabs
					value={value}
					onChange={handleChange}
					variant="scrollable"
					scrollButtons="auto"
					sx={{
						borderBottom: "1px solid",
					}}
				>
					<Tab label="Item One" />
					<Tab label="Item Two" />
				</Tabs>
				<TabPanel value={value} index={0}>
					<Button sx={{ position: "absolute", left: "50%", transform: 'translate(-50%, 50%)', }} onClick={handleOpen}>얍</Button>
					<SVGDiagram pageName="page1" mode={mode} setMode={setMode}/>
					<Modal
						open={open}
						onClose={handleClose}
					>
						<Box
							sx={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								width: 400,
								bgcolor: 'background.paper',
								// border: '2px solid #000',
								boxShadow: 24,
								borderRadius: 3,
								p: 4,
							}}
						>
							<JSEditor />
						</Box>
					</Modal>
				</TabPanel>
				<TabPanel value={value} index={1}>
					{/* <SVGDiagram pageName="page2" mode={mode} setMode={setMode}/> */}
					<Box
						sx={{
							height: "calc(100vh - var(--header-height) - 48px - 25px)",
							overflow: "auto",
						}}
					>
						<JSEditor />
					</Box>
				</TabPanel>
			</Box>
		</>
	)
}

export default FlowEditor