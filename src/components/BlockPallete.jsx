import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails, Stack, Button, Box, List, ListItemButton } from "@mui/joy";
import DesignerMeta from "../DesignerMeta";

const blocks = [
	{name: "", icon: <></>, tooltip: ""},
]

const iconmap = [
	"icons/callpage.png"
]

const [...groups] = DesignerMeta.groups;

function BlockItems() {
	return (
		<AccordionGroup size="sm" disableDivider sx={{ borderRadius: 0 }}>
			{
				DesignerMeta.groups.map((group) => {
					const category = group.name;
					const nodes = group.nodes;
					return (
						<Accordion key={category}>
							<AccordionSummary>{category}</AccordionSummary>
							<AccordionDetails variant="soft">
								<List size="sm" sx={{ gap: 0.5, overflow: 'auto' }}>
									{nodes.map(node => {
										return (
											<ListItemButton key={node}>{DesignerMeta.nodes[node].displayName}</ListItemButton>
										)
									})}
								</List>
							</AccordionDetails>
						</Accordion>
					);
				})
			}
		</AccordionGroup>
	)
}

export default function BlockPallete() {
	const groups = DesignerMeta.groups;
	
	return (
		<BlockItems />
	)
}