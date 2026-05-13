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
  const [hoveredCard, setHoveredCard] = useState(null);

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
    const price = parseFloat(holding.current_price || holding.avg_buy_price);
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

  const GlassCard = ({ children, style = {}, hover = false, id }) => (
    <div
      onMouseEnter={() => hover && setHoveredCard(id)}
      onMouseLeave={() => hover && setHoveredCard(null)}
      style={{
        background: hoveredCard === id
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: hoveredCard === id
          ? '1px solid rgba(0,212,255,0.3)'
          : '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.2s ease',
        transform: hoveredCard === id ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hoveredCard === id
          ? '0 8px 32px rgba(0,212,255,0.1)'
          : '0 2px 8px rgba(0,0,0,0.2)',
        ...style,
      }}
    >
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 50%, #050510 100%)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Ambient background blobs */}
      {!isMobile && (
        <>
          <div style={{ position: 'fixed', top: '10%', left: '15%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        </>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(5,5,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #00d4ff, #0099cc)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📈</div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px', letterSpacing: '-0.5px' }}>BYK <span style={{ color: '#00d4ff' }}>Market</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#00ff88', fontWeight: '700', fontSize: '13px' }}>₹{balance.toLocaleString('en-IN')}</span>
            <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '16px', cursor: 'pointer', borderRadius: '8px', padding: '5px 10px' }} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 999, background: 'rgba(5,5,16,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <button key={item.id}
              style={{ padding: '13px 16px', borderRadius: '12px', border: 'none', background: activeTab === item.id ? 'rgba(0,212,255,0.12)' : 'transparent', color: activeTab === item.id ? '#00d4ff' : '#888', cursor: 'pointer', fontSize: '15px', textAlign: 'left', fontWeight: activeTab === item.id ? '600' : '400', borderLeft: activeTab === item.id ? '3px solid #00d4ff' : '3px solid transparent' }}
              onClick={() => handleNav(item.id)}>
              {item.icon} {item.label}
            </button>
          ))}
          <button style={{ padding: '13px 16px', borderRadius: '12px', border: 'none', background: 'rgba(255,68,68,0.08)', color: '#ff4444', cursor: 'pointer', fontSize: '15px', textAlign: 'left', marginTop: '4px' }} onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={{ width: '240px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh', zIndex: 10 }}>
          {/* Logo */}
          <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📈</div>
              <div>
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>BYK <span style={{ color: '#00d4ff' }}>Market</span></div>
                <div style={{ color: '#555', fontSize: '10px', letterSpacing: '1px' }}>AI TRADING</div>
              </div>
            </div>
            {/* User Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,102,255,0.05))', borderRadius: '12px', padding: '12px', border: '1px solid rgba(0,212,255,0.12)' }}>
              <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>👤 {user.name}</div>
              <div style={{ color: '#00ff88', fontWeight: '700', fontSize: '18px' }}>₹{balance.toLocaleString('en-IN')}</div>
              <div style={{ color: '#555', fontSize: '10px', marginTop: '2px' }}>Virtual Balance</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
            {navItems.map(item => (
              <button key={item.id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: 'none', background: activeTab === item.id ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,255,0.08))' : 'transparent', color: activeTab === item.id ? '#00d4ff' : '#666', cursor: 'pointer', fontSize: '14px', textAlign: 'left', fontWeight: activeTab === item.id ? '600' : '400', borderLeft: activeTab === item.id ? '3px solid #00d4ff' : '3px solid transparent', transition: 'all 0.2s ease' }}
                onClick={() => handleNav(item.id)}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
                {activeTab === item.id && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#00d4ff' }} />}
              </button>
            ))}
          </nav>

          <button style={{ margin: '12px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.06)', color: '#ff4444', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }} onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ marginLeft: isMobile ? 0 : '240px', padding: isMobile ? '70px 14px 90px' : '28px 32px', flex: 1, position: 'relative', zIndex: 1 }}>

        {/* Page Title */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              {activeTab === 'crypto' && <><span style={{ color: '#00d4ff' }}>Crypto</span> Market</>}
              {activeTab === 'stocks' && <><span style={{ color: '#00d4ff' }}>Stock</span> Market</>}
              {activeTab === 'signals' && <><span style={{ color: '#00d4ff' }}>AI</span> Signals</>}
              {activeTab === 'portfolio' && <>My <span style={{ color: '#00d4ff' }}>Portfolio</span></>}
              {activeTab === 'transactions' && <>Transaction <span style={{ color: '#00d4ff' }}>History</span></>}
            </h2>
            <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Toast Message */}
        {message && (
          <div style={{ background: messageType === 'success' ? 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,200,100,0.08))' : 'linear-gradient(135deg, rgba(255,68,68,0.15), rgba(200,0,0,0.08))', border: `1px solid ${messageType === 'success' ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`, color: messageType === 'success' ? '#00ff88' : '#ff4444', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '500', backdropFilter: 'blur(10px)' }}>
            {message}
          </div>
        )}

        {/* Stats Bar */}
        {portfolio && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Balance', value: `₹${balance.toLocaleString('en-IN')}`, color: '#00d4ff', icon: '💰' },
              { label: 'Invested', value: `₹${totalInvested.toLocaleString('en-IN')}`, color: '#fff', icon: '📈' },
              { label: 'Current Value', value: `₹${totalCurrentValue.toLocaleString('en-IN')}`, color: '#fff', icon: '💼' },
              { label: 'Total P&L', value: `${totalPnL >= 0 ? '▲' : '▼'} ₹${Math.abs(totalPnL).toLocaleString('en-IN')}`, sub: `${totalPnLPercent}%`, color: totalPnL >= 0 ? '#00ff88' : '#ff4444', icon: '📊' },
            ].map((stat, i) => (
              <GlassCard key={i} style={{ padding: '16px 18px' }}>
                <div style={{ color: '#555', fontSize: '11px', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{stat.icon} {stat.label}</div>
                <div style={{ color: stat.color, fontWeight: '700', fontSize: isMobile ? '14px' : '16px', lineHeight: 1.2 }}>{stat.value}</div>
                {stat.sub && <div style={{ color: stat.color, fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{stat.sub}</div>}
              </GlassCard>
            ))}
          </div>
        )}

        {/* Crypto Tab */}
        {activeTab === 'crypto' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
            {prices.map((coin, i) => (
              <GlassCard key={coin.id} id={`crypto-${coin.id}`} hover style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <img src={coin.image} alt={coin.name} style={{ width: isMobile ? '30px' : '36px', height: isMobile ? '30px' : '36px', borderRadius: '50%' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/36'; }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: isMobile ? '12px' : '13px', color: '#fff' }}>{coin.name}</div>
                    <div style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase' }}>{coin.symbol}</div>
                  </div>
                </div>
                <div style={{ color: '#00d4ff', fontWeight: '800', fontSize: isMobile ? '14px' : '16px', marginBottom: '4px' }}>
                  ₹{coin.price_inr.toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: coin.change_24h >= 0 ? '#00ff88' : '#ff4444', fontSize: '12px', fontWeight: '600', background: coin.change_24h >= 0 ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                    {coin.change_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change_24h).toFixed(2)}%
                  </span>
                </div>
                <button
                  style={{ width: '100%', padding: '9px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.3px' }}
                  onClick={() => handleBuyCrypto(coin)}>
                  Buy Now
                </button>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Stocks Tab */}
        {activeTab === 'stocks' && (
          <div>
            {stocksLoading ? (
              <div style={{ textAlign: 'center', color: '#00d4ff', marginTop: '80px', fontSize: '16px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📡</div>
                Loading stocks...
              </div>
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
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '20px' : '24px' }}>{stock.flag}</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: isMobile ? '11px' : '12px', color: '#fff' }}>{stock.name}</div>
                        <div style={{ color: '#555', fontSize: '10px' }}>{stock.symbol}</div>
                      </div>
                    </div>
                    {stock.price ? (
                      <>
                        <div style={{ color: '#00d4ff', fontWeight: '800', fontSize: isMobile ? '14px' : '16px', marginBottom: '4px' }}>₹{stock.price.toLocaleString('en-IN')}</div>
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ color: parseFloat(stock.change) >= 0 ? '#00ff88' : '#ff4444', fontSize: '12px', fontWeight: '600', background: parseFloat(stock.change) >= 0 ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                            {parseFloat(stock.change) >= 0 ? '▲' : '▼'} ₹{Math.abs(stock.change).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : <div style={{ color: '#555', fontSize: '12px', marginBottom: '12px' }}>Loading...</div>}
                    <button style={{ width: '100%', padding: '9px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }} onClick={() => handleBuyStock(stock)}>Buy Now</button>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === 'signals' && (
          <div>
            {signalsLoading ? (
              <div style={{ textAlign: 'center', color: '#00d4ff', marginTop: '80px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
                AI analyzing markets...
              </div>
            ) : signals.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <div style={{ fontSize: '50px', marginBottom: '16px' }}>🤖</div>
                <p style={{ color: '#555', marginBottom: '20px' }}>AI market analysis ready</p>
                <button style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }} onClick={fetchSignals}>Generate AI Signals</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'BUY', count: signals.filter(s => s.signal === 'BUY').length, color: '#00ff88', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.2)' },
                    { label: 'HOLD', count: signals.filter(s => s.signal === 'HOLD').length, color: '#ffcc00', bg: 'rgba(255,204,0,0.08)', border: 'rgba(255,204,0,0.2)' },
                    { label: 'SELL', count: signals.filter(s => s.signal === 'SELL').length, color: '#ff4444', bg: 'rgba(255,68,68,0.08)', border: 'rgba(255,68,68,0.2)' },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ color: s.color, fontSize: '28px', fontWeight: '800' }}>{s.count}</div>
                      <div style={{ color: s.color, fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {signals.map(item => (
                    <GlassCard key={item.id} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                          <div>
                            <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{item.name}</div>
                            <div style={{ color: '#555', fontSize: '11px' }}>{item.symbol}</div>
                            <div style={{ color: item.change >= 0 ? '#00ff88' : '#ff4444', fontSize: '12px', marginTop: '2px', fontWeight: '600' }}>
                              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-block', background: item.signal === 'BUY' ? 'rgba(0,255,136,0.12)' : item.signal === 'SELL' ? 'rgba(255,68,68,0.12)' : 'rgba(255,204,0,0.12)', color: item.color, border: `1px solid ${item.color}40`, borderRadius: '10px', padding: '6px 18px', fontWeight: '800', fontSize: '15px', marginBottom: '4px' }}>
                            {item.signal}
                          </div>
                          <div style={{ color: '#666', fontSize: '11px' }}>{item.reason}</div>
                          <div style={{ color: '#00d4ff', fontWeight: '700', fontSize: '13px', marginTop: '2px' }}>₹{item.price.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.06)', color: '#00d4ff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }} onClick={fetchSignals}>🔄 Refresh Signals</button>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && portfolio && (
          <div>
            {portfolio.holdings.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#555', marginTop: '80px' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
                <p>No holdings yet — buy Crypto or Stocks!</p>
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
                          <div style={{ fontWeight: '800', fontSize: '18px', color: '#fff', marginBottom: '4px' }}>{holding.asset_name}</div>
                          <span style={{ background: holding.asset_type === 'crypto' ? 'rgba(0,212,255,0.12)' : 'rgba(255,204,0,0.12)', color: holding.asset_type === 'crypto' ? '#00d4ff' : '#ffcc00', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{holding.asset_type}</span>
                        </div>
                        <div style={{ background: isProfit ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${isProfit ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`, borderRadius: '12px', padding: '8px 16px', textAlign: 'right' }}>
                          <div style={{ color: isProfit ? '#00ff88' : '#ff4444', fontWeight: '800', fontSize: '16px' }}>
                            {isProfit ? '+' : ''}₹{pnl.toLocaleString('en-IN')}
                          </div>
                          <div style={{ color: isProfit ? '#00ff88' : '#ff4444', fontSize: '12px', opacity: 0.8 }}>
                            {isProfit ? '+' : ''}{pnlPercent}%
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        {[
                          { label: 'Quantity', value: holding.quantity },
                          { label: 'Avg Buy Price', value: `₹${parseFloat(holding.avg_buy_price).toLocaleString('en-IN')}` },
                          { label: 'Current Price', value: `₹${currentPrice.toLocaleString('en-IN')}`, highlight: true },
                          { label: 'Current Value', value: `₹${currentValue.toLocaleString('en-IN')}`, highlight: true },
                        ].map((item, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ color: item.highlight ? '#00d4ff' : '#fff', fontWeight: '700', fontSize: '13px' }}>{item.value}</div>
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

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '80px' }}>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#555', marginTop: '80px' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
                <p>No transactions yet!</p>
              </div>
            ) : transactions.map(tx => (
              <GlassCard key={tx.id} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: tx.type === 'BUY' ? 'rgba(0,255,136,0.12)' : 'rgba(255,68,68,0.12)', color: tx.type === 'BUY' ? '#00ff88' : '#ff4444', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', border: `1px solid ${tx.type === 'BUY' ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.2)'}` }}>{tx.type}</div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>{tx.asset_name} <span style={{ background: 'rgba(0,212,255,0.12)', color: '#00d4ff', padding: '1px 6px', borderRadius: '6px', fontSize: '10px', marginLeft: '4px' }}>{tx.asset_type}</span></div>
                      <div style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>Qty: {tx.quantity} @ ₹{parseFloat(tx.price).toLocaleString('en-IN')}</div>
                      <div style={{ color: '#444', fontSize: '11px' }}>{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div style={{ color: '#00d4ff', fontWeight: '800', fontSize: '15px', whiteSpace: 'nowrap' }}>₹{parseFloat(tx.total).toLocaleString('en-IN')}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(5,5,16,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 4px' }}>
          {navItems.map(item => (
            <button key={item.id}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent', border: 'none', color: activeTab === item.id ? '#00d4ff' : '#444', cursor: 'pointer', padding: '4px 0' }}
              onClick={() => handleNav(item.id)}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '9px', marginTop: '3px', fontWeight: activeTab === item.id ? '700' : '400' }}>{item.label}</span>
              {activeTab === item.id && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00d4ff', marginTop: '3px' }} />}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

export default Dashboard;