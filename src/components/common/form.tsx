import { FormControl, FormHelperText, Input, InputLabel, MenuItem, Select } from "@mui/material"

interface SelectOption {
    name: string
}

export const FormSelect = (
    props: {
        required: boolean,
        disabled: boolean,
        color?: any,
        formTitle: string,
        formValue: string,
        helperText?: string,
        onFormChanged: (value: string) => void,
        options: Array<SelectOption>,
    }
) => {
    return (
        <FormControl fullWidth size="small" variant="standard" required={props.required} disabled={props.disabled}>
            <InputLabel>{props.formTitle}</InputLabel>
            <Select value={props.formValue} label={props.formTitle} onChange={(event) => props.onFormChanged(event.target.value)}>
                <MenuItem value=""><em>None</em></MenuItem>
                {
                    props.options? props.options.map((option) => {
                        const name = option.name;
                        return (
                            <MenuItem key={name} value={name}>{name}</MenuItem>
                        )
                    }) : undefined
                }
            </Select>
            <FormHelperText error={props.color === "error"}>{props.helperText}</FormHelperText>
        </FormControl>
    )
}

export const FormText = (
    props: {
        autoFocus?: boolean,
        required?: boolean,
        disabled: boolean,
        color?: any,
        formTitle: string,
        formValue: string | undefined,
        helperText?: string,
        endAdornment?: React.ReactNode,
        onFormChanged: (value: string) => void,
    }
) => {
    return (
        <FormControl fullWidth size="small" variant="standard" required={props.required? true : undefined} disabled={props.disabled} color={props.color}>
            <InputLabel>{props.formTitle}</InputLabel>
            <Input autoFocus={props.autoFocus? true : undefined} value={props.formValue} 
                onChange={(event) => props.onFormChanged(event.target.value)} endAdornment={props.endAdornment}/>
            <FormHelperText error={props.color === "error"}>{props.helperText}</FormHelperText>
        </FormControl>
    )
}