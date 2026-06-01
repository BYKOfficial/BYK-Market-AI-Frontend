import React, { useState, useEffect, useCallback } from 'react';

const INR_RATE = 85; // Fixed USD to INR rate

const COINS = [
  // Proof of Work - Next Bitcoin candidates
  { id: 'KAS',   name: 'Kaspa',         symbol: 'KAS',    binance: 'KASUSDT',  color: '#70C7BA', reason: 'Fastest PoW, BlockDAG architecture' },
  { id: 'ERG',   name: 'Ergo',          symbol: 'ERG',    binance: 'ERGUSDT',  color: '#FF5722', reason: 'eUTXO model, smart contracts on PoW' },
  { id: 'RVN',   name: 'Ravencoin',     symbol: 'RVN',    binance: 'RVNUSDT',  color: '#384182', reason: 'Asset transfer focus, ASIC resistant' },
  { id: 'ALPH',  name: 'Alephium',      symbol: 'ALPH',   binance: null,       color: '#FFCC00', reason: 'Sharded PoW, stateful UTXO' },
  { id: 'XMR',   name: 'Monero',        symbol: 'XMR',    binance: null,       color: '#FF6600', reason: 'Privacy king, CPU mineable' },
  { id: 'LTC',   name: 'Litecoin',      symbol: 'LTC',    binance: 'LTCUSDT',  color: '#A0A0A0', reason: 'Silver to Bitcoin\'s gold' },
  { id: 'DGB',   name: 'DigiByte',      symbol: 'DGB',    binance: 'DGBUSDT',  color: '#0066CC', reason: '5 mining algos, fastest UTXOs' },
  { id: 'FLUX',  name: 'Flux',          symbol: 'FLUX',   binance: 'FLUXUSDT', color: '#2B61D1', reason: 'Decentralized cloud + PoW' },
  // Layer 1 Smart Contracts
  { id: 'ETH',   name: 'Ethereum',      symbol: 'ETH',    binance: 'ETHUSDT',  color: '#627EEA', reason: 'Largest smart contract platform' },
  { id: 'SOL',   name: 'Solana',        symbol: 'SOL',    binance: 'SOLUSDT',  color: '#9945FF', reason: 'Ultra-fast PoH consensus' },
  { id: 'ADA',   name: 'Cardano',       symbol: 'ADA',    binance: 'ADAUSDT',  color: '#3CC8C8', reason: 'Peer-reviewed research driven' },
  { id: 'AVAX',  name: 'Avalanche',     symbol: 'AVAX',   binance: 'AVAXUSDT', color: '#E84142', reason: 'Sub-second finality, subnets' },
  { id: 'DOT',   name: 'Polkadot',      symbol: 'DOT',    binance: 'DOTUSDT',  color: '#E6007A', reason: 'Parachain interoperability' },
  { id: 'LINK',  name: 'Chainlink',     symbol: 'LINK',   binance: 'LINKUSDT', color: '#2A5ADA', reason: 'Oracle network backbone' },
  { id: 'ALGO',  name: 'Algorand',      symbol: 'ALGO',   binance: 'ALGOUSDT', color: '#00D4FF', reason: 'Pure PoS, carbon negative' },
  // DeFi / Other
  { id: 'XRP',   name: 'Ripple',        symbol: 'XRP',    binance: 'XRPUSDT',  color: '#0085C0', reason: 'Cross-border payments focus' },
  { id: 'RUNE',  name: 'THORChain',     symbol: 'RUNE',   binance: 'RUNEUSDT', color: '#33FF99', reason: 'Cross-chain liquidity protocol' },
  { id: 'STX',   name: 'Stacks',        symbol: 'STX',    binance: 'STXUSDT',  color: '#5546FF', reason: 'Bitcoin L2, smart contracts' },
];

const BINANCE_SYMBOLS = COINS
  .filter(c => c.binance)
  .map(c => c.binance);

