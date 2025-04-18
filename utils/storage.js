export function loadExpenses() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('expenses');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  } catch {}
}
