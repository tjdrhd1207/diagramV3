import { Box, Menu, MenuItem } from "@mui/material";
import { useLocalStore } from "../../../store/LocalStore"
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import React from "react";
import DataExplorerDialog from "../../Header/MenuBar/Dialogs/DataExplorerDialog";

const ProjectTree = ({
	title,
	sourceTree,
}) => {

	const renderTree = (items) => (
		<TreeItem key={items.name} nodeId={items.name} label={items.name} />
	);

	return (
		<TreeView
			defaultCollapseIcon={<ExpandMore />}
			defaultExpandIcon={<ChevronRight />}
		>
			<TreeItem key={title} nodeId={title} label={title}>
				{
					Array.isArray(sourceTree)?
						sourceTree.map((source) => renderTree(source)) : null
				}
			</TreeItem>
		</TreeView>
	)
}

const DataExplorerMenu = ({
	handleContextClose,
}) => {
	const [dialogOpen, setDialogOpen] = React.useState(false);

	const handleOnClick = (event) => {
		setDialogOpen(true);
	};

	const handleDialogClose = () => {
		handleContextClose();
		setDialogOpen(false);
	};

	return (
		<>
			<MenuItem onClick={handleOnClick}>데이터 정의</MenuItem>
			<DataExplorerDialog />
		</>
	)
}

const ProjectExplorer = () => {
	const [contextMenu, setContextMenu] = React.useState(null);

	const project_info = useLocalStore(state => state.project_info);

	const handleContextMenu = (event) => {
		event.preventDefault();
		setContextMenu(
			contextMenu === null?
			{
				mouseX: event.clientX + 2,
				mouseY: event.clientY - 6,
			} : null,
		);
	};

	const handleContextClose = () => {
		setContextMenu(null);
	};

	return (
		<Box
			onContextMenu={handleContextMenu}
			sx={{
				paddingBlock: "15px",
				paddingInline: "var(--pallete-padding-inline)",
				height: "calc(100vh - var(--header-height) - 48px - var(--pallete-padding-inline))",
				overflow: "auto",
			}}
		>
			<TreeView
				defaultCollapseIcon={<ExpandMore />}
				defaultExpandIcon={<ChevronRight />}
			>
				{
					project_info?.project_meta?
						<ProjectTree title={project_info.project_name} sourceTree={project_info.project_meta.pages} /> : null
				}
			</TreeView>
			<Menu
				open={contextMenu !== null}
				onClose={handleContextClose}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu !== null? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined }
			>
				<DataExplorerMenu handleContextClose={handleContextClose} />
				<MenuItem onClick={handleContextClose}>배포 서버 업로드</MenuItem>
			</Menu>
		</Box>
	)
}

export default ProjectExplorer