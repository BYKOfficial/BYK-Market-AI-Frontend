import React, { useState, useEffect, useCallback } from 'react';

// ── COINS — sorted by score DESC ─────────────────────────────────────────────
const COINS = [
  // Reference
  { id: 'bitcoin',      symbol: 'BTC',  name: 'Bitcoin',      cgId: 'bitcoin',       score: 100, category: 'reference', tags: ['PoW','store-of-value','gold-standard'], note: 'The benchmark. All NextBTC candidates measured against this.' },
  // NextBTC (score high → low)
  { id: 'litecoin',     symbol: 'LTC',  name: 'Litecoin',     cgId: 'litecoin',       score: 81,  category: 'nextbtc',   tags: ['PoW','MimbleWimble','payments','halving'], note: 'Highest NextBTC score. Longest track record, proven PoW. Halving catalyst upcoming.' },
  { id: 'kaspa',        symbol: 'KAS',  name: 'Kaspa',        cgId: 'kaspa',          score: 73,  category: 'nextbtc',   tags: ['BlockDAG','PoW','fast','GHOSTDAG'], note: 'BlockDAG innovation with real PoW. Fast finality, growing community.' },
  { id: 'ergo',         symbol: 'ERG',  name: 'Ergo',         cgId: 'ergo',           score: 68,  category: 'nextbtc',   tags: ['PoW','smart-contracts','UTXO','DeFi'], note: 'UTXO smart contracts — unique niche. Strong developer activity.' },
  { id: 'bitcoin-cash', symbol: 'BCH',  name: 'Bitcoin Cash', cgId: 'bitcoin-cash',   score: 67,  category: 'nextbtc',   tags: ['PoW','payments','BTC-fork','scalability'], note: 'BTC fork with bigger blocks. Payments focus. Established and liquid.' },
  { id: 'zcash',        symbol: 'ZEC',  name: 'Zcash',        cgId: 'zcash',          score: 65,  category: 'nextbtc',   tags: ['PoW','privacy','zk-SNARKs','halving'], note: 'Privacy pioneer using zk-SNARKs. Halving-driven supply shock.' },
  { id: 'monero',       symbol: 'XMR',  name: 'Monero',       cgId: 'monero',         score: 57,  category: 'nextbtc',   tags: ['PoW','privacy','untraceable','RandomX'], note: 'Best privacy coin. Strong cypherpunk community.' },
  { id: 'digibyte',     symbol: 'DGB',  name: 'DigiByte',     cgId: 'digibyte',       score: 55,  category: 'nextbtc',   tags: ['PoW','multi-algo','security','fast'], note: 'Multi-algo PoW = best security. Undervalued small cap.' },
  // Watchlist
  { id: 'radiant',      symbol: 'RXD',  name: 'Radiant',      cgId: 'radiant-rxd',    score: 48,  category: 'watchlist', tags: ['PoW','UTXO','smart-contracts','early'], note: 'Very early stage. UTXO smart contracts concept.' },
  // Altcoins
  { id: 'dogecoin',     symbol: 'DOGE', name: 'Dogecoin',     cgId: 'dogecoin',       score: null, category: 'altcoin',  tags: ['meme','no-cap','PoW','speculative'], note: 'No supply cap = disqualified. Meme-driven price.' },
  { id: 'ravencoin',    symbol: 'RVN',  name: 'Ravencoin',    cgId: 'ravencoin',      score: null, category: 'altcoin',  tags: ['utility','asset-transfer','PoW','niche'], note: 'Utility coin for asset transfer. Not a BTC store-of-value competitor.' },
  { id: 'alephium',     symbol: 'ALPH', name: 'Alephium',     cgId: 'alephium',       score: null, category: 'altcoin',  tags: ['BlockFlow','PoW','smart-contracts','sharding'], note: 'Sharding + PoW but smart contract focus = Ethereum competitor.' },
];

const CG_IDS = COINS.map(c => c.cgId).join(',');

const scoreColor = s => s == null ? '#6b7280' : s >= 75 ? '#10b981' : s >= 60 ? '#f59e0b' : s >= 45 ? '#f97316' : '#ef4444';
const scoreBg    = s => s == null ? '#1f2937' : s >= 75 ? '#064e3b' : s >= 60 ? '#78350f' : s >= 45 ? '#431407' : '#450a0a';

