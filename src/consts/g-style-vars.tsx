export const side_menu_width = "15%"
export const header_height = "60px"
export const explorer_width = "15%"
export const editor_width = "80%"
export const editor_tab_height = "36px"
export const attribute_manager_width = "25%"

export const hover_visible_style = (color: string) => {
    return {
        opacity: "0.5", "&:hover" : { opacity: "1", backgroundColor: `${color} !important` }
    }
}