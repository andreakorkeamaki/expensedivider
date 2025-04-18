import { useState } from 'react';
import { Box, TextField, Button, MenuItem, Paper, Typography, InputAdornment } from '@mui/material';
import { profiles } from '../utils/profiles';

export default function TransferForm({ addTransfer }) {
  const [amount, setAmount] = useState('');
  const [giver, setGiver] = useState(profiles[0].key);
  const [receiver, setReceiver] = useState(profiles[1].key);

  const handleSubmit = e => {
    e.preventDefault();
    if (!amount || isNaN(amount) || giver === receiver) return;
    addTransfer({
      id: Date.now(),
      amount: parseFloat(amount),
      desc: `Trasferimento da ${giver} a ${receiver}`,
      cat: 'Trasferimento',
      shared: false,
      payer: giver,
      date: new Date().toISOString(),
    });
    setAmount('');
  };

  return (
    <Paper sx={{ p: 2, mb: 2, maxWidth: 400 }} elevation={2}>
      <Typography variant="h6" gutterBottom>Segna trasferimento</Typography>
      <Box component="form" onSubmit={handleSubmit} display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Importo"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          type="number"
          required
          inputProps={{ min: 0, step: 0.01 }}
          InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
        />
        <TextField
          select
          label="Chi ha dato"
          value={giver}
          onChange={e => setGiver(e.target.value)}
          required
          sx={{ minWidth: 120 }}
        >
          {profiles.map(p => (
            <MenuItem key={p.key} value={p.key}>{p.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="A chi"
          value={receiver}
          onChange={e => setReceiver(e.target.value)}
          required
          sx={{ minWidth: 120 }}
        >
          {profiles.map(p => (
            <MenuItem key={p.key} value={p.key}>{p.name}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 120 }}>
          Segna
        </Button>
      </Box>
    </Paper>
  );
}
