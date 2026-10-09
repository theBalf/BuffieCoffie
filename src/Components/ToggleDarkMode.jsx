import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useColorScheme } from "@mui/material/styles";

export default function ToggleDarkMode() {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  return (
    <RadioGroup
      row
      value={mode}
      onChange={(event) => setMode(event.target.value)}
    >
      <FormControlLabel
        value="system"
        control={<Radio size="small" />}
        label="سیستم"
      />

      <FormControlLabel
        value="light"
        control={<Radio size="small" />}
        label="روشن"
      />

      <FormControlLabel
        value="dark"
        control={<Radio size="small" />}
        label="تاریک"
      />
    </RadioGroup>
  );
}
