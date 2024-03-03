import { FormControl, FormHelperText, Input, InputLabel, MenuItem, Select } from "@mui/material"

const FormSelect = ({
	formState,
	onFormChanged,
	options
}) => {
	return (
		<FormControl fullWidth size="small" variant="standard" required={formState.required} disabled={formState.disabled}>
			<InputLabel>{formState.title}</InputLabel>
			<Select
				value={formState.input}
				label={formState.title}
				onChange={(event) => onFormChanged(event)}
			>
				<MenuItem value="">
					<em>None</em>
				</MenuItem>
				{options ? options.map(option => {
					return (
						<MenuItem key={option.workspace_name} value={option.workspace_name}>{option.workspace_name}</MenuItem>
					)
				}) : undefined}
			</Select>
		</FormControl>
	)
}

const FormText = ({
	formState,
	onFormChanged
}) => {
	return (
		<FormControl fullWidth size="small" variant="standard" required={formState.required} disabled={formState.disabled}
			color={formState.color}
		>
			<InputLabel>{formState.title}</InputLabel>
			<Input
				value={formState.input}
				label={formState.title}
				onChange={(event) => onFormChanged(event)}
			>
			</Input>
			<FormHelperText>
				{formState.helperText}
			</FormHelperText>
		</FormControl>
	)
}

export { FormSelect, FormText }