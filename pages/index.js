import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Link as MuiLink, Avatar } from '@mui/material';
import Link from 'next/link';
import ProfileSelector from '../components/ProfileSelector';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import Dashboard from '../components/Dashboard';
import TransferForm from '../components/TransferForm';
import { loadExpenses, saveExpenses } from '../utils/storage';
import { profiles } from '../utils/profiles';

export default function Home() {
  const [profile, setProfile] = useState('Utente 1');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const saved = loadExpenses();
    if (saved) setExpenses(saved);
  }, []);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  // Stato per il modal di trasferimento
  const [open, setOpen] = useState(false);
  const [transAmount, setTransAmount] = useState('');
  const [giver, setGiver] = useState('Utente 1');
  const [receiver, setReceiver] = useState('Utente 2');
  const utenti = ['Utente 1', 'Utente 2'];

  const handleTransfer = () => {
    if (!transAmount || isNaN(transAmount) || giver === receiver) return;
    setExpenses([
      {
        id: Date.now(),
        amount: parseFloat(transAmount),
        desc: `Trasferimento da ${giver} a ${receiver}`,
        cat: 'Trasferimento',
        shared: false,
        payer: giver,
        date: new Date().toISOString(),
      },
      ...expenses,
    ]);
    setTransAmount('');
    setOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Gestione Spese di Coppia
        </Typography>

        <Box mt={3} mb={2} display="flex" justifyContent="center" gap={2}>
          {profiles.map(p => (
            <Link key={p.key} href={`/profile/${encodeURIComponent(p.key)}`} passHref legacyBehavior>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Avatar src={p.photo} alt={p.name} sx={{ width: 32, height: 32 }} />}
                sx={{ px: 3, boxShadow: 3, fontWeight: 'bold', textTransform: 'none' }}
              >
                {p.name}
              </Button>
            </Link>
          ))}
        </Box>
      </Paper>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        <Box flex={2}>
          <TransferForm addTransfer={exp => setExpenses([exp, ...expenses])} />
          <Divider sx={{ my: 2 }} />
          <ExpenseList expenses={expenses} />
        </Box>
        <Box flex={1}>
          <Dashboard expenses={expenses} />
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Trasferimento soldi</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Importo (€)"
            type="number"
            value={transAmount}
            onChange={e => setTransAmount(e.target.value)}
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Box display="flex" gap={2} mt={2}>
            <TextField
              select
              label="Chi ha dato"
              value={giver}
              onChange={e => setGiver(e.target.value)}
              fullWidth
            >
              {utenti.map(u => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="A chi"
              value={receiver}
              onChange={e => setReceiver(e.target.value)}
              fullWidth
            >
              {utenti.map(u => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={handleTransfer} variant="contained">Salva</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
