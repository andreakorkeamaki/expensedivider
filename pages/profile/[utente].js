import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Button, Avatar } from '@mui/material';
import ExpenseList from '../../components/ExpenseList';
import DashboardProfile from '../../components/DashboardProfile';
import ExpenseForm from '../../components/ExpenseForm';
import { loadExpenses } from '../../utils/storage';
import { profiles } from '../../utils/profiles';

export default function ProfilePage() {
  const router = useRouter();
  const { utente } = router.query;
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    setExpenses(loadExpenses());
  }, []);

  const prof = profiles.find(p => p.key === utente);
  if (!prof) return null;
  const filtered = expenses.filter(e => e.payer === utente);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, mb: 4, boxShadow: 6, textAlign: 'center' }}>
        <Avatar src={prof.photo} alt={prof.name} sx={{ width: 90, height: 90, mx: 'auto', mb: 2, boxShadow: 3 }} />
        <Typography variant="h4" gutterBottom>{prof.name}</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2, fontWeight: 'bold' }} onClick={() => router.push('/')}>Torna alla dashboard</Button>
      </Paper>
      <ExpenseForm profile={prof.key} addExpense={exp => setExpenses([exp, ...expenses])} />
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
        <Box flex={1}>
          <DashboardProfile expenses={filtered} utente={prof.name} />
        </Box>
        <Box flex={2}>
          <ExpenseList expenses={filtered} />
        </Box>
      </Box>
    </Container>
  );
}
