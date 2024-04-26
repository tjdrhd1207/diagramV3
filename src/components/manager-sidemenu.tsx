"use client"

import { Box, List, ListItemButton, ListItemText, ListSubheader } from "@mui/material"

export const SideMenu = () => {

    const serviceMenu = [
        {
            group: "Project",
            subItems: [
                { title: "Project Management", url: "project-mng" },
                { title: "Snapshot Management", url: "snapshot-mng" },
                { title: "Compare", url: "compare" },
                { title: "Deploy History", url: "deploy-history" },
            ]
        },
        {
            group: "Resources",
            subItems: [
                { title: "Ment Management", url: "ment-mng" },
                { title: "Interface Management", url: "interface-mng" },
            ]
        },
        {
            group: "Report",
            subItems: [
                { title: "Audit Report", url: "audit-report" }
            ]
        },
    ]

    return (
        <Box width="100%" height="100vh" borderRight="1px solid">
            {
                serviceMenu.map((m) => 
                    <List dense key={m.group}
                        subheader={<ListSubheader>{m.group}</ListSubheader>}
                    >
                        {
                            m.subItems?.map((item) =>
                                <ListItemButton key={item.title} href={`/manager/${item.url}`}>
                                    <ListItemText primary={item.title} primaryTypographyProps={{ textOverflow: "ellipsis", overflow: "hidden", noWrap: true}}/>
                                </ListItemButton>
                            )
                        }
                    </List>
                )
            }
        </Box>
    )
}