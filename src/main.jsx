import React from 'react'
import ReactDOM from 'react-dom/client'
import BlockPallete from './BlockPallette'
import './index.css'
import { Col, Row } from 'react-bootstrap'
import ToolBar from './ToolBar'
import TabEditor from './ScenarioEditor'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		{/* TODO  style 도 parameter 로 전달하는 방법 찾기 */}
		<ToolBar />
		<Row className="m-0" style={{ height: "100vh" }}>
			{/* <Row className="m-0" style={{height: "100vh"}}> */}
			<Col xs={2} className='border-end p-0' style={{ minWidth: "200px", marginTop: "var(--webd-toolbar-height)" }}>
				<BlockPallete title="Pallete" type="p-1" />
			</Col>
			<Col className='p-2' style={{ marginTop: "var(--webd-toolbar-height)" }}>
				<TabEditor />
			</Col>
		</Row>
	</React.StrictMode>,
)
