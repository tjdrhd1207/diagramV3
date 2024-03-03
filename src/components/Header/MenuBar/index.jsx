import React from "react";
import DataExplorerDialog from "./Dialogs/DataExplorerDialog";
import { Folder, Eject, Inventory2, TipsAndUpdates, Settings } from "@mui/icons-material";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, ListSubheader } from "@mui/material";
import { ToggleListItemButton } from "../../UI/Toggler";
import { useMenuStore } from "../../../store/MenuStore";
import { useDialogStore } from "../../../store/DialogStore";

const SubListItem = ({
    submenus,
    handleMenuClose,
}) => {
    return (
        <List dense>
            {submenus.map(menu => {
                const { subtitle, setOpen } = menu;
                if (subtitle) {
                    const handleOnClick = (event) => {
                        setOpen();
                        handleMenuClose();
                    }

                    return (
                        <ListItem disablePadding key={subtitle}>
                            <ListItemButton
                                onClick={handleOnClick}
                                sx={{
                                    borderRadius: "10px",
                                    marginBottom: "5px",
                                    marginInline: "10px",
                                }}
                            >
                                <ListItemText primary={subtitle} />
                            </ListItemButton>
                        </ListItem>
                    )
                }
            })}
        </List>
    )
}

const serviceMenu = () => {
    return [
        {
            title: "프로젝트",
            submenuItem: [
                { subtitle: "프로젝트 생성", setOpen: useDialogStore(state => state.openNewProjectDialog) },
                { subtitle: "프로젝트 열기", setOpen: useDialogStore(state => state.openOpenProjectDialog) },
                { subtitle: "프로젝트 불러오기", DialogRef: undefined },
                { subtitle: "최근 프로젝트", DialogRef: undefined },
                { subtitle: "저장", DialogRef: undefined },
                { subtitle: "모두 저장", DialogRef: undefined },
                { subtitle: "프로젝트 내보내기", DialogRef: undefined },
                { subtitle: "프로젝트 닫기", DialogRef: undefined },
            ],
            icon: <Folder />,
        },
        {
            title: "리소스 관리",
            submenuItem: [
                { subtitle: "데이터 정의", DialogRef: DataExplorerDialog, setOpen: useDialogStore(state => state.setShowDataExplorerDialog) },
                { subtitle: "멘트 관리", DialogRef: undefined },
                { subtitle: "서비스 코드 관리", DialogRef: undefined },
            ],
            icon: <Inventory2 />,
        },
        {
            title: "프로젝트 배포",
            submenuItem: [
                { subtitle: "버전 관리", DialogRef: undefined },
                { subtitle: "배포서버 업로드", DialogRef: undefined },
                { subtitle: "배포서버 관리", DialogRef: undefined },
                { subtitle: "시나리오 버전 비교", DialogRef: undefined },
                { subtitle: "시뮬레이터", DialogRef: undefined },
            ],
            icon: <Eject />,
        },
        {
            title: "도움말",
            submenuItem: [
                { subtitle: "버전 정보", DialogRef: undefined },
                { subtitle: "릴리즈 노트", DialogRef: undefined },
                { subtitle: "도움말", DialogRef: undefined },
                { subtitle: "단축기", DialogRef: undefined },
            ],
            icon: <TipsAndUpdates />,
        },
        {
            title: "환경설정",
            submenuItem: [],
            icon: <Settings />,
        }
    ]
}

const MenuBar = () => {
    const { menuOpen, setMenuOpen } = useMenuStore();

    const handleMenuClose = () => setMenuOpen(false);

    return (
        <Drawer anchor="left" open={menuOpen} onClose={handleMenuClose}
        >
            <Box
                sx={{
                    height: "100vh",
                    width: 'var(--menu-width)',
                }}
            >
                <List
                    dense
                    subheader={
                        <ListSubheader id="menu-list-subheader">ScenarioDesigner v3</ListSubheader>
                    }
                    sx={{ padding: "5px" }}
                >
                    {
                        serviceMenu().map(item => {
                            const { icon, title, submenuItem } = item;
                            return (
                                <ToggleListItemButton key={title} icon={icon} title={title}>
                                    <SubListItem submenus={submenuItem} handleMenuClose={handleMenuClose} />
                                </ToggleListItemButton>
                            )
                        })
                    }
                </List>
            </Box>
        </Drawer>
    )
}

export default MenuBar