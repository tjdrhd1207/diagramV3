import { Box, Button, Container, Tab, Tabs } from "@mui/material";
import React from "react";
import Diagram from "../../diagram";

function CustomTabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{/* {value === index && (
				<>
					{children}
				</>
			)} */}
			{children}
		</div>
	);
}

class SVGDiagram extends React.Component {

	constructor(props) {
		super(props);
		this.diagram = null;
		this._svg = null;
		this.state = {

		}
	}
	
	componentDidMount() {
		console.log("componentDidMount: Component just mounted!", this._svg);
		let options = {
			useBackgroundPattern: true,
			linkLineType: "bezier",
			onBlockClicked: this.onBlockClicked,
		};
		console.log(this._svg.getAttributeNS(null, "id"));
		this.diagram = new Diagram("#" + this.props.pageName, options);
		console.log(this.diagram);
	}

	shouldComponentUpdate() {
		console.log('shouldComponentUpdate', this.props);
		this.addBlock();
		return false;
	}

	onBlockClicked(block, userProps) {
		console.log(userProps);
	}

	addBlock() {
		let userProps = { "prompt": "main_menu.alw", count: 1 };
		console.log(userProps);
		this.diagram.setCreateMode(userProps);
	}

	render() {
		console.log("render()");
		let svgStyle = {
			backgroundColor: "#ccc",
			width: "100%",
			height: "500px",
		};
		let self = this;

		const addBlock = () => {
			this.addBlock();
		}
		return (
			<div className="svg-container">
				<svg xmlns="http://www.w3.org/2000/svg"
					ref={
						function (el) {
							self._svg = el;
						}
					}
					id={this.props.pageName}
					style={svgStyle}
				/>
			</div >
		);
	}
}

export default function FlowEditor() {
	const [value, setValue] = React.useState(0);
	const [temp, setTemp] = React.useState(false);

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
					// zIndex: -1,
				}}
			>
				<Box>
					<Tabs
						value={value}
						onChange={handleChange}
						variant="scrollable"
						scrollButtons="auto"
						aria-label="scrollable auto page tabs"
					>
						<Tab label="Item One" />
						<Tab label="Item Two" />
						<Tab label="Item Three" />
						<Tab label="Item Four" />
						<Tab label="Item Five" />
						<Tab label="Item Six" />
						<Tab label="Item Seven" />
					</Tabs>
				</Box>
				<CustomTabPanel value={value} index={0}>
					<SVGDiagram pageName="page1" temp={temp}/>
				</CustomTabPanel>
				<CustomTabPanel value={value} index={1}>
					<SVGDiagram pageName="page2" temp={temp}/>
				</CustomTabPanel>
				<Button onClick={() => {return setTemp(!temp)}}>click</Button>
			</Container>
		</>
	)
}