const fmt = (n) => {
  if (n == null) return '—';
  if (n < 0.0001) return '$' + n.toFixed(8);
  if (n < 0.01)   return '$' + n.toFixed(6);
  if (n < 1)      return '$' + n.toFixed(4);
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtINR = (n) => n == null ? '—' : '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

const fmtMcap = (n) => {
  if (!n) return null;
  if (n >= 1e12) return '$' + (n/1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n/1e9).toFixed(2) + 'B';
  return '$' + (n/1e6).toFixed(0) + 'M';
};

// ── AI Verdict Modal ──────────────────────────────────────────────────────────
function AiModal({ coin, priceUsd, onClose }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const catCtx = {
        reference: 'BTC is the gold standard. Explain why it remains the benchmark.',
        nextbtc:   'Analyze if this coin qualifies as "Next Bitcoin" — PoW, scarcity, store of value, adoption.',
        watchlist: 'Early-stage watchlist coin. Analyze potential and risks.',
        altcoin:   'This is categorized as ALTCOIN (NOT NextBTC). Explain clearly why it does not qualify.',
      };
      const prompt = `You are a crypto analyst. ${catCtx[coin.category]}

Coin: ${coin.name} (${coin.symbol})
Score: ${coin.score ?? 'N/A'}/100  Category: ${coin.category}
Tags: ${coin.tags.join(', ')}  Live Price: ${priceUsd ? fmt(priceUsd) : 'N/A'}

Write 3 short paragraphs:
1. What makes this coin unique (or why it fails as NextBTC)
2. Key risks and red flags
3. Verdict: Buy / Watch / Avoid — with 1-line reason

End with: "⚠️ Not financial advice. DYOR."`;
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
        });
        const d = await res.json();
        setText(d.content?.[0]?.text ?? 'No response.');
      } catch { setText('Error fetching verdict.'); }
      setLoading(false);
    };
    run();
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'1rem' }}>
      <div style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:14, maxWidth:580, width:'100%', maxHeight:'80vh', overflow:'auto', padding:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <h3 style={{ color:'#f59e0b', margin:0, fontSize:16 }}>🤖 AI Verdict — {coin.name}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:22, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>
        {loading
          ? <div style={{ color:'#94a3b8', textAlign:'center', padding:'2.5rem' }}>⚡ Analyzing {coin.name}...</div>
          : <div style={{ color:'#e2e8f0', lineHeight:1.8, whiteSpace:'pre-wrap', fontSize:14 }}>{text}</div>
        }
        <div style={{ marginTop:'1rem', background:'#1e293b', borderRadius:8, padding:'0.75rem', color:'#94a3b8', fontSize:12 }}>
          ⚠️ AI-generated. Not financial advice. Always DYOR before investing.
        </div>
      </div>
    </div>
  );
}

// ── Coin Row ──────────────────────────────────────────────────────────────────
function CoinRow({ coin, data, rank, onAI }) {
  const [open, setOpen] = useState(false);
  const usd = data?.usd;
  const inr = data?.inr;
  const chg = data?.usd_24h_change;
  const mcap = data?.usd_market_cap;

  return (
    <div style={{ background:'#0f172a', border:'1px solid #1e3a5f', borderRadius:12, overflow:'hidden', transition:'box-shadow 0.15s' }}>
      {/* Main row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', padding:'0.9rem 1.1rem', cursor:'pointer', gap:12 }}
      >
        {/* Rank */}
        <span style={{ color:'#475569', fontSize:12, minWidth:20, textAlign:'right' }}>{rank}</span>

        {/* Logo placeholder */}
        <div style={{ width:36, height:36, borderRadius:'50%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#94a3b8', flexShrink:0, fontWeight:700 }}>
          {coin.symbol.slice(0,2)}
        </div>

        {/* Name */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:15 }}>{coin.symbol}</div>
          <div style={{ color:'#64748b', fontSize:12 }}>{coin.name}</div>
        </div>

        {/* Price USD */}
        <div style={{ textAlign:'right', minWidth:100 }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:15, fontFamily:'monospace' }}>{fmt(usd)}</div>
          {chg != null && (
            <div style={{ color: chg >= 0 ? '#10b981' : '#ef4444', fontSize:12, fontWeight:600 }}>
              {chg >= 0 ? '▲' : '▼'} {Math.abs(chg).toFixed(2)}%
            </div>
          )}
        </div>

        {/* Score badge */}
        <div style={{ background:scoreBg(coin.score), color:scoreColor(coin.score), border:`1px solid ${scoreColor(coin.score)}50`, borderRadius:8, padding:'3px 10px', fontWeight:700, fontSize:13, minWidth:42, textAlign:'center', flexShrink:0 }}>
          {coin.score ?? (coin.category === 'altcoin' ? 'ALT' : 'REF')}
        </div>

        {/* Arrow */}
        <span style={{ color:'#475569', fontSize:12 }}>{open ? '▲' : '▼'}</span>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop:'1px solid #1e293b', padding:'0.9rem 1.1rem', display:'flex', flexDirection:'column', gap:8 }}>
          {/* INR price */}
          {inr != null && (
            <div style={{ color:'#94a3b8', fontSize:13 }}>₹ Price: <span style={{ color:'#f1f5f9', fontWeight:600 }}>{fmtINR(inr)}</span></div>
          )}
          {/* Market cap */}
          {mcap && (
            <div style={{ color:'#94a3b8', fontSize:13 }}>Market Cap: <span style={{ color:'#f1f5f9' }}>{fmtMcap(mcap)}</span></div>
          )}
          {/* Tags */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {coin.tags.map(t => (
              <span key={t} style={{ background:'#1e293b', color:'#94a3b8', borderRadius:4, padding:'2px 7px', fontSize:11 }}>{t}</span>
            ))}
          </div>
          {/* Note */}
          <div style={{ color:'#94a3b8', fontSize:13, lineHeight:1.6 }}>{coin.note}</div>
          {/* AI button */}
          <button
            onClick={e => { e.stopPropagation(); onAI(coin); }}
            style={{ background:'linear-gradient(135deg,#1d4ed8,#7c3aed)', color:'#fff', border:'none', borderRadius:8, padding:'7px 14px', fontSize:12, cursor:'pointer', fontWeight:600, alignSelf:'flex-start' }}
          >🤖 AI Verdict</button>
        </div>
      )}
    </div>
  );
}

