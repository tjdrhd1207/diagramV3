import { MenuPosition } from "@/store/_interfaces";
import { Box, Menu, MenuItem } from "@mui/material"
import React from "react";

type ContextMenuItem = {
    label: string,
    disabled: boolean,
    onClick: (target: string | undefined) => void
}

interface ContextMenuProps {
    menuItems: Array<ContextMenuItem>;
    children: React.ReactNode;
}

export const ContextMenu = (props: ContextMenuProps) => {
    const [ position, setPosition ] = React.useState<MenuPosition>();
    const [ target, setTarget ] = React.useState<string>();

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();

        const element = event.target as HTMLElement;
        const target = element.innerHTML;
        setTarget(target);
        setPosition(position === undefined? { mouseX: event.clientX + 2, mouseY: event.clientY - 6}: undefined);
    }

    const handleContextMenuClose = () => {
        setPosition(undefined);
    }

    return (
        <Box onContextMenu={handleContextMenu} >
            {props.children}
            <Menu open={position !== undefined} onClose={handleContextMenuClose}
                anchorReference="anchorPosition" 
                anchorPosition={position !== undefined? { top: position.mouseY, left: position.mouseX} : undefined}
            >
                {
                    props.menuItems && props.menuItems.map((i) => {
                        return <MenuItem key={i.label} disabled={i.disabled}
                                    onClick={() => {
                                        i.onClick(target);
                                        handleContextMenuClose();
                                    }}
                                >
                                    {i.label}
                                </MenuItem>
                    })
                }
            </Menu>
        </Box>
    )
}