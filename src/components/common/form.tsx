import { FormControl, FormHelperText, Input, InputLabel, MenuItem, Select } from "@mui/material"

interface SelectOption {
    value: string,
    label: string
}

export const FormSelect = (
    props: {
        required?: boolean,
        disabled?: boolean,
        color?: any,
        formTitle: string,
        formValue: string | undefined,
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
                        const { value, label } = option;
                        return (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
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
        disabled?: boolean,
        multiline?: boolean,
        color?: any,
        formTitle: string,
        formValue: string | undefined,
        type?: string,
        helperText?: string,
        endAdornment?: React.ReactNode,
        onFormChanged: (value: string) => void,
    }
) => {
    const { autoFocus, required, disabled, multiline, color, formTitle, formValue, type, helperText, endAdornment, onFormChanged } = props;
    return (
        <FormControl 
            fullWidth size="small" variant="standard" required={required? true : undefined} disabled={disabled} color={color}
        >
            <InputLabel>{formTitle}</InputLabel>
            <Input 
                autoFocus={autoFocus? true : undefined} type={type} multiline={multiline? true: undefined} maxRows={10}
                value={formValue} onChange={(event) => onFormChanged(event.target.value)} 
                endAdornment={endAdornment}
            />
            <FormHelperText error={color === "error"}>{helperText}</FormHelperText>
        </FormControl>
    )
}