// ── Research Tab ──────────────────────────────────────────────────────────────
function Research() {
  const Box = ({ title, children }) => (
    <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:10, padding:'1rem 1.25rem', marginBottom:'1rem' }}>
      <h3 style={{ color:'#f59e0b', margin:'0 0 0.75rem', fontSize:15 }}>{title}</h3>
      {children}
    </div>
  );
  return (
    <div>
      <Box title="📖 NextBTC Definition">
        <p style={{ color:'#94a3b8', lineHeight:1.8, margin:0, fontSize:14 }}>
          "NextBTC" = a PoW cryptocurrency with hard supply cap, proven security, and potential to become a store-of-value akin to Bitcoin.
          Must NOT be a utility/smart-contract platform, meme coin, or inflationary asset. Scored via the 13Q framework.
        </p>
      </Box>
      <Box title="📋 13Q Scoring Framework">
        {[['Q1','PoW only (no PoS/PoA)'],['Q2','Hard supply cap'],['Q3','Decentralization'],['Q4','UTXO model'],['Q5','No pre-mine / fair launch'],
          ['Q6','Active development'],['Q7','Binance listed'],['Q8','Halving mechanism'],['Q9','Privacy features (bonus)'],['Q10','MCap > $100M'],
          ['Q11','Exchange listings count'],['Q12','Community strength'],['Q13','Unique tech differentiation'],
        ].map(([q,d]) => (
          <div key={q} style={{ display:'flex', gap:10, padding:'5px 0', borderBottom:'1px solid #1e293b', fontSize:13 }}>
            <span style={{ color:'#f59e0b', fontWeight:700, minWidth:28 }}>{q}</span>
            <span style={{ color:'#94a3b8' }}>{d}</span>
          </div>
        ))}
      </Box>
      <Box title="🚫 Auto-Reject List">
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {['ETH (PoS)','SOL (PoS)','ADA (PoS)','BNB (centralized)','DOGE (no cap)','SHIB (meme)','XRP (centralized)','TRX (centralized)'].map(c => (
            <span key={c} style={{ background:'#450a0a', color:'#fca5a5', borderRadius:6, padding:'3px 10px', fontSize:12 }}>{c}</span>
          ))}
        </div>
      </Box>
      <Box title="🏷️ Score Guide">
        {[['80–100','#10b981','Strong NextBTC candidate'],['60–79','#f59e0b','Moderate — monitor'],['40–59','#f97316','Watchlist / early stage'],['0–39','#ef4444','Avoid / does not qualify']].map(([r,c,l]) => (
          <div key={r} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6 }}>
            <span style={{ background:c+'20', color:c, borderRadius:6, padding:'2px 10px', fontWeight:700, fontSize:13 }}>{r}</span>
            <span style={{ color:'#94a3b8', fontSize:13 }}>{l}</span>
          </div>
        ))}
      </Box>
      <div style={{ background:'#1e293b', border:'1px solid #374151', borderRadius:10, padding:'1rem', color:'#94a3b8', fontSize:13, lineHeight:1.7 }}>
        ⚠️ <strong style={{ color:'#f59e0b' }}>Disclaimer:</strong> Educational purposes only. Not financial advice. Crypto carries extreme risk. Always DYOR.
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const TABS = ['NextBTC','All','Watchlist','Altcoins','Research'];