export default function NextBTC({ isDark }) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selected, setSelected] = useState(null);
  const [aiVerdict, setAiVerdict] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('change'); // 'change' | 'price' | 'name'

  const fetchPrices = useCallback(async () => {
    try {
      // Binance: fetch all tickers at once — single request, very fast
      const symbolsParam = JSON.stringify(BINANCE_SYMBOLS);
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('Binance error');
      const data = await res.json();

      const map = {};
      data.forEach(item => {
        const coin = COINS.find(c => c.binance === item.symbol);
        if (coin) {
          const priceUSD = parseFloat(item.lastPrice);
          map[coin.id] = {
            priceUSD,
            priceINR: priceUSD * INR_RATE,
            change24h: parseFloat(item.priceChangePercent),
            high24h: parseFloat(item.highPrice) * INR_RATE,
            low24h: parseFloat(item.lowPrice) * INR_RATE,
            volume: parseFloat(item.quoteVolume),
          };
        }
      });

      // Coins without Binance listing — mark as N/A
      COINS.filter(c => !c.binance).forEach(c => {
        map[c.id] = { priceINR: null, priceUSD: null, change24h: null };
      });

      setPrices(map);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Price fetch error:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const getAiVerdict = async (coin) => {
    setAiLoading(true);
    setAiVerdict('');
    const p = prices[coin.id];
    const priceInfo = p?.priceINR
      ? `Current price: ₹${p.priceINR.toLocaleString('en-IN', { maximumFractionDigits: 4 })}, 24h change: ${p.change24h?.toFixed(2)}%`
      : 'Price data unavailable';

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyze ${coin.name} (${coin.symbol}) as a potential "Next Bitcoin" candidate.
${priceInfo}
Why considered: ${coin.reason}

Give a sharp 4-point analysis:
1. 🔑 Key Strength (1 sentence)
2. ⚠️ Biggest Risk (1 sentence)
3. 📊 Market Outlook short-term (1 sentence)
4. 🎯 Verdict: Strong/Moderate/Weak candidate — why (1 sentence)

Be direct, no fluff.`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === 'text')?.text || 'Analysis unavailable.';
      setAiVerdict(text);
    } catch {
      setAiVerdict('AI analysis unavailable at this moment.');
    }
    setAiLoading(false);
  };

  const bg = isDark ? '#0f0f0f' : '#f5f5f5';
  const card = isDark ? '#1a1a1a' : '#ffffff';
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const text = isDark ? '#f0f0f0' : '#111111';
  const muted = isDark ? '#888' : '#666';

  const filteredCoins = COINS
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 c.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'change') {
        const ca = prices[a.id]?.change24h ?? -999;
        const cb = prices[b.id]?.change24h ?? -999;
        return cb - ca;
      }
      if (sortBy === 'price') {
        const pa = prices[a.id]?.priceINR ?? 0;
        const pb = prices[b.id]?.priceINR ?? 0;
        return pb - pa;
      }
      return a.name.localeCompare(b.name);
    });

  const fmt = (n) => {
    if (n === null || n === undefined) return 'N/A';
    if (n >= 1) return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    if (n >= 0.01) return '₹' + n.toFixed(4);
    return '₹' + n.toFixed(6);
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '16px', color: text, fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🔮 Next Bitcoin Tracker</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: muted }}>
            Live prices via Binance · INR rate ₹{INR_RATE}/USD
            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString('en-IN')}`}
          </p>
        </div>
        <button
          onClick={fetchPrices}
          style={{
            background: '#f7931a', color: '#000', border: 'none', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Search + Sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Search coins..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${border}`,
            background: card, color: text, fontSize: 13, outline: 'none'
          }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: `1px solid ${border}`,
            background: card, color: text, fontSize: 13, cursor: 'pointer'
          }}
        >
          <option value="change">Sort: 24h Change</option>
          <option value="price">Sort: Price</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Coin List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: muted }}>
              ⏳ Loading live prices from Binance...
            </div>
          ) : (
            filteredCoins.map(coin => {
              const p = prices[coin.id];
              const change = p?.change24h;
              const changeColor = change === null ? muted : change >= 0 ? '#00c853' : '#ff1744';
              const isSelected = selected?.id === coin.id;

              return (
                <div
                  key={coin.id}
                  onClick={() => {
                    setSelected(isSelected ? null : coin);
                    setAiVerdict('');
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', marginBottom: 6, borderRadius: 10,
                    background: isSelected ? (isDark ? '#222' : '#eef') : card,
                    border: `1px solid ${isSelected ? coin.color : border}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: coin.color, flexShrink: 0
                    }} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{coin.symbol}</span>
                      <span style={{ color: muted, fontSize: 12, marginLeft: 6 }}>{coin.name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {p?.priceINR ? fmt(p.priceINR) : '—'}
                    </div>
                    <div style={{ fontSize: 12, color: changeColor }}>
                      {change !== null && change !== undefined
                        ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{
            width: 280, flexShrink: 0, background: card, borderRadius: 12,
            border: `1px solid ${selected.color}`, padding: 16, alignSelf: 'flex-start',
            position: 'sticky', top: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: selected.color }} />
              <span style={{ fontWeight: 700, fontSize: 16 }}>{selected.name}</span>
              <span style={{ color: muted, fontSize: 13 }}>{selected.symbol}</span>
            </div>

            {prices[selected.id]?.priceINR ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 24, fontWeight: 800, marginBottom: 4,
                  color: selected.color
                }}>
                  {fmt(prices[selected.id].priceINR)}
                </div>
                <div style={{
                  fontSize: 13,
                  color: prices[selected.id].change24h >= 0 ? '#00c853' : '#ff1744'
                }}>
                  {prices[selected.id].change24h >= 0 ? '▲' : '▼'} {Math.abs(prices[selected.id].change24h).toFixed(2)}% (24h)
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: muted, lineHeight: 1.8 }}>
                  <div>💰 USD: ${prices[selected.id].priceUSD?.toFixed(6)}</div>
                  <div>📈 24h High: {fmt(prices[selected.id].high24h)}</div>
                  <div>📉 24h Low: {fmt(prices[selected.id].low24h)}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: muted, fontSize: 13, marginBottom: 12 }}>
                Price not listed on Binance
              </div>
            )}

            <div style={{
              fontSize: 12, color: muted, padding: '8px 10px',
              background: isDark ? '#0f0f0f' : '#f8f8f8',
              borderRadius: 8, marginBottom: 12, lineHeight: 1.5
            }}>
              💡 {selected.reason}
            </div>

            <button
              onClick={() => getAiVerdict(selected)}
              disabled={aiLoading}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                background: aiLoading ? muted : selected.color,
                color: '#000', fontWeight: 700, cursor: aiLoading ? 'not-allowed' : 'pointer',
                fontSize: 13, marginBottom: aiVerdict ? 10 : 0
              }}
            >
              {aiLoading ? '🤖 Analyzing...' : '🤖 AI Verdict'}
            </button>

            {aiVerdict && (
              <div style={{
                fontSize: 12, lineHeight: 1.7, color: text,
                padding: '10px', background: isDark ? '#0f0f0f' : '#f0f0f0',
                borderRadius: 8, whiteSpace: 'pre-line'
              }}>
                {aiVerdict}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}