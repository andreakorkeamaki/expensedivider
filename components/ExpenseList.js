import { Box, List, ListItem, ListItemText, Chip, Typography } from '@mui/material';
const catColors = {
  'Casa': '#90caf9',
  'Cibo': '#a5d6a7',
  'Viaggi': '#ffe082',
  'Tempo Libero': '#f48fb1',
};

export default function ExpenseList({ expenses }) {
  if (!expenses.length) return <Typography>Nessuna spesa inserita.</Typography>;
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Lista spese</Typography>
      <List>
        {expenses.map(e => (
          <ListItem key={e.id} divider>
            <Chip label={e.cat} sx={{ bgcolor: catColors[e.cat], mr: 2 }} />
            <ListItemText
              primary={`${e.description} (${e.shared ? 'Condivisa' : 'Personale'})`}
              secondary={`${e.payer} • ${new Date(e.date).toLocaleDateString()} • €${e.amount.toFixed(2)}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
