import { TreeView, TreeItem } from "@mui/x-tree-view";
import { ExpandMore, ChevronRight } from "@mui/icons-material"

export default function ProjectExplorer() {
	return (
		<TreeView
			aria-label="file system navigator"
			defaultCollapseIcon={<ExpandMore />}
			defaultExpandIcon={<ChevronRight />}
			sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
		>
			<TreeItem nodeId="1" label="Applications">
				<TreeItem nodeId="2" label="Calendar" />
			</TreeItem>
			<TreeItem nodeId="5" label="Documents">
				<TreeItem nodeId="10" label="OSS" />
				<TreeItem nodeId="6" label="MUI">
					<TreeItem nodeId="8" label="index.js" />
				</TreeItem>
			</TreeItem>
		</TreeView>
	)
}