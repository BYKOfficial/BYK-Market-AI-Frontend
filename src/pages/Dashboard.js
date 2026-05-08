import React, { useState, useEffect } from 'react';
import { getCryptoPrices, getPortfolio, buyAsset, sellAsset, getStockPrice, getTransactions } from '../services/api';

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

function Dashboard({ user, onLogout }) {
  const [prices, setPrices] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('crypto');
  const [stocksLoading, setStocksLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    fetchPrices();
    fetchPortfolio();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await getCryptoPrices();
      setPrices(res.data.data);
    } catch (err) {}
  };

  const fetchStocks = async () => {
    setStocksLoading(true);
    try {
      const results = await Promise.all(
        STOCKS.map(async (stock) => {
          try {
            const res = await getStockPrice(stock.symbol);
            return { ...stock, price: res.data.data.price, change: res.data.data.change };
          } catch { return { ...stock, price: null, change: null }; }
        })
      );
      setStocks(results);
    } catch (err) {}
    setStocksLoading(false);
  };

  const fetchPortfolio = async () => {
    try {
      const res = await getPortfolio();
      setPortfolio(res.data.data);
    } catch (err) {}
  };

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data.data);
    } catch (err) {}
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBuyCrypto = async (coin) => {
    const quantity = prompt(`Kitna ${coin.name} kharidna hai?`);
    if (!quantity) return;
    try {
      await buyAsset({ asset_name: coin.name, asset_type: 'crypto', quantity: parseFloat(quantity), price: coin.price_inr });
      showMessage(`✅ ${coin.name} kharida gaya!`);
      fetchPortfolio();
    } catch (err) { showMessage(err.response?.data?.message || 'Buy failed!', 'error'); }
  };

  const handleBuyStock = async (stock) => {
    if (!stock.price) return alert('Price load nahi hua!');
    const quantity = prompt(`Kitne ${stock.name} shares kharidne hain?`);
    if (!quantity) return;
    try {
      await buyAsset({ asset_name: stock.name, asset_type: 'stock', quantity: parseFloat(quantity), price: stock.price });
      showMessage(`✅ ${stock.name} kharida gaya!`);
      fetchPortfolio();
    } catch (err) { showMessage(err.response?.data?.message || 'Buy failed!', 'error'); }
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
    try {
      await sellAsset({ asset_name: holding.asset_name, quantity: parseFloat(quantity), price });
      showMessage(`✅ ${holding.asset_name} becha gaya!`);
      fetchPortfolio();
    } catch (err) { showMessage(err.response?.data?.message || 'Sell failed!', 'error'); }
  };

  const totalInvested = portfolio ? parseFloat(portfolio.total_invested) : 0;
  const balance = portfolio ? parseFloat(portfolio.user.virtual_balance) : 0;
  const totalValue = 10000000 - balance + totalInvested;

  const navItems = [
    { id: 'crypto', icon: '🪙', label: 'Crypto' },
    { id: 'stocks', icon: '📊', label: 'Stocks' },
    { id: 'portfolio', icon: '💼', label: 'Portfolio' },
    { id: 'transactions', icon: '📜', label: 'History' },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>📈 BYK</div>
        <nav style={styles.nav}>
          {navItems.map(item => (
            <button key={item.id}
              style={activeTab === item.id ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'stocks' && stocks.length === 0) fetchStocks();
                if (item.id === 'transactions') fetchTransactions();
                if (item.id === 'portfolio') fetchPortfolio();
              }}>
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={onLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.pageTitle}>
              {activeTab === 'crypto' && '🪙 Crypto Market'}
              {activeTab === 'stocks' && '📊 Stock Market'}
              {activeTab === 'portfolio' && '💼 My Portfolio'}
              {activeTab === 'transactions' && '📜 Transaction History'}
            </h2>
          </div>
          <div style={styles.userSection}>
            <div style={styles.balanceBox}>
              <span style={styles.balanceLabel}>Balance</span>
              <span style={styles.balanceValue}>₹{balance.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.avatar}>👤 {user.name}</div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={messageType === 'success' ? styles.msgSuccess : styles.msgError}>
            {message}
          </div>
        )}

        {/* Stats Bar */}
        {portfolio && (
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>💰 Virtual Balance</span>
              <span style={styles.statVal}>₹{balance.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>📈 Total Invested</span>
              <span style={styles.statVal}>₹{totalInvested.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>🏦 Holdings</span>
              <span style={styles.statVal}>{portfolio.total_holdings}</span>
            </div>
          </div>
        )}

        {/* Crypto Tab */}
        {activeTab === 'crypto' && (
          <div style={styles.grid}>
            {prices.map(coin => (
              <div key={coin.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <img src={coin.image} alt={coin.name} style={styles.coinImg}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                  <div>
                    <div style={styles.coinName}>{coin.name}</div>
                    <div style={styles.coinSymbol}>{coin.symbol}</div>
                  </div>
                </div>
                <div style={styles.coinPrice}>₹{coin.price_inr.toLocaleString('en-IN')}</div>
                <div style={coin.change_24h >= 0 ? styles.up : styles.down}>
                  {coin.change_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change_24h).toFixed(2)}%
                </div>
                <button style={styles.buyBtn} onClick={() => handleBuyCrypto(coin)}>Buy</button>
              </div>
            ))}
          </div>
        )}

        {/* Stocks Tab */}
        {activeTab === 'stocks' && (
          <div>
            {stocksLoading ? (
              <div style={styles.loading}>📡 Stocks load ho rahe hain...</div>
            ) : (
              <div style={styles.grid}>
                {stocks.map(stock => (
                  <div key={stock.symbol} style={styles.card}>
                    <div style={styles.cardTop}>
                      <span style={styles.flagBig}>{stock.flag}</span>
                      <div>
                        <div style={styles.coinName}>{stock.name}</div>
                        <div style={styles.coinSymbol}>{stock.symbol}</div>
                      </div>
                    </div>
                    {stock.price ? (
                      <>
                        <div style={styles.coinPrice}>₹{stock.price.toLocaleString('en-IN')}</div>
                        <div style={parseFloat(stock.change) >= 0 ? styles.up : styles.down}>
                          {parseFloat(stock.change) >= 0 ? '▲' : '▼'} ₹{Math.abs(stock.change).toFixed(2)}
                        </div>
                      </>
                    ) : <div style={styles.coinSymbol}>Loading...</div>}
                    <button style={styles.buyBtn} onClick={() => handleBuyStock(stock)}>Buy</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && portfolio && (
          <div>
            {portfolio.holdings.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p>Koi holding nahi — Crypto ya Stocks se kharido!</p>
              </div>
            ) : (
              <div style={styles.holdingsList}>
                {portfolio.holdings.map(holding => (
                  <div key={holding.id} style={styles.holdingCard}>
                    <div style={styles.holdingLeft}>
                      <div style={styles.holdingName}>{holding.asset_name}</div>
                      <span style={styles.badge}>{holding.asset_type}</span>
                      <div style={styles.holdingDetail}>Qty: {holding.quantity}</div>
                      <div style={styles.holdingDetail}>Avg: ₹{parseFloat(holding.avg_buy_price).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={styles.holdingRight}>
                      <div style={styles.holdingValue}>
                        ₹{(parseFloat(holding.quantity) * parseFloat(holding.avg_buy_price)).toLocaleString('en-IN')}
                      </div>
                      <button style={styles.sellBtn} onClick={() => handleSell(holding)}>Sell</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div style={styles.holdingsList}>
            {transactions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p>Koi transaction nahi!</p>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} style={styles.txCard}>
                  <div style={styles.txLeft}>
                    <span style={tx.type === 'BUY' ? styles.txBuy : styles.txSell}>{tx.type}</span>
                    <span style={styles.txName}>{tx.asset_name}</span>
                    <span style={styles.txBadge}>{tx.asset_type}</span>
                  </div>
                  <div style={styles.txRight}>
                    <div style={styles.txAmount}>₹{parseFloat(tx.total).toLocaleString('en-IN')}</div>
                    <div style={styles.txDetail}>Qty: {tx.quantity} @ ₹{parseFloat(tx.price).toLocaleString('en-IN')}</div>
                    <div style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#0a0a1a', color: '#fff' },
  sidebar: { width: '220px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: '20px 0', position: 'fixed', height: '100vh' },
  sidebarLogo: { color: '#00d4ff', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', padding: '0 20px 30px' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 10px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '15px', textAlign: 'left' },
  navItemActive: { background: 'linear-gradient(135deg, #00d4ff22, #0099cc22)', color: '#00d4ff', borderLeft: '3px solid #00d4ff' },
  navIcon: { fontSize: '20px' },
  logoutBtn: { margin: '10px', padding: '12px', borderRadius: '10px', border: 'none', background: '#ff444422', color: '#ff4444', cursor: 'pointer', fontSize: '14px' },
  main: { marginLeft: '220px', flex: 1, padding: '20px 30px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  pageTitle: { margin: 0, fontSize: '24px', color: '#fff' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  balanceBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  balanceLabel: { color: '#aaa', fontSize: '12px' },
  balanceValue: { color: '#00ff88', fontWeight: 'bold', fontSize: '18px' },
  avatar: { background: 'rgba(0,212,255,0.1)', border: '1px solid #00d4ff', padding: '8px 15px', borderRadius: '10px', color: '#00d4ff' },
  msgSuccess: { background: '#00ff8820', border: '1px solid #00ff88', color: '#00ff88', padding: '10px 20px', borderRadius: '10px', marginBottom: '20px' },
  msgError: { background: '#ff444420', border: '1px solid #ff4444', color: '#ff4444', padding: '10px 20px', borderRadius: '10px', marginBottom: '20px' },
  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' },
  statItem: { background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '15px 20px', border: '1px solid rgba(255,255,255,0.08)' },
  statLabel: { display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px' },
  statVal: { display: 'block', color: '#00d4ff', fontWeight: 'bold', fontSize: '18px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' },
  card: { background: 'rgba(255,255,255,0.04)', borderRadius: '15px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.2s', cursor: 'default' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  coinImg: { width: '40px', height: '40px', borderRadius: '50%' },
  flagBig: { fontSize: '35px' },
  coinName: { fontWeight: 'bold', fontSize: '14px' },
  coinSymbol: { color: '#aaa', fontSize: '12px' },
  coinPrice: { color: '#00d4ff', fontWeight: 'bold', fontSize: '18px', margin: '8px 0' },
  up: { color: '#00ff88', fontSize: '13px', marginBottom: '10px' },
  down: { color: '#ff4444', fontSize: '13px', marginBottom: '10px' },
  buyBtn: { width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #00ff88, #00cc66)', color: '#000', fontWeight: 'bold', cursor: 'pointer' },
  loading: { textAlign: 'center', color: '#00d4ff', marginTop: '50px', fontSize: '18px' },
  holdingsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  holdingCard: { background: 'rgba(255,255,255,0.04)', borderRadius: '15px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  holdingLeft: {},
  holdingRight: { textAlign: 'right' },
  holdingName: { fontWeight: 'bold', fontSize: '18px', color: '#00d4ff', marginBottom: '5px' },
  holdingDetail: { color: '#aaa', fontSize: '13px', margin: '3px 0' },
  holdingValue: { color: '#00ff88', fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' },
  badge: { background: 'rgba(0,212,255,0.2)', color: '#00d4ff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', marginBottom: '8px', display: 'inline-block' },
  sellBtn: { padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ff4444, #cc0000)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  emptyState: { textAlign: 'center', color: '#aaa', marginTop: '80px' },
  emptyIcon: { fontSize: '60px', marginBottom: '20px' },
  txCard: { background: 'rgba(255,255,255,0.04)', borderRadius: '15px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  txLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  txBuy: { background: '#00ff8820', color: '#00ff88', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px' },
  txSell: { background: '#ff444420', color: '#ff4444', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px' },
  txName: { fontWeight: 'bold', fontSize: '16px' },
  txBadge: { background: 'rgba(0,212,255,0.2)', color: '#00d4ff', padding: '2px 8px', borderRadius: '8px', fontSize: '11px' },
  txRight: { textAlign: 'right' },
  txAmount: { color: '#00d4ff', fontWeight: 'bold', fontSize: '18px' },
  txDetail: { color: '#aaa', fontSize: '12px', margin: '3px 0' },
  txDate: { color: '#666', fontSize: '12px' },
};

export default Dashboard;