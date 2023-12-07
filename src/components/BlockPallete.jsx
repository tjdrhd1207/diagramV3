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
		<AccordionGroup size="sm" disableDivider>
			{
				DesignerMeta.groups.map((group) => {
					const category = group.name;
					const nodes = group.nodes;
					return (
						<Accordion key={category}>
							<AccordionSummary>{category}</AccordionSummary>
							<AccordionDetails variant="soft">
								<List size="sm" sx={{ gap: 0.5 }}>
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
	// 	<AccordionGroup sx={{ }}>
	// 	<Accordion>
	// 	  <AccordionSummary>First accordion</AccordionSummary>
	// 	  <AccordionDetails>
	// 		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
	// 		tempor incididunt ut labore et dolore magna aliqua.
	// 	  </AccordionDetails>
	// 	</Accordion>
	// 	<Accordion>
	// 	  <AccordionSummary>Second accordion</AccordionSummary>
	// 	  <AccordionDetails>
	// 		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
	// 		tempor incididunt ut labore et dolore magna aliqua.
	// 	  </AccordionDetails>
	// 	</Accordion>
	// 	<Accordion>
	// 	  <AccordionSummary>Third accordion</AccordionSummary>
	// 	  <AccordionDetails>
	// 		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
	// 		tempor incididunt ut labore et dolore magna aliqua.
	// 	  </AccordionDetails>
	// 	</Accordion>
	//   </AccordionGroup>
	)
}