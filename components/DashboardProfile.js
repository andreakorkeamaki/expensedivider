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
  'Trasferimento': '#bdbdbd',
};

export default function DashboardProfile({ expenses, utente }) {
  const catMap = {};
  let total = 0;
  expenses.forEach(e => {
    if (e.cat !== 'Trasferimento') {
      catMap[e.cat] = (catMap[e.cat] || 0) + e.amount;
      total += e.amount;
    }
  });
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
      <Typography variant="h6" gutterBottom>Riepilogo {utente}</Typography>
      <Box mb={2}>
        <Typography variant="body1">Totale spese: €{total.toFixed(2)}</Typography>
      </Box>
      <Pie data={pieData} />
    </Paper>
  );
}
