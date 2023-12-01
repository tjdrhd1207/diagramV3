// function ToolBar() {
// 	return (
// 		<>
// 			{/* <Container fluid className="p-0 m-0"> */}
// 				<Navbar fixed="top" className="text-bg-dark" id="tool-bar" style={{height: "var(--webd-toolbar-height)"}}>
// 					<Navbar.Brand href="#" className="text-bg-dark">
// 							<img
// 								alt=""
// 								src="logo.svg"
// 								width="100"
// 								height="30"
// 								className="d-inline-block align-center"
// 							/>{' '}
// 					</Navbar.Brand>
// 					<Navbar.Toggle aria-controls="basic-navbar-nav" />
// 					<Navbar.Collapse>
// 						<Nav className="me-auto my-2 my-lg-0">
// 							<NavDropdown title={<span className="text-bg-dark">File</span>} data-bs-theme="dark" >
// 								<NavDropdown.Item >New Project</NavDropdown.Item>
// 								<NavDropdown.Item>Open Project</NavDropdown.Item>
// 								<NavDropdown.Item>Close Project</NavDropdown.Item>
// 								<NavDropdown.Divider />
// 								<NavDropdown.Item>Save</NavDropdown.Item>
// 								<NavDropdown.Item>Save As...</NavDropdown.Item>
// 								<NavDropdown.Item>Save All</NavDropdown.Item>
// 								<NavDropdown.Item>Print</NavDropdown.Item>
// 								<NavDropdown.Divider />
// 								<NavDropdown.Item>Recent Projects</NavDropdown.Item>
// 							</NavDropdown>
// 							<NavDropdown title={<span className="text-bg-dark">Edit</span>} data-bs-theme="dark">
// 								<NavDropdown.Item>Undo</NavDropdown.Item>
// 								<NavDropdown.Item>Redo</NavDropdown.Item>
// 								<NavDropdown.Divider />
// 								<NavDropdown.Item>Cut</NavDropdown.Item>
// 								<NavDropdown.Item>Copy</NavDropdown.Item>
// 								<NavDropdown.Item>Paste</NavDropdown.Item>
// 								<NavDropdown.Divider />
// 								<NavDropdown.Item>Find</NavDropdown.Item>
// 								<NavDropdown.Item>Replace</NavDropdown.Item>
// 							</NavDropdown>
// 							<NavDropdown title={<span className="text-bg-dark">Project</span>} data-bs-theme="dark">
// 								<NavDropdown.Item>Build Project</NavDropdown.Item>
// 								<NavDropdown.Item>Build Page</NavDropdown.Item>
// 								<NavDropdown.Divider />
// 								<NavDropdown.Item>Data Manager</NavDropdown.Item>
// 								<NavDropdown.Item>Deploy</NavDropdown.Item>
// 							</NavDropdown>
// 							<NavDropdown title={<span className="text-bg-dark">Tools</span>} data-bs-theme="dark">
// 								<NavDropdown.Item>Log Analyze</NavDropdown.Item>
// 								<NavDropdown.Item>Compare Project</NavDropdown.Item>
// 							</NavDropdown>
// 							<NavDropdown title={<span className="text-bg-dark">Help</span>} data-bs-theme="dark">
// 								<NavDropdown.Item>Welcome</NavDropdown.Item>
// 								<NavDropdown.Item>Show All Commands</NavDropdown.Item>
// 								<NavDropdown.Item>Documantation</NavDropdown.Item>
// 								<NavDropdown.Item>Show Release Notes</NavDropdown.Item>
// 								<NavDropdown.Divider />
// 								<NavDropdown.Item>About</NavDropdown.Item>
// 							</NavDropdown>
// 						</Nav>
// 						<Form className="d-flex">
// 							<Form.Control
// 								type="search"
// 								placeholder="Search"
// 								className="me-2"
// 								aria-label="Search"
// 								data-bs-theme="dark"
// 								/>
// 							<Button variant="success">Search</Button>
// 						</Form>
// 					</Navbar.Collapse>
// 				</Navbar>
// 			{/* </Container> */}
// 		</>
// 	)
// }

import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
// TODO Dynamic SVG Icon
// https://stackoverflow.com/questions/70309561/unable-to-import-svg-with-vite-as-reactcomponent
const menus = ['File', 'Edit', 'Project', 'Tools', 'Help'];

export default function ToolBar() {
	return (
		<AppBar position="static">
			<Container maxWidth="xl" sx={{ m: 0 }}>
				<Toolbar disableGutters>
					{/* <IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 2 }}
					>
						<MenuIcon />
					</IconButton> */}
					<Typography variant="h6" component="div" sx={{}}>
						WebDv3
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' } }}>
						{menus.map((menu) => (
							<Button
								key={menu}
								// onClick={handleCloseNavMenu}
								sx={{ my: 2, color: 'white', display: 'block' }}
							>
								{menu}
							</Button>
						))}
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}