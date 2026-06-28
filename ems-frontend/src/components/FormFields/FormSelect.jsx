import { Controller } from 'react-hook-form';
import { MenuItem, TextField } from '@mui/material';

export default function FormSelect({ control, name, label, options, errors, fullWidth = true, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label={label}
          fullWidth={fullWidth}
          error={Boolean(errors?.[name])}
          helperText={errors?.[name]?.message}
          {...rest}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
