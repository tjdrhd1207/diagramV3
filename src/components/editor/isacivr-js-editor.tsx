import { Editor } from "@monaco-editor/react"
import { Box, Container } from "@mui/material"

export const ISACIVRJSEditor = (
    props: {
        code: string
        setModified: (value: string) => void
    }
) => {
    return (
        <Box sx={{ height: "100%" }}>
            <Editor language="javascript" value={props.code} 
                onChange={(value) => value && props.setModified(value)} />
        </Box>
    )
}