import { Paper, Typography, Box } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const catColors = {
  'Casa': '#90caf9',
  'Cibo': '#a5d6a7',
  'Viaggi': '#ffe082',
  'Tempo Libero': '#f48fb1',
};

function getSummary(expenses) {
  let total1 = 0, total2 = 0, shared = 0;
  const catMap = {};
  expenses.forEach(e => {
    if (e.shared) shared += e.amount;
    else if (e.payer === 'Utente 1') total1 += e.amount;
    else total2 += e.amount;
    catMap[e.cat] = (catMap[e.cat] || 0) + e.amount;
  });
  // Calcolo saldo: ognuno paga le sue personali, le condivise si sommano e si dividono
  const sharedHalf = shared / 2;
  const paid1 = total1 + expenses.filter(e => e.shared && e.payer === 'Utente 1').reduce((s, e) => s + e.amount, 0);
  const paid2 = total2 + expenses.filter(e => e.shared && e.payer === 'Utente 2').reduce((s, e) => s + e.amount, 0);
  const saldo = paid1 - sharedHalf - (paid2 - sharedHalf);
  return { catMap, saldo, total1: paid1, total2: paid2, shared };
}

export default function Dashboard({ expenses }) {
  const { catMap, saldo, total1, total2 } = getSummary(expenses);
  const pieData = {
    labels: Object.keys(catMap),
    datasets: [
      {
        data: Object.values(catMap),
        backgroundColor: Object.keys(catMap).map(c => catColors[c] || '#eee'),
      },
    ],
  };
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Dashboard</Typography>
      <Box mb={2}>
        <Typography variant="subtitle1">
          Saldo: {saldo === 0 ? 'pari!' : saldo > 0 ? `Utente 2 deve €${saldo.toFixed(2)} a Utente 1` : `Utente 1 deve €${Math.abs(saldo).toFixed(2)} a Utente 2`}
        </Typography>
        <Typography variant="body2">Totale Utente 1: €{total1.toFixed(2)}</Typography>
        <Typography variant="body2">Totale Utente 2: €{total2.toFixed(2)}</Typography>
      </Box>
      <Pie data={pieData} />
    </Paper>
  );
}
