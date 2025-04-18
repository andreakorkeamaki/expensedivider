import { useState } from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography, Switch, FormControlLabel } from '@mui/material';
const categories = [
  { label: 'Casa', color: '#90caf9', icon: '🏠' },
  { label: 'Cibo', color: '#a5d6a7', icon: '🍔' },
  { label: 'Viaggi', color: '#ffe082', icon: '✈️' },
  { label: 'Tempo Libero', color: '#f48fb1', icon: '🎉' },
];

export default function ExpenseForm({ profile, addExpense }) {
  const [amount, setAmount] = useState('');
  const [description, setDesc] = useState('');
  const [cat, setCat] = useState(categories[0].label);
  const [shared, setShared] = useState(true);

  const handleSubmit = e => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    addExpense({
      id: Date.now(),
      amount: parseFloat(amount),
      description,
      cat,
      shared,
      payer: profile,
      date: new Date().toISOString(),
    });
    setAmount(''); setDesc(''); setCat(categories[0].label); setShared(true);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mb={2}>
      <Typography variant="h6" gutterBottom>Aggiungi spesa</Typography>
      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Importo (€)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          type="number"
          required
          inputProps={{ min: 0, step: 0.01 }}
        />
        <TextField
          label="Descrizione"
          value={description}
          onChange={e => setDesc(e.target.value)}
          required
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={cat}
            label="Categoria"
            onChange={e => setCat(e.target.value)}
          >
            {categories.map(c => (
              <MenuItem key={c.label} value={c.label}>
                <span style={{ marginRight: 8 }}>{c.icon}</span>{c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Switch checked={shared} onChange={e => setShared(e.target.checked)} />}
          label="Spesa condivisa"
        />
        <Button type="submit" variant="contained" color="primary">
          Aggiungi
        </Button>
      </Box>
    </Box>
  );
}
