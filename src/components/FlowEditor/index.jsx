import { Box, Button, Container, Tab, Tabs } from "@mui/material";
import React from "react";
import HansolDiagram from "../../diagram";
import { FlowContext } from "../MainLayout";

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

export default function FlowEditor() {
	const [value, setValue] = React.useState(0);

	const flowCtx = React.useContext(FlowContext);
	const {mode, setMode} = flowCtx;

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<>
			<Container
				disableGutters
				sx={{
					height: "calc(100vh - var(--header-height))",
					width: "calc(100vw - var(--sidebar-width) - var(--attrbar-width))",
					marginInline: "0px",
					// zIndex: -1,
				}}
			>
				<Tabs
					value={value}
					onChange={handleChange}
					variant="scrollable"
					scrollButtons="auto"
					sx={{
						borderBottom: "1px solid"
					}}
				>
					<Tab label="Item One" />
					<Tab label="Item Two" />
					<Tab label="Item Three" />
					<Tab label="Item Four" />
					<Tab label="Item Five" />
					<Tab label="Item Six" />
					<Tab label="Item Seven" />
				</Tabs>
				<TabPanel value={value} index={0}>
					<SVGDiagram pageName="page1" mode={mode} setMode={setMode}/>
				</TabPanel>
				<TabPanel value={value} index={1}>
					<SVGDiagram pageName="page2" mode={mode} setMode={setMode}/>
				</TabPanel>
			</Container>
		</>
	)
}