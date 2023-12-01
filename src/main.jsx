// ReactDOM.createRoot(document.getElementById('root')).render(
// 	<React.StrictMode>
// 		TODO  style 도 parameter 로 전달하는 방법 찾기 */}
// 		<ToolBar />
// 		{/* <Row className="m-0" style={{ height: "100vh" }}>
// 			<Col id="block-pallete" xs={2} className='border-end p-0'>
// 				<Accordion flush defaultActiveKey={["p", "e"]} alwaysOpen>
// 					<AccordionItem eventKey={"p"}>
// 						<AccordionHeader>PALLETE</AccordionHeader>
// 						<AccordionBody className="p-0">
// 							<BlockPallete title="Pallete" type="p-0" />
// 						</AccordionBody>
// 					</AccordionItem>
// 					<AccordionItem eventKey={"e"}>
// 						<AccordionHeader>EXPLORER</AccordionHeader>
// 						<AccordionBody>
// 							<Directory />
// 						</AccordionBody>
// 					</AccordionItem>
// 				</Accordion>
// 			</Col>
// 			<Col id="tab-editor" className='p-1'>
// 				<TabEditor />
// 			</Col>
// 		</Row>
// 	</React.StrictMode>,
// )
import React from 'react'
import ReactDOM from 'react-dom/client'
import MainLayout from './layout'


ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<MainLayout />
	</React.StrictMode>
)