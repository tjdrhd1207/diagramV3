import React from "react";
import { Container, Tab, Tabs } from "react-bootstrap";

// NOTE https://codesandbox.io/p/sandbox/tab-creator-w2uwh?file=%2Fsrc%2Findex.js%3A20%2C28

class TabEditor extends React.Component {
	state = {
		pages: [
			{id: "1", name: "ivrmain", content: "contents for ivrmain page"},
			{id: "2", name: "sub-page", content: "contents for sub-page"},
		],
		current: "ivrmain"
	}

	createTabs = () => {
		const {pages, current} = this.state;
		console.log(this.state)
		const allTabs = pages.map(page => {
			{/* NOTE 아래 부분을 <></> 에 포함시킬 경우 Warning: Each child in a list should have a unique "key" prop.이 발생하므로 주의하자.
			*/}
			return (
				<Tab key={page.id} eventKey={page.name} title={page.name}>
						<Container fluid className="bg-warning rounded-3">
							1
						</Container>
				</Tab>
			)
		});

		return (
			<>
				<Tabs defaultActiveKey={current} transition={false}>{allTabs}</Tabs>
			</>
		)
	}

	handleSelTab = tab => {
		this.setState({
			current: tab
		})
	}

	render() {
		return (
			<>
				{this.createTabs()}
			</>
		)
	}
}

export default TabEditor