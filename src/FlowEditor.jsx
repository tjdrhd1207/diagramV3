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
		const allTabs = pages.map(page => {
			{/* NOTE 아래 부분을 <></> 에 포함시킬 경우 Warning: Each child in a list should have a unique "key" prop.이 발생하므로 주의하자.
			*/}
			return (
				<Tab key={page.id} eventKey={page.name} title={page.name} className="p-1" style={{}}>
						<Container 
							fluid
							className="rounded-3 p-2" 
							style={{ height: "calc(100vh - var(--webd-toolbar-height) - 59px", border: "5px dashed orange" }}
						>
							{page.name}
						</Container>
				</Tab>
			)
		});

		return (
			<>
				<Tabs variant="tabs" defaultActiveKey={current} transition={false} style={{}}>{allTabs}</Tabs>
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