export default function NextBTC() {
  const [tab, setTab]       = useState('NextBTC');
  const [cgPrices, setCg]   = useState({});   // cgId → { usd, inr, usd_24h_change, usd_market_cap }
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);
  const [aiCoin, setAiCoin] = useState(null);

  const fetchPrices = useCallback(async () => {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${CG_IDS}&vs_currencies=usd,inr&include_24hr_change=true&include_market_cap=true`;
      const r = await fetch(url);
      const d = await r.json();
      setCg(d);
      setUpdated(new Date());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrices();
    const t = setInterval(fetchPrices, 60000); // every 60s
    return () => clearInterval(t);
  }, [fetchPrices]);

  // Build sorted list for current tab
  const coins = (() => {
    let list;
    if (tab === 'All')       list = [...COINS];
    else if (tab === 'NextBTC')   list = COINS.filter(c => c.category === 'nextbtc');
    else if (tab === 'Watchlist') list = COINS.filter(c => c.category === 'watchlist');
    else if (tab === 'Altcoins')  list = COINS.filter(c => c.category === 'altcoin');
    else return null;
    // Sort: reference first, then score DESC
    return list.sort((a,b) => {
      if (a.category === 'reference') return -1;
      if (b.category === 'reference') return 1;
      return (b.score ?? -1) - (a.score ?? -1);
    });
  })();

  const btc = cgPrices['bitcoin'];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#020617 0%,#0a0f1e 60%,#020617 100%)', fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif", color:'#e2e8f0' }}>
      {/* Disclaimer banner */}
      <div style={{ background:'#7c2d12', color:'#fed7aa', textAlign:'center', padding:'7px', fontSize:12, fontWeight:500 }}>
        ⚠️ Educational only — NOT financial advice. Crypto is high risk. DYOR.
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'1.25rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'1.25rem' }}>
          <h1 style={{ fontSize:'clamp(1.6rem,5vw,2.5rem)', fontWeight:800, margin:0, background:'linear-gradient(135deg,#f59e0b,#fbbf24,#f97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            ₿ NextBTC Tracker
          </h1>
          <p style={{ color:'#64748b', marginTop:4, fontSize:13 }}>PoW coins ranked by 13Q score — highest first</p>

          {/* Live bar */}
          <div style={{ display:'flex', justifyContent:'center', gap:'1.5rem', flexWrap:'wrap', marginTop:'0.6rem', fontSize:13 }}>
            {btc && <span style={{ color:'#f59e0b', fontWeight:600 }}>BTC {fmt(btc.usd)} <span style={{ color:'#94a3b8' }}>/ {fmtINR(btc.inr)}</span></span>}
            {updated && <span style={{ color:'#475569' }}>Updated {updated.toLocaleTimeString()}</span>}
            <button onClick={fetchPrices} style={{ background:'#1e293b', border:'1px solid #334155', color:'#94a3b8', borderRadius:6, padding:'2px 10px', fontSize:12, cursor:'pointer' }}>↻ Refresh</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:5, marginBottom:'1rem', flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, transition:'all 0.15s',
              background: tab === t ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)' : '#1e293b',
              color: tab === t ? '#fff' : '#94a3b8',
            }}>
              {t === 'NextBTC' ? '🏆 NextBTC' : t === 'Watchlist' ? '👁️ Watchlist' : t === 'Altcoins' ? '📊 Altcoins' : t === 'Research' ? '🔬 Research' : '🌐 All'}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'Research' ? <Research /> : loading ? (
          <div style={{ textAlign:'center', color:'#64748b', padding:'3rem' }}>⏳ Loading live prices...</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {coins.map((coin, i) => (
              <CoinRow
                key={coin.id}
                coin={coin}
                data={cgPrices[coin.cgId]}
                rank={i + 1}
                onAI={setAiCoin}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:'1.5rem', textAlign:'center', color:'#475569', fontSize:12, lineHeight:1.8 }}>
          <div>Prices: CoinGecko API (60s refresh) · USD + INR · 24h change · Market Cap</div>
          <div style={{ color:'#374151', marginTop:3 }}>⚠️ Not financial advice. Scores are educational estimates. DYOR.</div>
        </div>
      </div>

      {aiCoin && <AiModal coin={aiCoin} priceUsd={cgPrices[aiCoin.cgId]?.usd} onClose={() => setAiCoin(null)} />}
    </div>
  );
}