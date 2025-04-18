import { ToggleButton, ToggleButtonGroup, Box, Typography, Avatar, Stack } from '@mui/material';
import { profiles } from '../utils/profiles';

export default function ProfileSelector({ profile, setProfile }) {
  return (
    <Box textAlign="center" mb={2}>
      <Typography variant="subtitle1" gutterBottom>
        Seleziona profilo attivo:
      </Typography>
      <ToggleButtonGroup
        value={profile}
        exclusive
        onChange={(_, val) => val && setProfile(val)}
        color="primary"
        size="large"
      >
        {profiles.map(p => (
          <ToggleButton key={p.key} value={p.key} sx={{ px: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar src={p.photo} alt={p.name} />
              <span>{p.name}</span>
            </Stack>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
