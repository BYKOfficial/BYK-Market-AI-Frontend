import React, { useState, useEffect } from 'react';
import { getCryptoPrices, getPortfolio, buyAsset, sellAsset, getStockPrice, getTransactions, getSignals } from '../services/api';

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
  const [signals, setSignals] = useState([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('crypto');
  const [stocksLoading, setStocksLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchPrices(); fetchPortfolio(); }, []);
  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  const fetchPrices = async () => {
    try { const res = await getCryptoPrices(); setPrices(res.data.data); } catch (err) {}
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
    let price = parseFloat(holding.current_price || holding.avg_buy_price);
    try {
      await sellAsset({ asset_name: holding.asset_name, quantity: parseFloat(quantity), price });
      showMessage(`✅ ${holding.asset_name} becha gaya!`); fetchPortfolio();
    } catch (err) { showMessage(err.response?.data?.message || 'Sell failed!', 'error'); }
  };

  const balance = portfolio ? parseFloat(portfolio.user.virtual_balance) : 0;
  const totalInvested = portfolio ? parseFloat(portfolio.total_invested) : 0;
  const totalCurrentValue = portfolio ? parseFloat(portfolio.total_current_value || 0) : 0;
  const totalPnL = portfolio ? parseFloat(portfolio.total_pnl || 0) : 0;
  const totalPnLPercent = portfolio ? parseFloat(portfolio.total_pnl_percent || 0) : 0;

  const navItems = [
    { id: 'crypto', icon: '🪙', label: 'Crypto' },
    { id: 'stocks', icon: '📊', label: 'Stocks' },
    { id: 'signals', icon: '🤖', label: 'Signals' },
    { id: 'portfolio', icon: '💼', label: 'Portfolio' },
    { id: 'transactions', icon: '📜', label: 'History' },
  ];

  const handleNav = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
    if (id === 'stocks' && stocks.length === 0) fetchStocks();
    if (id === 'transactions') fetchTransactions();
    if (id === 'portfolio') fetchPortfolio();
    if (id === 'signals') fetchSignals();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a1a', color: '#fff' }}>

      {isMobile && (
        <div style={styles.mobileHeader}>
          <div style={styles.mobileLogo}>📈 BYK Market AI</div>
          <div style={styles.mobileRight}>
            <span style={styles.mobileBalance}>₹{balance.toLocaleString('en-IN')}</span>
            <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      )}

      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          {navItems.map(item => (
            <button key={item.id}
              style={activeTab === item.id ? { ...styles.mobileNavItem, ...styles.mobileNavActive } : styles.mobileNavItem}
              onClick={() => handleNav(item.id)}>
              {item.icon} {item.label}
            </button>
          ))}
          <button style={styles.mobileLogout} onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      {!isMobile && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogo}>📈 BYK</div>
          <div style={styles.sidebarUser}>
            <div style={styles.sidebarUserName}>👤 {user.name}</div>
            <div style={styles.sidebarBalance}>₹{balance.toLocaleString('en-IN')}</div>
          </div>
          <nav style={styles.nav}>
            {navItems.map(item => (
              <button key={item.id}
                style={activeTab === item.id ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
                onClick={() => handleNav(item.id)}>
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button style={styles.logoutBtn} onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      <div style={{
        ...styles.main,
        marginLeft: isMobile ? 0 : '220px',
        padding: isMobile ? '70px 14px 90px' : '20px 30px',
        flex: 1,
      }}>

        <div style={styles.topBar}>
          <h2 style={{ ...styles.pageTitle, fontSize: isMobile ? '18px' : '22px' }}>
            {activeTab === 'crypto' && '🪙 Crypto Market'}
            {activeTab === 'stocks' && '📊 Stock Market'}
            {activeTab === 'signals' && '🤖 AI Signals'}
            {activeTab === 'portfolio' && '💼 My Portfolio'}
            {activeTab === 'transactions' && '📜 History'}
          </h2>
        </div>

        {message && (
          <div style={messageType === 'success' ? styles.msgSuccess : styles.msgError}>{message}</div>
        )}

        {portfolio && (
          <div style={{ ...styles.statsBar, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '15px' }}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>💰 Balance</span>
              <span style={styles.statVal}>₹{balance.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>📈 Invested</span>
              <span style={styles.statVal}>₹{totalInvested.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>💼 Current Value</span>
              <span style={styles.statVal}>₹{totalCurrentValue.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>📊 Total P&L</span>
              <span style={{ ...styles.statVal, color: totalPnL >= 0 ? '#00ff88' : '#ff4444' }}>
                {totalPnL >= 0 ? '▲' : '▼'} ₹{Math.abs(totalPnL).toLocaleString('en-IN')}
                <span style={{ fontSize: '12px', marginLeft: '4px' }}>({totalPnLPercent}%)</span>
              </span>
            </div>
          </div>
        )}

        {activeTab === 'crypto' && (
          <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? '10px' : '15px' }}>
            {prices.map(coin => (
              <div key={coin.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <img src={coin.image} alt={coin.name} style={isMobile ? styles.coinImgSm : styles.coinImg}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                  <div>
                    <div style={{ ...styles.coinName, fontSize: isMobile ? '12px' : '13px' }}>{coin.name}</div>
                    <div style={styles.coinSymbol}>{coin.symbol}</div>
                  </div>
                </div>
                <div style={{ ...styles.coinPrice, fontSize: isMobile ? '14px' : '17px' }}>₹{coin.price_inr.toLocaleString('en-IN')}</div>
                <div style={coin.change_24h >= 0 ? styles.up : styles.down}>
                  {coin.change_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change_24h).toFixed(2)}%
                </div>
                <button style={styles.buyBtn} onClick={() => handleBuyCrypto(coin)}>🛒 Buy</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stocks' && (
          <div>
            {stocksLoading ? (
              <div style={styles.loading}>📡 Stocks load ho rahe hain...</div>
            ) : stocks.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button style={{ ...styles.buyBtn, width: 'auto', padding: '12px 30px', fontSize: '16px' }} onClick={fetchStocks}>📡 Load Stocks</button>
              </div>
            ) : (
              <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? '10px' : '15px' }}>
                {stocks.map(stock => (
                  <div key={stock.symbol} style={styles.card}>
                    <div style={styles.cardTop}>
                      <span style={{ fontSize: isMobile ? '24px' : '32px' }}>{stock.flag}</span>
                      <div>
                        <div style={{ ...styles.coinName, fontSize: isMobile ? '11px' : '13px' }}>{stock.name}</div>
                        <div style={styles.coinSymbol}>{stock.symbol}</div>
                      </div>
                    </div>
                    {stock.price ? (
                      <>
                        <div style={{ ...styles.coinPrice, fontSize: isMobile ? '14px' : '17px' }}>₹{stock.price.toLocaleString('en-IN')}</div>
                        <div style={parseFloat(stock.change) >= 0 ? styles.up : styles.down}>
                          {parseFloat(stock.change) >= 0 ? '▲' : '▼'} ₹{Math.abs(stock.change).toFixed(2)}
                        </div>
                      </>
                    ) : <div style={styles.coinSymbol}>Loading...</div>}
                    <button style={styles.buyBtn} onClick={() => handleBuyStock(stock)}>🛒 Buy</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'signals' && (
          <div>
            {signalsLoading ? (
              <div style={styles.loading}>🤖 AI Signals generate ho rahe hain...</div>
            ) : signals.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button style={{ ...styles.buyBtn, width: 'auto', padding: '12px 30px', fontSize: '16px' }} onClick={fetchSignals}>🤖 Generate Signals</button>
              </div>
            ) : (
              <div style={styles.holdingsList}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ ...styles.statItem, flex: 1, textAlign: 'center' }}>
                    <div style={{ color: '#00ff88', fontSize: '22px', fontWeight: 'bold' }}>{signals.filter(s => s.signal === 'BUY').length}</div>
                    <div style={{ color: '#aaa', fontSize: '12px' }}>🟢 BUY</div>
                  </div>
                  <div style={{ ...styles.statItem, flex: 1, textAlign: 'center' }}>
                    <div style={{ color: '#ffcc00', fontSize: '22px', fontWeight: 'bold' }}>{signals.filter(s => s.signal === 'HOLD').length}</div>
                    <div style={{ color: '#aaa', fontSize: '12px' }}>🟡 HOLD</div>
                  </div>
                  <div style={{ ...styles.statItem, flex: 1, textAlign: 'center' }}>
                    <div style={{ color: '#ff4444', fontSize: '22px', fontWeight: 'bold' }}>{signals.filter(s => s.signal === 'SELL').length}</div>
                    <div style={{ color: '#aaa', fontSize: '12px' }}>🔴 SELL</div>
                  </div>
                </div>
                {signals.map(item => (
                  <div key={item.id} style={{ ...styles.holdingCard, flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <img src={item.image} alt={item.name} style={styles.coinImg}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                      <div>
                        <div style={styles.holdingName}>{item.name}</div>
                        <div style={styles.coinSymbol}>{item.symbol}</div>
                        <div style={{ color: item.change >= 0 ? '#00ff88' : '#ff4444', fontSize: '13px', marginTop: '4px' }}>
                          {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                      <div style={{
                        display: 'inline-block',
                        background: item.signal === 'BUY' ? '#00ff8820' : item.signal === 'SELL' ? '#ff444420' : '#ffcc0020',
                        color: item.color,
                        border: `1px solid ${item.color}`,
                        borderRadius: '10px',
                        padding: '6px 18px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginBottom: '6px',
                      }}>
                        {item.signal === 'BUY' ? '🟢' : item.signal === 'SELL' ? '🔴' : '🟡'} {item.signal}
                      </div>
                      <div style={{ color: '#aaa', fontSize: '12px' }}>{item.reason}</div>
                      <div style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
                <button style={{ ...styles.buyBtn, marginTop: '10px' }} onClick={fetchSignals}>🔄 Refresh Signals</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && portfolio && (
          <div>
            {portfolio.holdings.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p>Koi holding nahi — Crypto ya Stocks se kharido!</p>
              </div>
            ) : (
              <div style={styles.holdingsList}>
                {portfolio.holdings.map(holding => {
                  const pnl = parseFloat(holding.pnl || 0);
                  const pnlPercent = parseFloat(holding.pnl_percent || 0);
                  const currentValue = parseFloat(holding.current_value || 0);
                  const currentPrice = parseFloat(holding.current_price || holding.avg_buy_price);
                  return (
                    <div key={holding.id} style={{ ...styles.holdingCard, flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={styles.holdingName}>{holding.asset_name}</div>
                          <span style={styles.badge}>{holding.asset_type}</span>
                        </div>
                        <div style={{
                          background: pnl >= 0 ? '#00ff8815' : '#ff444415',
                          border: `1px solid ${pnl >= 0 ? '#00ff88' : '#ff4444'}`,
                          borderRadius: '10px',
                          padding: '6px 14px',
                          textAlign: 'right',
                        }}>
                          <div style={{ color: pnl >= 0 ? '#00ff88' : '#ff4444', fontWeight: 'bold', fontSize: '15px' }}>
                            {pnl >= 0 ? '▲' : '▼'} ₹{Math.abs(pnl).toLocaleString('en-IN')}
                          </div>
                          <div style={{ color: pnl >= 0 ? '#00ff88' : '#ff4444', fontSize: '11px' }}>
                            {pnl >= 0 ? '+' : ''}{pnlPercent}%
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        <div style={styles.miniStat}>
                          <span style={styles.miniLabel}>Qty</span>
                          <span style={styles.miniVal}>{holding.quantity}</span>
                        </div>
                        <div style={styles.miniStat}>
                          <span style={styles.miniLabel}>Avg Buy</span>
                          <span style={styles.miniVal}>₹{parseFloat(holding.avg_buy_price).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={styles.miniStat}>
                          <span style={styles.miniLabel}>Current Price</span>
                          <span style={styles.miniVal}>₹{currentPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={styles.miniStat}>
                          <span style={styles.miniLabel}>Current Value</span>
                          <span style={{ ...styles.miniVal, color: '#00d4ff' }}>₹{currentValue.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <button style={styles.sellBtn} onClick={() => handleSell(holding)}>🔴 Sell {holding.asset_name}</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div style={styles.holdingsList}>
            {transactions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p>Koi transaction nahi!</p>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} style={{ ...styles.txCard, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' }}>
                  <div style={styles.txLeft}>
                    <span style={tx.type === 'BUY' ? styles.txBuy : styles.txSell}>{tx.type}</span>
                    <div>
                      <div style={styles.txName}>{tx.asset_name} <span style={styles.txBadge}>{tx.asset_type}</span></div>
                      <div style={styles.txDetail}>Qty: {tx.quantity} @ ₹{parseFloat(tx.price).toLocaleString('en-IN')}</div>
                      <div style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{ ...styles.txAmount, marginLeft: isMobile ? '0' : 'auto' }}>₹{parseFloat(tx.total).toLocaleString('en-IN')}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <div style={styles.bottomNav}>
          {navItems.map(item => (
            <button key={item.id}
              style={activeTab === item.id ? { ...styles.bottomNavItem, ...styles.bottomNavActive } : styles.bottomNavItem}
              onClick={() => handleNav(item.id)}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '9px', marginTop: '2px' }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

const styles = {
  mobileHeader: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: '#0d0d1f', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px', boxSizing: 'border-box' },
  mobileLogo: { color: '#00d4ff', fontWeight: 'bold', fontSize: '17px' },
  mobileRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  mobileBalance: { color: '#00ff88', fontWeight: 'bold', fontSize: '13px' },
  hamburger: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '18px', cursor: 'pointer', borderRadius: '8px', padding: '4px 10px' },
  mobileMenu: { position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 999, background: '#0d0d1f', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '5px' },
  mobileNavItem: { padding: '12px 15px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '16px', textAlign: 'left' },
  mobileNavActive: { background: 'rgba(0,212,255,0.15)', color: '#00d4ff' },
  mobileLogout: { padding: '12px 15px', borderRadius: '10px', border: 'none', background: '#ff444415', color: '#ff4444', cursor: 'pointer', fontSize: '16px', textAlign: 'left' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: '#0d0d1f', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-around', padding: '8px 0' },
  bottomNavItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px 0' },
  bottomNavActive: { color: '#00d4ff' },
  sidebar: { width: '220px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: '20px 0', position: 'fixed', height: '100vh' },
  sidebarLogo: { color: '#00d4ff', fontSize: '22px', fontWeight: 'bold', textAlign: 'center', padding: '0 20px 15px' },
  sidebarUser: { margin: '0 10px 20px', padding: '12px', background: 'rgba(0,212,255,0.05)', borderRadius: '10px', border: '1px solid rgba(0,212,255,0.1)' },
  sidebarUserName: { color: '#fff', fontSize: '13px', marginBottom: '4px' },
  sidebarBalance: { color: '#00ff88', fontWeight: 'bold', fontSize: '16px' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 10px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '15px', textAlign: 'left' },
  navItemActive: { background: 'linear-gradient(135deg, #00d4ff22, #0099cc22)', color: '#00d4ff', borderLeft: '3px solid #00d4ff' },
  navIcon: { fontSize: '20px' },
  logoutBtn: { margin: '10px', padding: '12px', borderRadius: '10px', border: 'none', background: '#ff444422', color: '#ff4444', cursor: 'pointer', fontSize: '14px' },
  main: { flex: 1 },
  topBar: { marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  pageTitle: { margin: 0, color: '#fff' },
  msgSuccess: { background: '#00ff8820', border: '1px solid #00ff88', color: '#00ff88', padding: '10px 20px', borderRadius: '10px', marginBottom: '16px' },
  msgError: { background: '#ff444420', border: '1px solid #ff4444', color: '#ff4444', padding: '10px 20px', borderRadius: '10px', marginBottom: '16px' },
  statsBar: { display: 'grid', marginBottom: '20px' },
  statItem: { background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px 18px', border: '1px solid rgba(255,255,255,0.08)' },
  statLabel: { display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px' },
  statVal: { display: 'block', color: '#00d4ff', fontWeight: 'bold', fontSize: '18px' },
  grid: { display: 'grid' },
  card: { background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  coinImg: { width: '38px', height: '38px', borderRadius: '50%' },
  coinImgSm: { width: '28px', height: '28px', borderRadius: '50%' },
  coinName: { fontWeight: 'bold' },
  coinSymbol: { color: '#aaa', fontSize: '11px' },
  coinPrice: { color: '#00d4ff', fontWeight: 'bold', margin: '6px 0' },
  up: { color: '#00ff88', fontSize: '12px', marginBottom: '8px' },
  down: { color: '#ff4444', fontSize: '12px', marginBottom: '8px' },
  buyBtn: { width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #00ff88, #00cc66)', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  loading: { textAlign: 'center', color: '#00d4ff', marginTop: '50px', fontSize: '18px' },
  holdingsList: { display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' },
  holdingCard: { background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex' },
  holdingLeft: {},
  holdingRight: {},
  holdingName: { fontWeight: 'bold', fontSize: '16px', color: '#00d4ff', marginBottom: '4px' },
  holdingDetail: { color: '#aaa', fontSize: '13px', margin: '2px 0' },
  holdingValue: { color: '#00ff88', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' },
  badge: { background: 'rgba(0,212,255,0.2)', color: '#00d4ff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', marginBottom: '8px', display: 'inline-block' },
  sellBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ff4444, #cc0000)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  miniStat: { background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.06)' },
  miniLabel: { display: 'block', color: '#666', fontSize: '11px', marginBottom: '3px' },
  miniVal: { display: 'block', color: '#fff', fontWeight: 'bold', fontSize: '13px' },
  emptyState: { textAlign: 'center', color: '#aaa', marginTop: '80px' },
  emptyIcon: { fontSize: '60px', marginBottom: '20px' },
  txCard: { background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex' },
  txLeft: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  txBuy: { background: '#00ff8820', color: '#00ff88', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap' },
  txSell: { background: '#ff444420', color: '#ff4444', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap' },
  txName: { fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' },
  txBadge: { background: 'rgba(0,212,255,0.2)', color: '#00d4ff', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', marginLeft: '6px' },
  txDetail: { color: '#aaa', fontSize: '12px', margin: '2px 0' },
  txDate: { color: '#555', fontSize: '11px' },
  txAmount: { color: '#00d4ff', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' },
};

export default Dashboard;