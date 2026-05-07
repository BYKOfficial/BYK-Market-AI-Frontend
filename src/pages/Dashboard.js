import React, { useState, useEffect } from 'react';
import { getCryptoPrices, getPortfolio, buyAsset, sellAsset, getStockPrice } from '../services/api';

const STOCKS = [
  { symbol: 'RELIANCE.BO', name: 'Reliance Industries', type: 'stock', flag: '🇮🇳' },
  { symbol: 'TCS.BO', name: 'TCS', type: 'stock', flag: '🇮🇳' },
  { symbol: 'HDFCBANK.BO', name: 'HDFC Bank', type: 'stock', flag: '🇮🇳' },
  { symbol: 'INFY.BO', name: 'Infosys', type: 'stock', flag: '🇮🇳' },
  { symbol: 'WIPRO.BO', name: 'Wipro', type: 'stock', flag: '🇮🇳' },
  { symbol: 'AAPL', name: 'Apple', type: 'stock', flag: '🌍' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock', flag: '🌍' },
  { symbol: 'GOOGL', name: 'Google', type: 'stock', flag: '🌍' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', flag: '🌍' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', flag: '🌍' },
];

function Dashboard({ user, onLogout }) {
  const [prices, setPrices] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [activeTab, setActiveTab] = useState('crypto');
  const [loading, setLoading] = useState(false);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPrices();
    fetchPortfolio();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await getCryptoPrices();
      setPrices(res.data.data);
    } catch (err) {
      console.error('Price fetch failed');
    }
  };

  const fetchStocks = async () => {
    setStocksLoading(true);
    try {
      const results = await Promise.all(
        STOCKS.map(async (stock) => {
          try {
            const res = await getStockPrice(stock.symbol);
            return { ...stock, price: res.data.data.price, change: res.data.data.change };
          } catch {
            return { ...stock, price: null, change: null };
          }
        })
      );
      setStocks(results);
    } catch (err) {
      console.error('Stock fetch failed');
    }
    setStocksLoading(false);
  };

  const fetchPortfolio = async () => {
    try {
      const res = await getPortfolio();
      setPortfolio(res.data.data);
    } catch (err) {
      console.error('Portfolio fetch failed');
    }
  };

  const handleBuyCrypto = async (coin) => {
    const quantity = prompt(`Kitna ${coin.name} kharidna hai? (e.g. 0.1)`);
    if (!quantity) return;
    setLoading(true);
    try {
      await buyAsset({
        asset_name: coin.name,
        asset_type: 'crypto',
        quantity: parseFloat(quantity),
        price: coin.price_inr
      });
      setMessage(`✅ ${coin.name} kharida gaya!`);
      fetchPortfolio();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Buy failed!');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBuyStock = async (stock) => {
    if (!stock.price) return alert('Price load nahi hua!');
    const quantity = prompt(`Kitne ${stock.name} shares kharidne hain? (e.g. 5)`);
    if (!quantity) return;
    setLoading(true);
    try {
      await buyAsset({
        asset_name: stock.name,
        asset_type: 'stock',
        quantity: parseFloat(quantity),
        price: stock.price
      });
      setMessage(`✅ ${stock.name} kharida gaya!`);
      fetchPortfolio();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Buy failed!');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSell = async (holding) => {
    const quantity = prompt(`Kitna ${holding.asset_name} bechna hai?`);
    if (!quantity) return;
    let price = parseFloat(holding.avg_buy_price);
    if (holding.asset_type === 'crypto') {
      const priceRes = await getCryptoPrices();
      const coin = priceRes.data.data.find(c => c.name === holding.asset_name);
      if (coin) price = coin.price_inr;
    }
    setLoading(true);
    try {
      await sellAsset({
        asset_name: holding.asset_name,
        quantity: parseFloat(quantity),
        price: price
      });
      setMessage(`✅ ${holding.asset_name} becha gaya!`);
      fetchPortfolio();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Sell failed!');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>📈 BYK Market AI</h1>
        <div style={styles.userInfo}>
          <span style={styles.balance}>
            💰 ₹{portfolio ? parseFloat(portfolio.user.virtual_balance).toLocaleString('en-IN') : '...'}
          </span>
          <span style={styles.userName}>👤 {user.name}</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.tabs}>
        <button style={activeTab === 'crypto' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('crypto')}>
          🪙 Crypto
        </button>
        <button style={activeTab === 'stocks' ? styles.activeTab : styles.tab} onClick={() => { setActiveTab('stocks'); if (stocks.length === 0) fetchStocks(); }}>
          📊 Stocks
        </button>
        <button style={activeTab === 'portfolio' ? styles.activeTab : styles.tab} onClick={() => { setActiveTab('portfolio'); fetchPortfolio(); }}>
          💼 Portfolio
        </button>
      </div>

      {activeTab === 'crypto' && (
        <div style={styles.grid}>
          {prices.map(coin => (
            <div key={coin.id} style={styles.card}>
              <img src={coin.image} alt={coin.name} style={styles.coinImg} />
              <h3 style={styles.coinName}>{coin.name}</h3>
              <p style={styles.coinSymbol}>{coin.symbol}</p>
              <p style={styles.price}>₹{coin.price_inr.toLocaleString('en-IN')}</p>
              <p style={coin.change_24h >= 0 ? styles.up : styles.down}>
                {coin.change_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change_24h).toFixed(2)}%
              </p>
              <button style={styles.buyBtn} onClick={() => handleBuyCrypto(coin)}>Buy</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stocks' && (
        <div>
          {stocksLoading ? (
            <p style={styles.loading}>📡 Stocks load ho rahe hain... thoda wait karo!</p>
          ) : (
            <div style={styles.grid}>
              {stocks.map(stock => (
                <div key={stock.symbol} style={styles.card}>
                  <div style={styles.flagIcon}>{stock.flag}</div>
                  <h3 style={styles.coinName}>{stock.name}</h3>
                  <p style={styles.coinSymbol}>{stock.symbol}</p>
                  {stock.price ? (
                    <>
                      <p style={styles.price}>₹{stock.price.toLocaleString('en-IN')}</p>
                      <p style={stock.change >= 0 ? styles.up : styles.down}>
                        {stock.change >= 0 ? '▲' : '▼'} ₹{Math.abs(stock.change).toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p style={styles.coinSymbol}>Price unavailable</p>
                  )}
                  <button style={styles.buyBtn} onClick={() => handleBuyStock(stock)}>Buy</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'portfolio' && portfolio && (
        <div style={styles.portfolioContainer}>
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Virtual Balance</p>
              <p style={styles.statValue}>₹{parseFloat(portfolio.user.virtual_balance).toLocaleString('en-IN')}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Invested</p>
              <p style={styles.statValue}>₹{parseFloat(portfolio.total_invested).toLocaleString('en-IN')}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Holdings</p>
              <p style={styles.statValue}>{portfolio.total_holdings}</p>
            </div>
          </div>
          {portfolio.holdings.length === 0 ? (
            <p style={styles.empty}>Koi holding nahi — Crypto ya Stocks se kharido!</p>
          ) : (
            portfolio.holdings.map(holding => (
              <div key={holding.id} style={styles.holdingCard}>
                <div>
                  <h3 style={styles.holdingName}>{holding.asset_name}
                    <span style={styles.assetBadge}>{holding.asset_type}</span>
                  </h3>
                  <p style={styles.holdingDetail}>Quantity: {holding.quantity}</p>
                  <p style={styles.holdingDetail}>Avg Buy: ₹{parseFloat(holding.avg_buy_price).toLocaleString('en-IN')}</p>
                </div>
                <button style={styles.sellBtn} onClick={() => handleSell(holding)}>Sell</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a1a', color: '#ffffff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logo: { color: '#00d4ff', margin: 0, fontSize: '24px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
  balance: { color: '#00ff88', fontWeight: 'bold', fontSize: '18px' },
  userName: { color: '#ffffff' },
  logoutBtn: { padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ff4444', color: '#fff', cursor: 'pointer' },
  message: { background: '#00ff8820', border: '1px solid #00ff88', color: '#00ff88', padding: '10px 30px', textAlign: 'center' },
  tabs: { display: 'flex', gap: '10px', padding: '20px 30px' },
  tab: { padding: '10px 25px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#ffffff', cursor: 'pointer', fontSize: '16px' },
  activeTab: { padding: '10px 25px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0099cc)', color: '#ffffff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', padding: '0 30px 30px' },
  card: { background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  coinImg: { width: '50px', height: '50px' },
  flagIcon: { fontSize: '40px', marginBottom: '10px' },
  coinName: { margin: '10px 0 5px', fontSize: '16px' },
  coinSymbol: { color: '#aaaaaa', margin: '0 0 10px' },
  price: { color: '#00d4ff', fontWeight: 'bold', fontSize: '18px', margin: '5px 0' },
  up: { color: '#00ff88', margin: '5px 0' },
  down: { color: '#ff4444', margin: '5px 0' },
  buyBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #00ff88, #00cc66)', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  portfolioContainer: { padding: '0 30px 30px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  statLabel: { color: '#aaaaaa', margin: '0 0 10px' },
  statValue: { color: '#00d4ff', fontWeight: 'bold', fontSize: '24px', margin: 0 },
  holdingCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  holdingName: { margin: '0 0 5px', color: '#00d4ff' },
  holdingDetail: { margin: '3px 0', color: '#aaaaaa', fontSize: '14px' },
  sellBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ff4444, #cc0000)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#aaaaaa', marginTop: '50px', fontSize: '18px' },
  loading: { textAlign: 'center', color: '#00d4ff', marginTop: '50px', fontSize: '18px' },
  assetBadge: { fontSize: '11px', background: 'rgba(0,212,255,0.2)', color: '#00d4ff', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px' },
};

export default Dashboard;