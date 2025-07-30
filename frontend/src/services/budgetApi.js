import axios from 'axios';

export const setBudget = async (month, year, amount, token) => {
  const res = await axios.post(
    '/api/budget/set',
    { month, year, amount },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getBudget = async (month, year, token) => {
  const res = await axios.get('/api/budget', {
    params: { month, year },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
