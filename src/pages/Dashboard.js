import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getCryptoPrices, getPortfolio, buyAsset, sellAsset, getStockPrice, getTransactions, getSignals, getNews, getCryptoChart } from '../services/api';
import NextBTC from './NextBTC';

const STOCKS = [
  { symbol: 'RELIANCE.BO', name: 'Reliance Industries', flag: '🇮🇳' },
  { symbol: 'TCS.BO', name: 'TCS', flag: '🇮🇳' },
  { symbol: 'HDFCBANK.BO', name: 'HDFC Bank', flag: '🇮🇳' },
  { symbol: 'INFY.BO', name: 'Infosys', flag: '🇮🇳' },
  { symbol: 'WIPRO.BO', name: 'Wipro', flag: '🇮🇳' },
  { symbol: 'AAPL', name: 'Apple', flag: '🌍' },
  { symbol: 'TSLA', name: 'Tesla', flag: '🌍' },
  { symbol: 'GOOGL', name: 'Google', flag: '🌍' },
  { symbol: 'MSFT', name: 'Microsoft', flag: '🌍' },
  { symbol: 'AMZN', name: 'Amazon', flag: '🌍' },
];

const GECKO_IDS = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana',
  xrp: 'ripple', doge: 'dogecoin', ada: 'cardano',
  ltc: 'litecoin', dot: 'polkadot', avax: 'avalanche-2', link: 'chainlink'
};

