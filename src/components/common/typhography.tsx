import { Typography, TypographyOwnProps } from "@mui/material"

export const EllipsisLabel = (props: TypographyOwnProps ) => {
    const { variant, children, ...other } = props;
    return (
        <Typography variant={props.variant} 
            sx={{ textOverflow: "ellipsis", textWrap: "nowrap", overflow: "hidden", userSelect: "none" }}
            { ...other }
        >
            {children}
        </Typography>
    )

}