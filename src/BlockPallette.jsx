import PropTypes from "prop-types"
import { useState } from 'react';
import { Collapse, Container, ListGroup, ListGroupItem } from "react-bootstrap";

// eslint-disable-next-line no-unused-vars
function SimpleMenuItem(name, disabled = false) {
	return (
		<>
			<ListGroup.Item as="h3" className="border-0" disabled={disabled}>
				{name}
			</ListGroup.Item>
		</>
	)
}

/**
 * @param {string} name
 */
function CollapseMenuIten(name) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<ListGroup.Item 
				action
				// active
				variant="primary"
				className="border-0"
				onClick={() => setOpen(!open)}
				aria-controls="collapse-text"
				aria-expanded={open}
			>
				{name}
			</ListGroup.Item>
			<Collapse in={open}>
				<ListGroup>
					<ListGroupItem className="border-0">1</ListGroupItem>
					<ListGroupItem className="border-0">2</ListGroupItem>
				</ListGroup>
			</Collapse>
		</>
	)
}

/**
 * @param {{ type: string; title: string; }} props
 */
function BlockPallete(props) {
	{/* TODO Block 에 대한 정의를 json 으로 정의하여 동적으로 pallete 구성하도록 수정 */}
	return (
		<>
			<Container className={props.type} style={{}}>
				{/* NOTE 높이 설정에는 % 가 아닌 vh 를 사용해야 한다. */}
				<ListGroup variant="flush">
					{/* {SimpleMenuItem(props.title)} */}
					{CollapseMenuIten('시나리오')}
					{CollapseMenuIten('컨트롤')}
					{CollapseMenuIten('음성')}
					{CollapseMenuIten('서비스')}
				</ListGroup>
			</Container>
		</>
	);
}

BlockPallete.propTypes = {
	type: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
}

export default BlockPallete