function Dashboard({ user, onLogout }) {
  const [prices, setPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [signals, setSignals] = useState([]);
  const [news, setNews] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('crypto');
  const [stocksLoading, setStocksLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('priceAlerts') || '[]'); } catch { return []; }
  });
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertCoin, setAlertCoin] = useState(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState('above');
  const [chartModal, setChartModal] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartDays, setChartDays] = useState(7);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? 'linear-gradient(135deg, #050510 0%, #0a0a1a 50%, #050510 100%)' : 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f0f4ff 100%)',
    sidebar: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
    sidebarBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    card: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
    cardHover: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,1)',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    cardBorderHover: isDark ? 'rgba(0,212,255,0.3)' : 'rgba(0,120,200,0.3)',
    text: isDark ? '#fff' : '#0a0a1a',
    textMuted: isDark ? '#555' : '#888',
    textSub: isDark ? '#888' : '#555',
    accent: isDark ? '#00d4ff' : '#0066cc',
    green: '#00cc70',
    red: '#ff4444',
    modal: isDark ? '#0d0d1f' : '#ffffff',
    modalBorder: isDark ? 'rgba(0,212,255,0.2)' : 'rgba(0,100,200,0.2)',
    input: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    inputBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)',
    header: isDark ? 'rgba(5,5,16,0.95)' : 'rgba(240,244,255,0.95)',
    navActive: isDark ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,255,0.08))' : 'linear-gradient(135deg, rgba(0,100,200,0.12), rgba(0,60,150,0.06))',
    navActiveColor: isDark ? '#00d4ff' : '#0055bb',
    navInactive: isDark ? '#666' : '#999',
    tooltipBg: isDark ? 'rgba(10,10,30,0.95)' : 'rgba(255,255,255,0.98)',
    tooltipBorder: isDark ? 'rgba(0,212,255,0.3)' : 'rgba(0,100,200,0.3)',
    searchBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    let result = [...prices];
    if (searchQuery.trim()) {
      result = result.filter(coin =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === 'price_high') result.sort((a, b) => b.price_inr - a.price_inr);
    else if (sortBy === 'price_low') result.sort((a, b) => a.price_inr - b.price_inr);
    else if (sortBy === 'gain') result.sort((a, b) => b.change_24h - a.change_24h);
    else if (sortBy === 'loss') result.sort((a, b) => a.change_24h - b.change_24h);
    setFilteredPrices(result);
  }, [prices, searchQuery, sortBy]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchPortfolio();
    const interval = setInterval(() => { fetchPrices(); }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  useEffect(() => {
    if (prices.length === 0 || alerts.length === 0) return;
    const newTriggered = [];
    const remainingAlerts = alerts.filter(alert => {
      const coin = prices.find(p => p.id === alert.coinId);
      if (!coin) return true;
      const hit = alert.type === 'above' ? coin.price_inr >= alert.targetPrice : coin.price_inr <= alert.targetPrice;
      if (hit) { newTriggered.push({ ...alert, currentPrice: coin.price_inr, coinName: coin.name }); return false; }
      return true;
    });
    if (newTriggered.length > 0) {
      setTriggeredAlerts(prev => [...prev, ...newTriggered]);
      setAlerts(remainingAlerts);
      localStorage.setItem('priceAlerts', JSON.stringify(remainingAlerts));
    }
  }, [prices]);

  const fetchPrices = async () => {
    try {
      const res = await getCryptoPrices();
      setPrices(res.data.data);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {}
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await getPortfolio();
      const userPnl = parseFloat(res.data.data.total_pnl || 0);
      const userInvested = parseFloat(res.data.data.total_invested || 0);
      const userPnlPct = parseFloat(res.data.data.total_pnl_percent || 0);
      const mockTraders = [
        { name: 'RocketTrader', pnl: 2850000, pnl_pct: 38.5, invested: 7400000, badge: '🚀' },
        { name: 'CryptoKing', pnl: 1920000, pnl_pct: 28.3, invested: 6780000, badge: '👑' },
        { name: 'BullRunner', pnl: 1540000, pnl_pct: 22.1, invested: 6970000, badge: '🐂' },
        { name: 'DiamondHands', pnl: 980000, pnl_pct: 15.6, invested: 6280000, badge: '💎' },
        { name: 'MoonShot', pnl: 720000, pnl_pct: 11.2, invested: 6430000, badge: '🌙' },
        { name: 'HODLmaster', pnl: 540000, pnl_pct: 8.4, invested: 6430000, badge: '🤝' },
        { name: 'SatoshiFan', pnl: 380000, pnl_pct: 5.9, invested: 6440000, badge: '₿' },
        { name: 'AltcoinHero', pnl: 210000, pnl_pct: 3.2, invested: 6560000, badge: '⚡' },
        { name: 'WhaleCatcher', pnl: -120000, pnl_pct: -1.8, invested: 6670000, badge: '🐋' },
        { name: 'NewbieTrader', pnl: -380000, pnl_pct: -5.7, invested: 6670000, badge: '🌱' },
      ];
      const allTraders = [
        ...mockTraders,
        { name: user.name + ' (You)', pnl: userPnl, pnl_pct: userPnlPct, invested: userInvested, badge: '⭐', isUser: true },
      ].sort((a, b) => b.pnl - a.pnl);
      setLeaderboard(allTraders);
    } catch (err) {
      const mockTraders = [
        { name: 'RocketTrader', pnl: 2850000, pnl_pct: 38.5, invested: 7400000, badge: '🚀' },
        { name: 'CryptoKing', pnl: 1920000, pnl_pct: 28.3, invested: 6780000, badge: '👑' },
        { name: 'BullRunner', pnl: 1540000, pnl_pct: 22.1, invested: 6970000, badge: '🐂' },
        { name: 'DiamondHands', pnl: 980000, pnl_pct: 15.6, invested: 6280000, badge: '💎' },
        { name: 'MoonShot', pnl: 720000, pnl_pct: 11.2, invested: 6430000, badge: '🌙' },
        { name: 'HODLmaster', pnl: 540000, pnl_pct: 8.4, invested: 6430000, badge: '🤝' },
        { name: 'SatoshiFan', pnl: 380000, pnl_pct: 5.9, invested: 6440000, badge: '₿' },
        { name: 'AltcoinHero', pnl: 210000, pnl_pct: 3.2, invested: 6560000, badge: '⚡' },
        { name: user.name + ' (You)', pnl: 0, pnl_pct: 0, invested: 0, badge: '⭐', isUser: true },
      ].sort((a, b) => b.pnl - a.pnl);
      setLeaderboard(mockTraders);
    }
    setLeaderboardLoading(false);
  };

  const openChart = async (coin, days = 7) => {
    setChartModal(coin); setChartDays(days); setChartLoading(true); setChartData([]);
    try {
      const geckoId = GECKO_IDS[coin.id] || coin.id;
      const res = await getCryptoChart(geckoId, days);
      setChartData(res.data.data);
    } catch (err) {}
    setChartLoading(false);
  };

  const changeChartDays = async (days) => {
    setChartDays(days); setChartLoading(true); setChartData([]);
    try {
      const geckoId = GECKO_IDS[chartModal.id] || chartModal.id;
      const res = await getCryptoChart(geckoId, days);
      setChartData(res.data.data);
    } catch (err) {}
    setChartLoading(false);
  };

  const fetchStocks = async () => {
    setStocksLoading(true);
    try {
      const results = await Promise.all(STOCKS.map(async (stock) => {
        try {
          const res = await getStockPrice(stock.symbol);
          return { ...stock, price: res.data.data.price, change: res.data.data.change };
        } catch { return { ...stock, price: null, change: null }; }
      }));
      setStocks(results);
    } catch (err) {}
    setStocksLoading(false);
  };

  const fetchPortfolio = async () => {
    try { const res = await getPortfolio(); setPortfolio(res.data.data); } catch (err) {}
  };
  const fetchTransactions = async () => {
    try { const res = await getTransactions(); setTransactions(res.data.data); } catch (err) {}
  };
  const fetchSignals = async () => {
    setSignalsLoading(true);
    try { const res = await getSignals(); setSignals(res.data.data); } catch (err) {}
    setSignalsLoading(false);
  };
  const fetchNews = async () => {
    setNewsLoading(true);
    try { const res = await getNews(); setNews(res.data.data); } catch (err) {}
    setNewsLoading(false);
  };
  const showMessage = (msg, type = 'success') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };
  const handleBuyCrypto = async (coin) => {
    const quantity = prompt(`Kitna ${coin.name} kharidna hai?`);
    if (!quantity) return;
    try {
      await buyAsset({ asset_name: coin.name, asset_type: 'crypto', quantity: parseFloat(quantity), price: coin.price_inr });
      showMessage(`✅ ${coin.name} kharida gaya!`); fetchPortfolio();
    } catch (err) { showMessage(err.response?.data?.message || 'Buy failed!', 'error'); }
  };
  const handleBuyStock = async (stock) => {
    if (!stock.price) return alert('Price load nahi hua!');
    const quantity = prompt(`Kitne ${stock.name} shares?`);
    if (!quantity) return;
    try {
      await buyAsset({ asset_name: stock.name, asset_type: 'stock', quantity: parseFloat(quantity), price: stock.price });
      showMessage(`✅ ${stock.name} kharida gaya!`); fetchPortfolio();
    } catch (err) { showMessage(err.response?.data?.message || 'Buy failed!', 'error'); }
  };
  const handleSell = async (holding) => {
    const quantity = prompt(`Kitna ${holding.asset_name} bechna hai?`);
    if (!quantity) return;
    const price = parseFloat(holding.current_price || holding.avg_buy_price);
    try {
      await sellAsset({ asset_name: holding.asset_name, quantity: parseFloat(quantity), price });
      showMessage(`✅ ${holding.asset_name} becha gaya!`); fetchPortfolio();
    } catch (err) { showMessage(err.response?.data?.message || 'Sell failed!', 'error'); }
  };
  const openAlertModal = (coin) => { setAlertCoin(coin); setAlertPrice(''); setAlertType('above'); setShowAlertModal(true); };
  const saveAlert = () => {
    if (!alertPrice || isNaN(alertPrice)) return;
    const newAlert = { id: Date.now(), coinId: alertCoin.id, coinName: alertCoin.name, targetPrice: parseFloat(alertPrice), type: alertType };
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    localStorage.setItem('priceAlerts', JSON.stringify(updated));
    setShowAlertModal(false);
    showMessage(`🔔 Alert set: ${alertCoin.name} ${alertType} ₹${parseFloat(alertPrice).toLocaleString('en-IN')}`);
  };
  const removeAlert = (id) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem('priceAlerts', JSON.stringify(updated));
  };
  const dismissTriggered = (id) => setTriggeredAlerts(prev => prev.filter(a => a.id !== id));

  const balance = portfolio ? parseFloat(portfolio.user.virtual_balance) : 0;
  const totalInvested = portfolio ? parseFloat(portfolio.total_invested) : 0;
  const totalCurrentValue = portfolio ? parseFloat(portfolio.total_current_value || 0) : 0;
  const totalPnL = portfolio ? parseFloat(portfolio.total_pnl || 0) : 0;
  const totalPnLPercent = portfolio ? parseFloat(portfolio.total_pnl_percent || 0) : 0;

  const navItems = [
    { id: 'crypto', icon: '🪙', label: 'Crypto' },
    { id: 'stocks', icon: '📊', label: 'Stocks' },
    { id: 'signals', icon: '🤖', label: 'Signals' },
    { id: 'news', icon: '📰', label: 'News' },
    { id: 'alerts', icon: '🔔', label: 'Alerts', badge: alerts.length },
    { id: 'leaderboard', icon: '🏆', label: 'Leaders' },
    { id: 'nextbtc', icon: '🔮', label: 'Next BTC' },
    { id: 'portfolio', icon: '💼', label: 'Portfolio' },
    { id: 'transactions', icon: '📜', label: 'History' },
  ];

  const handleNav = (id) => {
    setActiveTab(id); setMenuOpen(false);
    if (id === 'stocks' && stocks.length === 0) fetchStocks();
    if (id === 'transactions') fetchTransactions();
    if (id === 'portfolio') fetchPortfolio();
    if (id === 'signals') fetchSignals();
    if (id === 'news') fetchNews();
    if (id === 'leaderboard') fetchLeaderboard();
  };

  const GlassCard = ({ children, style = {}, hover = false, id }) => (
    <div onMouseEnter={() => hover && setHoveredCard(id)} onMouseLeave={() => hover && setHoveredCard(null)}
      style={{ background: hoveredCard === id ? colors.cardHover : colors.card, backdropFilter: 'blur(20px)', borderRadius: '16px', border: `1px solid ${hoveredCard === id ? colors.cardBorderHover : colors.cardBorder}`, transition: 'all 0.2s ease', transform: hoveredCard === id ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hoveredCard === id ? `0 8px 32px ${isDark ? 'rgba(0,212,255,0.1)' : 'rgba(0,100,200,0.1)'}` : '0 2px 8px rgba(0,0,0,0.08)', ...style }}>
      {children}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '10px', padding: '10px 14px' }}>
          <div style={{ color: colors.textSub, fontSize: '11px', marginBottom: '4px' }}>{label}</div>
          <div style={{ color: colors.accent, fontWeight: '700', fontSize: '14px' }}>₹{payload[0].value.toLocaleString('en-IN')}</div>
        </div>
      );
    }
    return null;
  };

  const getRankStyle = (index) => {
    if (index === 0) return { color: colors.gold, icon: '🥇' };
    if (index === 1) return { color: colors.silver, icon: '🥈' };
    if (index === 2) return { color: colors.bronze, icon: '🥉' };
    return { color: colors.textMuted, icon: `#${index + 1}` };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', transition: 'all 0.3s ease' }}>

      {triggeredAlerts.map(alert => (
        <div key={alert.id} style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, background: 'linear-gradient(135deg, rgba(255,204,0,0.15), rgba(255,150,0,0.1))', border: '1px solid rgba(255,204,0,0.4)', borderRadius: '14px', padding: '16px 20px', maxWidth: '320px', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#ffcc00', fontWeight: '800', fontSize: '15px', marginBottom: '4px' }}>🔔 Price Alert!</div>
              <div style={{ color: colors.text, fontSize: '13px' }}>{alert.coinName} reached ₹{alert.currentPrice.toLocaleString('en-IN')}</div>
              <div style={{ color: colors.textMuted, fontSize: '11px', marginTop: '4px' }}>Target: {alert.type === 'above' ? '▲' : '▼'} ₹{alert.targetPrice.toLocaleString('en-IN')}</div>
            </div>
            <button onClick={() => dismissTriggered(alert.id)} style={{ background: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '18px', marginLeft: '12px' }}>✕</button>
          </div>
        </div>
      ))}

      {chartModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: colors.modal, border: `1px solid ${colors.modalBorder}`, borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={chartModal.image} alt={chartModal.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '18px', color: colors.text }}>{chartModal.name}</div>
                  <div style={{ color: colors.accent, fontSize: '14px', fontWeight: '700' }}>₹{chartModal.price_inr.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <button onClick={() => setChartModal(null)} style={{ background: colors.card, border: 'none', color: colors.text, cursor: 'pointer', borderRadius: '10px', padding: '8px 14px', fontSize: '16px' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[{ label: '1D', days: 1 }, { label: '7D', days: 7 }, { label: '30D', days: 30 }, { label: '90D', days: 90 }].map(opt => (
                <button key={opt.days} onClick={() => changeChartDays(opt.days)}
                  style={{ padding: '6px 16px', borderRadius: '8px', border: `1px solid ${chartDays === opt.days ? colors.accent : colors.cardBorder}`, background: chartDays === opt.days ? `${colors.accent}22` : 'transparent', color: chartDays === opt.days ? colors.accent : colors.textMuted, cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ height: '260px', width: '100%' }}>
              {chartLoading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent, fontSize: '14px' }}>📡 Loading chart data...</div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="time" tick={{ fill: colors.textMuted, fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 6)} />
                    <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} domain={['auto', 'auto']} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="price" stroke={colors.accent} strokeWidth={2} dot={false} activeDot={{ r: 5, fill: colors.accent }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>Chart data unavailable</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                onClick={() => { setChartModal(null); handleBuyCrypto(chartModal); }}>Buy {chartModal.name}</button>
              <button style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.08)', color: '#ffcc00', cursor: 'pointer', fontSize: '18px' }}
                onClick={() => { setChartModal(null); openAlertModal(chartModal); }}>🔔</button>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && alertCoin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9997, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: colors.modal, border: `1px solid ${colors.modalBorder}`, borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '380px' }}>
            <div style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px', color: colors.text }}>🔔 Set Price Alert</div>
            <div style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '20px' }}>{alertCoin.name} — Current: ₹{alertCoin.price_inr.toLocaleString('en-IN')}</div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: colors.textSub, fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>Alert Type</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['above', 'below'].map(t => (
                  <button key={t} onClick={() => setAlertType(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${alertType === t ? 'rgba(255,204,0,0.4)' : colors.cardBorder}`, background: alertType === t ? 'rgba(255,204,0,0.1)' : 'transparent', color: alertType === t ? '#ffcc00' : colors.textMuted, cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                    {t === 'above' ? '▲ Above' : '▼ Below'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: colors.textSub, fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>Target Price (₹)</div>
              <input type="number" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} placeholder="Enter target price..."
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${colors.inputBorder}`, background: colors.input, color: colors.text, fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAlertModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${colors.cardBorder}`, background: 'transparent', color: colors.textMuted, cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={saveAlert} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ffcc00, #ff8800)', color: '#000', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>Set Alert 🔔</button>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: colors.header, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.sidebarBorder}`, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #00d4ff, #0099cc)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📈</div>
            <span style={{ color: colors.text, fontWeight: '700', fontSize: '16px' }}>BYK <span style={{ color: colors.accent }}>Market</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleTheme} style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, color: colors.text, cursor: 'pointer', borderRadius: '8px', padding: '5px 10px', fontSize: '16px' }}>{isDark ? '☀️' : '🌙'}</button>
            <span style={{ color: colors.green, fontWeight: '700', fontSize: '13px' }}>₹{balance.toLocaleString('en-IN')}</span>
            <button style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, color: colors.text, fontSize: '16px', cursor: 'pointer', borderRadius: '8px', padding: '5px 10px' }} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      )}

      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 999, background: colors.header, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.sidebarBorder}`, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <button key={item.id} style={{ padding: '13px 16px', borderRadius: '12px', border: 'none', background: activeTab === item.id ? colors.navActive : 'transparent', color: activeTab === item.id ? colors.navActiveColor : colors.navInactive, cursor: 'pointer', fontSize: '15px', textAlign: 'left', fontWeight: activeTab === item.id ? '600' : '400', borderLeft: activeTab === item.id ? `3px solid ${colors.accent}` : '3px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => handleNav(item.id)}>
              {item.icon} {item.label}
              {item.badge > 0 && <span style={{ background: '#ffcc00', color: '#000', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '800' }}>{item.badge}</span>}
            </button>
          ))}
          <button style={{ padding: '13px 16px', borderRadius: '12px', border: 'none', background: 'rgba(255,68,68,0.08)', color: '#ff4444', cursor: 'pointer', fontSize: '15px', textAlign: 'left', marginTop: '4px' }} onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      {!isMobile && (
        <div style={{ width: '240px', background: colors.sidebar, backdropFilter: 'blur(20px)', borderRight: `1px solid ${colors.sidebarBorder}`, display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh', zIndex: 10 }}>
          <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${colors.sidebarBorder}`, marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📈</div>
                <div>
                  <div style={{ color: colors.text, fontWeight: '800', fontSize: '18px' }}>BYK <span style={{ color: colors.accent }}>Market</span></div>
                  <div style={{ color: colors.textMuted, fontSize: '10px', letterSpacing: '1px' }}>AI TRADING</div>
                </div>
              </div>
              <button onClick={toggleTheme} style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, color: colors.text, cursor: 'pointer', borderRadius: '10px', padding: '8px 10px', fontSize: '16px' }}>{isDark ? '☀️' : '🌙'}</button>
            </div>
            <div style={{ background: isDark ? 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,102,255,0.05))' : 'linear-gradient(135deg, rgba(0,100,200,0.08), rgba(0,60,150,0.04))', borderRadius: '12px', padding: '12px', border: `1px solid ${colors.modalBorder}` }}>
              <div style={{ color: colors.textSub, fontSize: '11px', marginBottom: '2px' }}>👤 {user.name}</div>
              <div style={{ color: colors.green, fontWeight: '700', fontSize: '18px' }}>₹{balance.toLocaleString('en-IN')}</div>
              <div style={{ color: colors.textMuted, fontSize: '10px', marginTop: '2px' }}>Virtual Balance</div>
            </div>
          </div>
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px', overflowY: 'auto' }}>
            {navItems.map(item => (
              <button key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: 'none', background: activeTab === item.id ? colors.navActive : 'transparent', color: activeTab === item.id ? colors.navActiveColor : colors.navInactive, cursor: 'pointer', fontSize: '14px', textAlign: 'left', fontWeight: activeTab === item.id ? '600' : '400', borderLeft: activeTab === item.id ? `3px solid ${colors.accent}` : '3px solid transparent', transition: 'all 0.2s ease' }}
                onClick={() => handleNav(item.id)}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge > 0 && <span style={{ marginLeft: 'auto', background: '#ffcc00', color: '#000', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '800' }}>{item.badge}</span>}
                {activeTab === item.id && !item.badge && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: colors.accent }} />}
              </button>
            ))}
          </nav>
          <button style={{ margin: '12px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.06)', color: '#ff4444', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }} onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      <div style={{ marginLeft: isMobile ? 0 : '240px', padding: isMobile ? '70px 14px 90px' : '28px 32px', flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: '800', color: colors.text }}>
            {activeTab === 'crypto' && <><span style={{ color: colors.accent }}>Crypto</span> Market</>}
            {activeTab === 'stocks' && <><span style={{ color: colors.accent }}>Stock</span> Market</>}
            {activeTab === 'signals' && <><span style={{ color: colors.accent }}>AI</span> Signals</>}
            {activeTab === 'news' && <><span style={{ color: colors.accent }}>Live</span> News</>}
            {activeTab === 'alerts' && <><span style={{ color: '#ffcc00' }}>Price</span> Alerts</>}
            {activeTab === 'leaderboard' && <><span style={{ color: colors.gold }}>🏆</span> Leaderboard</>}
            {activeTab === 'nextbtc' && <><span style={{ color: '#00d4ff' }}>🔮</span> Next Bitcoin</>}
            {activeTab === 'portfolio' && <>My <span style={{ color: colors.accent }}>Portfolio</span></>}
            {activeTab === 'transactions' && <>Transaction <span style={{ color: colors.accent }}>History</span></>}
          </h2>
          <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {activeTab === 'crypto' && lastUpdated && <span style={{ color: colors.green, fontSize: '11px' }}>🟢 Updated {lastUpdated}</span>}
          </div>
        </div>

        {message && (
          <div style={{ background: messageType === 'success' ? 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,200,100,0.08))' : 'linear-gradient(135deg, rgba(255,68,68,0.15), rgba(200,0,0,0.08))', border: `1px solid ${messageType === 'success' ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`, color: messageType === 'success' ? '#00ff88' : '#ff4444', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '500' }}>
            {message}
          </div>
        )}

        {portfolio && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Balance', value: `₹${balance.toLocaleString('en-IN')}`, color: colors.accent, icon: '💰' },
              { label: 'Invested', value: `₹${totalInvested.toLocaleString('en-IN')}`, color: colors.text, icon: '📈' },
              { label: 'Current Value', value: `₹${totalCurrentValue.toLocaleString('en-IN')}`, color: colors.text, icon: '💼' },
              { label: 'Total P&L', value: `${totalPnL >= 0 ? '▲' : '▼'} ₹${Math.abs(totalPnL).toLocaleString('en-IN')}`, sub: `${totalPnLPercent}%`, color: totalPnL >= 0 ? colors.green : colors.red, icon: '📊' },
            ].map((stat, i) => (
              <GlassCard key={i} style={{ padding: '16px 18px' }}>
                <div style={{ color: colors.textMuted, fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>{stat.icon} {stat.label}</div>
                <div style={{ color: stat.color, fontWeight: '700', fontSize: isMobile ? '14px' : '16px' }}>{stat.value}</div>
                {stat.sub && <div style={{ color: stat.color, fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{stat.sub}</div>}
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'crypto' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: colors.textMuted }}>🔍</span>
                <input type="text" placeholder="Search coin... (Bitcoin, BTC)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, background: colors.searchBg, color: colors.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>}
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, background: colors.searchBg, color: colors.text, fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
                <option value="default">📋 Default</option>
                <option value="price_high">💰 Price: High → Low</option>
                <option value="price_low">💰 Price: Low → High</option>
                <option value="gain">📈 Top Gainers</option>
                <option value="loss">📉 Top Losers</option>
              </select>
            </div>
            {searchQuery && <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '12px' }}>{filteredPrices.length} result{filteredPrices.length !== 1 ? 's' : ''} for "{searchQuery}"</div>}
            {filteredPrices.length === 0 ? (
              <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: '60px' }}>
                <div style={{ fontSize: '50px', marginBottom: '16px' }}>🔍</div>
                <p>No coins found for "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>Clear Search</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {filteredPrices.map((coin) => (
                  <GlassCard key={coin.id} id={`crypto-${coin.id}`} hover style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <img src={coin.image} alt={coin.name} style={{ width: isMobile ? '30px' : '36px', height: isMobile ? '30px' : '36px', borderRadius: '50%' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/36'; }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: isMobile ? '12px' : '13px', color: colors.text }}>{coin.name}</div>
                        <div style={{ color: colors.textMuted, fontSize: '10px', textTransform: 'uppercase' }}>{coin.symbol}</div>
                      </div>
                    </div>
                    <div style={{ color: colors.accent, fontWeight: '800', fontSize: isMobile ? '14px' : '16px', marginBottom: '4px' }}>₹{coin.price_inr.toLocaleString('en-IN')}</div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ color: coin.change_24h >= 0 ? colors.green : colors.red, fontSize: '12px', fontWeight: '600', background: coin.change_24h >= 0 ? 'rgba(0,204,112,0.1)' : 'rgba(255,68,68,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                        {coin.change_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change_24h).toFixed(2)}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleBuyCrypto(coin)}>Buy</button>
                      <button style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(0,204,112,0.3)', background: 'rgba(0,204,112,0.08)', color: colors.green, cursor: 'pointer', fontSize: '13px', fontWeight: '700' }} onClick={() => openChart(coin)}>📊</button>
                      <button style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.08)', color: '#ffcc00', cursor: 'pointer', fontSize: '14px' }} onClick={() => openAlertModal(coin)}>🔔</button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div style={{ paddingBottom: '80px' }}>
            {leaderboardLoading ? (
              <div style={{ textAlign: 'center', color: colors.gold, marginTop: '80px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏆</div>Loading rankings...
              </div>
            ) : (
              <div>
                {leaderboard.length >= 3 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', marginBottom: '28px', padding: '20px 0' }}>
                    {[leaderboard[1], leaderboard[0], leaderboard[2]].map((trader, i) => {
                      const heights = [120, 150, 100];
                      const podiumColors = [colors.silver, colors.gold, colors.bronze];
                      const medals = ['🥈', '🥇', '🥉'];
                      return (
                        <div key={trader.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '160px' }}>
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{trader.badge}</div>
                          <div style={{ fontWeight: '800', fontSize: isMobile ? '11px' : '13px', color: trader.isUser ? colors.accent : colors.text, textAlign: 'center', marginBottom: '4px' }}>{trader.name}</div>
                          <div style={{ color: trader.pnl >= 0 ? colors.green : colors.red, fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                            {trader.pnl >= 0 ? '+' : ''}₹{Math.abs(trader.pnl).toLocaleString('en-IN')}
                          </div>
                          <div style={{ width: '100%', height: `${heights[i]}px`, background: `linear-gradient(180deg, ${podiumColors[i]}33, ${podiumColors[i]}11)`, border: `2px solid ${podiumColors[i]}44`, borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                            {medals[i]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {leaderboard.map((trader, index) => {
                    const rankStyle = getRankStyle(index);
                    return (
                      <GlassCard key={trader.name} style={{ padding: '14px 18px', border: trader.isUser ? `1px solid ${colors.accent}44` : undefined, background: trader.isUser ? `${colors.accent}08` : undefined }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ minWidth: '32px', textAlign: 'center', fontWeight: '800', fontSize: index < 3 ? '20px' : '14px', color: rankStyle.color }}>
                            {rankStyle.icon}
                          </div>
                          <div style={{ fontSize: '20px' }}>{trader.badge}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: trader.isUser ? colors.accent : colors.text }}>
                              {trader.name} {trader.isUser && <span style={{ fontSize: '11px', color: colors.accent }}>← You</span>}
                            </div>
                            <div style={{ color: colors.textMuted, fontSize: '11px', marginTop: '2px' }}>
                              Invested: ₹{trader.invested.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: trader.pnl >= 0 ? colors.green : colors.red, fontWeight: '800', fontSize: '15px' }}>
                              {trader.pnl >= 0 ? '+' : ''}₹{Math.abs(trader.pnl).toLocaleString('en-IN')}
                            </div>
                            <div style={{ color: trader.pnl >= 0 ? colors.green : colors.red, fontSize: '12px', opacity: 0.8 }}>
                              {trader.pnl_pct >= 0 ? '+' : ''}{trader.pnl_pct}%
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
                <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: '11px', marginTop: '16px' }}>
                  🔄 Rankings update daily • Virtual trading leaderboard
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nextbtc' && (
          <NextBTC isDark={isDark} />
        )}

        {activeTab === 'stocks' && (
          <div>
            {stocksLoading ? (
              <div style={{ textAlign: 'center', color: colors.accent, marginTop: '80px' }}><div style={{ fontSize: '40px', marginBottom: '16px' }}>📡</div>Loading stocks...</div>
            ) : stocks.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <div style={{ fontSize: '50px', marginBottom: '16px' }}>📊</div>
                <button style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }} onClick={fetchStocks}>Load Stock Prices</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
                {stocks.map(stock => (
                  <GlassCard key={stock.symbol} id={`stock-${stock.symbol}`} hover style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{stock.flag}</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: isMobile ? '11px' : '12px', color: colors.text }}>{stock.name}</div>
                        <div style={{ color: colors.textMuted, fontSize: '10px' }}>{stock.symbol}</div>
                      </div>
                    </div>
                    {stock.price ? (
                      <>
                        <div style={{ color: colors.accent, fontWeight: '800', fontSize: isMobile ? '14px' : '16px', marginBottom: '4px' }}>₹{stock.price.toLocaleString('en-IN')}</div>
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ color: parseFloat(stock.change) >= 0 ? colors.green : colors.red, fontSize: '12px', fontWeight: '600', background: parseFloat(stock.change) >= 0 ? 'rgba(0,204,112,0.1)' : 'rgba(255,68,68,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                            {parseFloat(stock.change) >= 0 ? '▲' : '▼'} ₹{Math.abs(stock.change).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '12px' }}>Loading...</div>}
                    <button style={{ width: '100%', padding: '9px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }} onClick={() => handleBuyStock(stock)}>Buy Now</button>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'signals' && (
          <div>
            {signalsLoading ? (
              <div style={{ textAlign: 'center', color: colors.accent, marginTop: '80px' }}><div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>AI analyzing...</div>
            ) : signals.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <div style={{ fontSize: '50px', marginBottom: '16px' }}>🤖</div>
                <button style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }} onClick={fetchSignals}>Generate AI Signals</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'BUY', count: signals.filter(s => s.signal === 'BUY').length, color: colors.green },
                    { label: 'HOLD', count: signals.filter(s => s.signal === 'HOLD').length, color: '#ffcc00' },
                    { label: 'SELL', count: signals.filter(s => s.signal === 'SELL').length, color: colors.red },
                  ].map(s => (
                    <GlassCard key={s.label} style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ color: s.color, fontSize: '28px', fontWeight: '800' }}>{s.count}</div>
                      <div style={{ color: s.color, fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>{s.label}</div>
                    </GlassCard>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {signals.map(item => (
                    <GlassCard key={item.id} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                          <div>
                            <div style={{ fontWeight: '700', color: colors.text, fontSize: '15px' }}>{item.name}</div>
                            <div style={{ color: colors.textMuted, fontSize: '11px' }}>{item.symbol}</div>
                            <div style={{ color: item.change >= 0 ? colors.green : colors.red, fontSize: '12px', marginTop: '2px', fontWeight: '600' }}>{item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-block', background: item.signal === 'BUY' ? 'rgba(0,204,112,0.12)' : item.signal === 'SELL' ? 'rgba(255,68,68,0.12)' : 'rgba(255,204,0,0.12)', color: item.color, border: `1px solid ${item.color}40`, borderRadius: '10px', padding: '6px 18px', fontWeight: '800', fontSize: '15px', marginBottom: '4px' }}>{item.signal}</div>
                          <div style={{ color: colors.textMuted, fontSize: '11px' }}>{item.reason}</div>
                          <div style={{ color: colors.accent, fontWeight: '700', fontSize: '13px', marginTop: '2px' }}>₹{item.price.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${colors.modalBorder}`, background: colors.card, color: colors.accent, fontWeight: '700', cursor: 'pointer', fontSize: '14px' }} onClick={fetchSignals}>🔄 Refresh Signals</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div>
            {newsLoading ? (
              <div style={{ textAlign: 'center', color: colors.accent, marginTop: '80px' }}><div style={{ fontSize: '40px', marginBottom: '16px' }}>📰</div>Loading news...</div>
            ) : news.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <div style={{ fontSize: '50px', marginBottom: '16px' }}>📰</div>
                <button style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }} onClick={fetchNews}>Load News</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ color: colors.textMuted, fontSize: '12px' }}>📡 Source: CoinDesk</span>
                  <button style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${colors.modalBorder}`, background: colors.card, color: colors.accent, fontWeight: '600', cursor: 'pointer', fontSize: '12px' }} onClick={fetchNews}>🔄 Refresh</button>
                </div>
                {news.map((article, i) => (
                  <GlassCard key={i} id={`news-${i}`} hover style={{ padding: '18px' }}>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: isMobile ? '13px' : '15px', color: colors.text, marginBottom: '8px', lineHeight: 1.4 }}>{article.title}</div>
                          <div style={{ color: colors.textMuted, fontSize: '12px', lineHeight: 1.5, marginBottom: '10px' }}>{article.description}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: colors.accent, fontSize: '11px', fontWeight: '600' }}>✍️ {article.author}</span>
                            <span style={{ color: colors.textMuted, fontSize: '11px' }}>🕐 {new Date(article.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div style={{ color: colors.accent, fontSize: '18px', flexShrink: 0 }}>→</div>
                      </div>
                    </a>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div style={{ paddingBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: colors.textMuted, fontSize: '13px' }}>{alerts.length} active alert{alerts.length !== 1 ? 's' : ''}</span>
              {prices.length > 0 && <button style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.08)', color: '#ffcc00', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }} onClick={() => openAlertModal(prices[0])}>+ New Alert</button>}
            </div>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: '60px' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔔</div>
                <p>No alerts set yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map(alert => {
                  const coin = prices.find(p => p.id === alert.coinId);
                  return (
                    <GlassCard key={alert.id} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '15px', color: colors.text, marginBottom: '4px' }}>{alert.coinName}</div>
                          <div style={{ color: '#ffcc00', fontSize: '13px', marginBottom: '4px' }}>{alert.type === 'above' ? '▲ Above' : '▼ Below'} ₹{alert.targetPrice.toLocaleString('en-IN')}</div>
                          {coin && <div style={{ color: colors.textMuted, fontSize: '11px' }}>Current: ₹{coin.price_inr.toLocaleString('en-IN')}</div>}
                        </div>
                        <button onClick={() => removeAlert(alert.id)} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', cursor: 'pointer', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>Remove</button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && portfolio && (
          <div>
            {portfolio.holdings.length === 0 ? (
              <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: '80px' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
                <p>No holdings yet!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' }}>
                {portfolio.holdings.map(holding => {
                  const pnl = parseFloat(holding.pnl || 0);
                  const pnlPercent = parseFloat(holding.pnl_percent || 0);
                  const currentValue = parseFloat(holding.current_value || 0);
                  const currentPrice = parseFloat(holding.current_price || holding.avg_buy_price);
                  const isProfit = pnl >= 0;
                  return (
                    <GlassCard key={holding.id} style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '18px', color: colors.text, marginBottom: '4px' }}>{holding.asset_name}</div>
                          <span style={{ background: holding.asset_type === 'crypto' ? `${colors.accent}22` : 'rgba(255,204,0,0.12)', color: holding.asset_type === 'crypto' ? colors.accent : '#ffcc00', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{holding.asset_type}</span>
                        </div>
                        <div style={{ background: isProfit ? 'rgba(0,204,112,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${isProfit ? 'rgba(0,204,112,0.3)' : 'rgba(255,68,68,0.3)'}`, borderRadius: '12px', padding: '8px 16px', textAlign: 'right' }}>
                          <div style={{ color: isProfit ? colors.green : colors.red, fontWeight: '800', fontSize: '16px' }}>{isProfit ? '+' : ''}₹{pnl.toLocaleString('en-IN')}</div>
                          <div style={{ color: isProfit ? colors.green : colors.red, fontSize: '12px', opacity: 0.8 }}>{isProfit ? '+' : ''}{pnlPercent}%</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        {[
                          { label: 'Quantity', value: holding.quantity },
                          { label: 'Avg Buy Price', value: `₹${parseFloat(holding.avg_buy_price).toLocaleString('en-IN')}` },
                          { label: 'Current Price', value: `₹${currentPrice.toLocaleString('en-IN')}`, highlight: true },
                          { label: 'Current Value', value: `₹${currentValue.toLocaleString('en-IN')}`, highlight: true },
                        ].map((item, i) => (
                          <div key={i} style={{ background: colors.card, borderRadius: '10px', padding: '10px 12px', border: `1px solid ${colors.cardBorder}` }}>
                            <div style={{ color: colors.textMuted, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ color: item.highlight ? colors.accent : colors.text, fontWeight: '700', fontSize: '13px' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                      <button style={{ width: '100%', padding: '11px', borderRadius: '11px', border: 'none', background: 'linear-gradient(135deg, #ff4444, #cc0000)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }} onClick={() => handleSell(holding)}>
                        Sell {holding.asset_name}
                      </button>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '80px' }}>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: '80px' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
                <p>No transactions yet!</p>
              </div>
            ) : transactions.map(tx => (
              <GlassCard key={tx.id} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: tx.type === 'BUY' ? 'rgba(0,204,112,0.12)' : 'rgba(255,68,68,0.12)', color: tx.type === 'BUY' ? colors.green : colors.red, padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', border: `1px solid ${tx.type === 'BUY' ? 'rgba(0,204,112,0.2)' : 'rgba(255,68,68,0.2)'}` }}>{tx.type}</div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: colors.text }}>{tx.asset_name}</div>
                      <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '2px' }}>Qty: {tx.quantity} @ ₹{parseFloat(tx.price).toLocaleString('en-IN')}</div>
                      <div style={{ color: colors.textMuted, fontSize: '11px' }}>{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div style={{ color: colors.accent, fontWeight: '800', fontSize: '15px' }}>₹{parseFloat(tx.total).toLocaleString('en-IN')}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: colors.header, backdropFilter: 'blur(20px)', borderTop: `1px solid ${colors.sidebarBorder}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 4px' }}>
          {navItems.map(item => (
            <button key={item.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent', border: 'none', color: activeTab === item.id ? colors.navActiveColor : colors.navInactive, cursor: 'pointer', padding: '4px 0', position: 'relative' }}
              onClick={() => handleNav(item.id)}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.badge > 0 && <span style={{ position: 'absolute', top: 0, right: '20%', background: '#ffcc00', color: '#000', borderRadius: '50%', width: '14px', height: '14px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</span>}
              <span style={{ fontSize: '9px', marginTop: '3px', fontWeight: activeTab === item.id ? '700' : '400' }}>{item.label}</span>
              {activeTab === item.id && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors.navActiveColor, marginTop: '3px' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;