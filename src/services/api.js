import axios from 'axios';

const API = axios.create({
  baseURL: 'https://byk-market-ai.onrender.com/api'
});

// Token automatically add karo har request mein
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);

// CRYPTO
export const getCryptoPrices = () => API.get('/crypto/prices');

// STOCK
export const getStockPrice = (symbol) => API.get(`/stock/price/${symbol}`);

// TRADE
export const buyAsset = (data) => API.post('/trade/buy', data);
export const sellAsset = (data) => API.post('/trade/sell', data);

// PORTFOLIO
export const getPortfolio = () => API.get('/portfolio');
export const getTransactions = () => API.get('/portfolio/transactions');

// AI SIGNALS
export const getSignals = () => API.get('/signals');