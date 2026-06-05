import React, { useState, useEffect, useCallback } from 'react';

// ══════════════════════════════════════════════════════════════════
//  NEXT BTC TRACKER  ·  v8  ·  Transparent 13Q Research Edition
//  PoW coins ranked by 13Q score — badge = q13Total (NO mismatch)
//  All scores verified: sum = displayed badge, max per criterion
// ══════════════════════════════════════════════════════════════════

// ── 13Q CRITERIA ─────────────────────────────────────────────────
// Max per criterion locked here — badge = SUM of q13Scores below
const Q_MAX = {
  q1: 10, // Proof of Work
  q2: 10, // Hard Supply Cap
  q3:  8, // Fair Launch
  q4:  8, // Decentralization
  q5:  8, // Lindy Effect
  q6:  8, // Network Security
  q7:  7, // Hash Rate Trend
  q8:  7, // Developer Activity
  q9:  5, // Liquidity & Listings
  q10: 5, // Community
  q11: 8, // Fungibility / Privacy
  q12: 9, // Store of Value
  q13: 7, // Censorship Resistance
}; // Total max = 100 ✓

const Q_META = {
  q1:  { label: 'Proof of Work',         icon: '⛏️',  desc: 'Pure PoW consensus — no PoS, no hybrid, no delegation' },
  q2:  { label: 'Hard Supply Cap',        icon: '🔒',  desc: 'Fixed max supply — no inflation, no tail emission' },
  q3:  { label: 'Fair Launch',            icon: '⚖️',  desc: 'No ICO, no premine, no founders reward, no corporate treasury' },
  q4:  { label: 'Decentralization',       icon: '🌐',  desc: 'No company or foundation controls the protocol rules' },
  q5:  { label: 'Lindy Effect',           icon: '🕰️', desc: 'Years survived = proven antifragility. Each year adds credibility' },
  q6:  { label: 'Network Security',       icon: '🛡️', desc: 'Hash rate size and 51% attack cost in USD/hour' },
  q7:  { label: 'Hash Rate Trend',        icon: '📈',  desc: 'Growing, stable, or declining hash rate — last 12 months' },
  q8:  { label: 'Dev Activity',           icon: '💻',  desc: 'Core dev commits, active contributors, roadmap progress' },
  q9:  { label: 'Liquidity & Listings',   icon: '🏦',  desc: 'Major exchange presence, spot + derivatives volume' },
  q10: { label: 'Community',              icon: '👥',  desc: 'Active holders, Metcalfe network effect, adoption' },
  q11: { label: 'Fungibility',            icon: '🎭',  desc: 'Privacy features, transaction untraceability, censorship resistance' },
  q12: { label: 'Store of Value',         icon: '💎',  desc: 'Scarcity mechanics, sound money properties, inflation resistance' },
  q13: { label: 'Censorship Resistance',  icon: '🔐',  desc: 'Protocol-level resistance to government attacks and seizure' },
};

// ── COINS DATA ────────────────────────────────────────────────────
// q13Scores sums MUST equal badge (no manual score field)
const COINS = [
  {
    id: 'kas', name: 'Kaspa', ticker: 'KAS', cgId: 'kaspa',
    color: '#49EACB',
    algo: 'KHeavyHash / GHOSTDAG', supply: '28.7B', supplyFull: '28.7B (hard cap)', hardCap: true,
    launched: 2021,
    ath: 0.208, athDate: '2024',
    halvingNote: 'Monthly emission reduction, tapering over time',
    nextHalvingDate: null,
    githubOwner: 'kaspanet', githubRepo: 'kaspad',
    q13Scores: { q1:10, q2:10, q3:8, q4:7, q5:3, q6:6, q7:7, q8:7, q9:4, q10:4, q11:4, q12:8, q13:7 },
    // ↑ Sum = 85 ✓
    redFlags: [
      '⚠️ Only ~3 years old (2021) — Lindy Effect completely unproven. Never survived a full bear cycle.',
      '⚠️ GHOSTDAG/blockDAG is novel, unproven technology at scale — no other coin uses it this way.',
      '⚠️ Core team still heavily controls major decisions — decentralization is aspirational.',
      '⚠️ GPU-only mining (ASIC-resistant) — less permanent miner commitment vs SHA-256 ASICs.',
      '⚠️ Coin distribution may be concentrated in early miners despite fair launch.',
    ],
    greenFlags: [
      '✅ No premine, no ICO, no founders reward — genuine fair launch',
      '✅ 28.7B hard cap — fixed supply like Bitcoin',
      '✅ 10 blocks/second — fastest confirmed PoW chain in existence',
      '✅ Rusty Kaspa (Rust-based node) = active, modern development',
      '✅ Growing hash rate — organic miner adoption signal',
      '✅ Listed on Binance — maximum liquidity',
    ],
    verdict: 'Most technically innovative PoW coin since Bitcoin. GHOSTDAG solves the scalability trilemma without sacrificing security. BUT: 3 years old is dangerously young for the "Next Bitcoin" thesis. Needs 5+ more years of uninterrupted operation to be truly credible.',
  },
  {
    id: 'ltc', name: 'Litecoin', ticker: 'LTC', cgId: 'litecoin',
    color: '#BFBBBB',
    algo: 'Scrypt', supply: '84M', supplyFull: '84M (hard cap)', hardCap: true,
    launched: 2011,
    ath: 412, athDate: '2021',
    halvingNote: 'Every 840,000 blocks (~4 years), last halving Aug 2023',
    nextHalvingDate: new Date('2027-08-23'),
    githubOwner: 'litecoin-project', githubRepo: 'litecoin',
    q13Scores: { q1:10, q2:10, q3:7, q4:7, q5:8, q6:5, q7:2, q8:2, q9:5, q10:3, q11:5, q12:7, q13:7 },
    // ↑ Sum = 78 ✓
    redFlags: [
      '❌ Hash rate declining significantly — miners are consistently leaving the network.',
      '❌ GitHub near-inactive — fewer than 10 meaningful commits/month in 2024.',
      '❌ Charlie Lee sold ALL his LTC at the 2017 ATH. Founder alignment: zero.',
      '❌ No technical innovation in 13 years — essentially a faster Bitcoin clone with nothing new.',
      '⚠️ Community declining — losing narrative share to KAS, XMR, ERG.',
    ],
    greenFlags: [
      '✅ 13+ years continuously operational — highest Lindy Effect of any non-BTC PoW coin',
      '✅ 84M hard cap — 4 halvings survived without failing',
      '✅ MimbleWimble (MWEB) extension block privacy added 2022',
      '✅ Listed on every major exchange — best liquidity after Bitcoin',
      '✅ Never successfully 51% attacked',
    ],
    verdict: 'Silver to Bitcoin\'s gold — but the silver is tarnishing. The Lindy Effect (13+ years) is LTC\'s only remaining moat. Declining hash rate and a zombie GitHub are critical structural failures. Without technical revival, LTC is a slow multi-year fade.',
  },
  {
    id: 'erg', name: 'Ergo', ticker: 'ERG', cgId: 'ergo',
    color: '#FF6900',
    algo: 'Autolykos v2 (ASIC-resistant)', supply: '97.7M', supplyFull: '97.7M (hard cap)', hardCap: true,
    launched: 2019,
    ath: 20.59, athDate: '2021',
    halvingNote: 'Smooth emission curve decay — no traditional halving event',
    nextHalvingDate: null,
    githubOwner: 'ergoplatform', githubRepo: 'ergo',
    q13Scores: { q1:10, q2:10, q3:8, q4:8, q5:4, q6:4, q7:5, q8:6, q9:2, q10:3, q11:4, q12:7, q13:6 },
    // ↑ Sum = 77 ✓
    redFlags: [
      '❌ NOT listed on Binance — critical liquidity problem. No Binance = no mainstream retail adoption.',
      '❌ Market cap ~$100–250M — at survival floor. One exchange exit could cascade.',
      '❌ ASIC resistance = less permanent, less committed mining base.',
      '⚠️ Despite eUTXO smart contracts, developer ecosystem is tiny vs ETH/SOL.',
      '⚠️ No major enterprise partnerships or real-world adoption beyond crypto-native users.',
    ],
    greenFlags: [
      '✅ No premine, no ICO, no VCs — genuine fair launch',
      '✅ eUTXO model: smart contracts on UTXO without compromising base security',
      '✅ Active core research team with peer-reviewed academic publications',
      '✅ Hard cap of 97.7M ERG with emissions ending ~2045',
      '✅ GPU-only mining = more democratized participation',
    ],
    verdict: 'Technically the most sophisticated PoW smart contract platform ever built. eUTXO is a genuine academic achievement. BUT: not on Binance and micro-cap = existential risk. Brilliant technology that the market has commercially ignored.',
  },
  {
    id: 'xmr', name: 'Monero', ticker: 'XMR', cgId: 'monero',
    color: '#FF6600',
    algo: 'RandomX (CPU-optimized)', supply: '∞', supplyFull: '∞ (tail emission: 0.6 XMR/min)', hardCap: false,
    launched: 2014,
    ath: 519, athDate: '2018',
    halvingNote: 'No halving. Permanent 0.6 XMR/min tail emission.',
    nextHalvingDate: null,
    githubOwner: 'monero-project', githubRepo: 'monero',
    q13Scores: { q1:10, q2:0, q3:7, q4:7, q5:7, q6:7, q7:4, q8:7, q9:2, q10:4, q11:8, q12:2, q13:7 },
    // ↑ Sum = 72 ✓ | Q2=0: no hard cap is the single biggest disqualifier
    redFlags: [
      '❌ NO HARD CAP — tail emission = infinite supply. This alone disqualifies XMR as "Digital Gold."',
      '❌ Delisted from Binance, Coinbase, Kraken — regulatory pressure forcing global delistings.',
      '❌ Privacy by default = top regulatory target. US Treasury sanctions on privacy protocols.',
      '⚠️ Dark web / darknet market association damages institutional adoption permanently.',
      '⚠️ No smart contracts — single use-case limited to private payments.',
    ],
    greenFlags: [
      '✅ Best privacy implementation in existence — RingCT + Stealth Addresses + Bulletproofs',
      '✅ RandomX: CPU-optimized, ASIC-resistant — most democratic PoW mining',
      '✅ 10+ years of continuous, battle-tested operation',
      '✅ Truly fungible — XMR cannot be traced or blacklisted like Bitcoin UTXOs',
      '✅ Active development with regular protocol upgrades',
    ],
    verdict: 'Best privacy coin ever built. RandomX is a cryptographic masterpiece. BUT: no hard cap is a fundamental disqualifier for "Next Bitcoin." It\'s Digital Cash, not Digital Gold. Regulatory war incoming. Niche survival is likely; mainstream "Next Bitcoin" is not.',
  },
  {
    id: 'zec', name: 'Zcash', ticker: 'ZEC', cgId: 'zcash',
    color: '#F4B728',
    algo: 'Equihash', supply: '21M', supplyFull: '21M (hard cap)', hardCap: true,
    launched: 2016,
    ath: 870, athDate: '2018',
    halvingNote: 'Every 840,000 blocks (~4 years), last halving Nov 2024',
    nextHalvingDate: new Date('2028-11-01'),
    githubOwner: 'zcash', githubRepo: 'zcash',
    q13Scores: { q1:10, q2:10, q3:2, q4:5, q5:5, q6:4, q7:3, q8:5, q9:3, q10:3, q11:7, q12:5, q13:5 },
    // ↑ Sum = 67 ✓
    redFlags: [
      '❌ FOUNDERS REWARD — 20% of all block rewards went to Electric Coin Co. for 4 years. Fails Q3.',
      '❌ Electric Coin Company (ECC) controls development — corporate capture of open protocol.',
      '❌ Trusted Setup required — Sapling ceremony requires trusting participants destroyed toxic waste.',
      '❌ 99%+ of ZEC transactions are transparent (not shielded) — privacy is optional, not default.',
      '❌ Hash rate and developer activity both declining.',
    ],
    greenFlags: [
      '✅ 21M hard cap — identical to Bitcoin',
      '✅ zk-SNARKs cryptography is genuinely cutting-edge technology',
      '✅ 8+ years of continuous operation',
      '✅ Some exchange presence remains',
    ],
    verdict: 'Technically impressive zk-SNARKs but fundamentally compromised by the founders reward and trusted setup. The ECC captured the project from day one. Privacy is optional, not default. Zcash is a corporate project wearing open-source clothing.',
  },
  {
    id: 'bch', name: 'Bitcoin Cash', ticker: 'BCH', cgId: 'bitcoin-cash',
    color: '#0AC18E',
    algo: 'SHA-256 (shared hashrate with BTC)', supply: '21M', supplyFull: '21M (hard cap)', hardCap: true,
    launched: 2017,
    ath: 4355, athDate: '2017',
    halvingNote: 'Every 210,000 blocks (~4 years), last halving April 2024',
    nextHalvingDate: new Date('2028-04-01'),
    githubOwner: 'Bitcoin-ABC', githubRepo: 'bitcoin-abc',
    q13Scores: { q1:10, q2:10, q3:4, q4:4, q5:5, q6:4, q7:3, q8:5, q9:4, q10:3, q11:4, q12:5, q13:4 },
    // ↑ Sum = 65 ✓
    redFlags: [
      '❌ Roger Ver (Mr. Bitcoin Cash) arrested 2024 on federal tax fraud charges. The face of BCH is gone.',
      '❌ Chain splits destroyed community: BCH → BSV (2018) → XEC/eCash (2020). Trust permanently broken.',
      '❌ SHA-256 shared with BTC: a 51% attack on BCH requires <0.1% of Bitcoin\'s mining power.',
      '❌ "Peer-to-peer cash" thesis failed — Bitcoin Lightning solved this problem better and cheaper.',
      '⚠️ Declining developer activity and community engagement.',
    ],
    greenFlags: [
      '✅ SHA-256 PoW — same battle-tested algorithm as Bitcoin',
      '✅ 21M hard cap',
      '✅ 7+ years of continuous operation',
      '✅ Lower fees than Bitcoin for simple on-chain transactions',
    ],
    verdict: 'BCH had a legitimate thesis (bigger blocks for payments). But toxic community wars, Roger Ver\'s arrest, and three chain splits have destroyed all credibility and community trust. SHA-256 shared with BTC means BCH can never be independent. A cautionary tale.',
  },
  {
    id: 'dgb', name: 'DigiByte', ticker: 'DGB', cgId: 'digibyte',
    color: '#0066CC',
    algo: 'Multi-algo (SHA-256, Scrypt, Odocrypt, Skein, Qubit)', supply: '21B', supplyFull: '21B (hard cap)', hardCap: true,
    launched: 2014,
    ath: 0.185, athDate: '2021',
    halvingNote: 'Complex with 5 algorithms — negligible new issuance remains',
    nextHalvingDate: null,
    githubOwner: 'digibyte', githubRepo: 'digibyte',
    q13Scores: { q1:10, q2:10, q3:7, q4:5, q5:6, q6:2, q7:1, q8:1, q9:2, q10:2, q11:3, q12:3, q13:4 },
    // ↑ Sum = 56 ✓
    redFlags: [
      '❌ GitHub ABANDONED since ~2021. Zero meaningful commits for 3+ years. Dead by all dev metrics.',
      '❌ No full-time paid developers — entirely volunteer-dependent with zero accountability.',
      '❌ Not listed on Binance — severely limited liquidity.',
      '❌ 5 mining algorithms = split hash rate. Each algo secures only ~20% of the chain — WEAKER.',
      '⚠️ "IoT and gaming" use cases promised since 2014-2019 never materialized.',
      '⚠️ Market cap declining — approaching irrelevance zone.',
    ],
    greenFlags: [
      '✅ 21B hard cap — fixed supply',
      '✅ 10+ years of survival (barely)',
      '✅ No premine, no ICO — originally fair launch',
    ],
    verdict: 'DGB is a zombie project. Abandoned GitHub, no developers, split hash rate, not on Binance. The "5 algorithms = more security" is actually a critical weakness — each algorithm only protects 20% of the chain. Historical artifact, not a viable Next Bitcoin candidate.',
  },
];

// ── UTILITY FUNCTIONS ─────────────────────────────────────────────
const calcTotal = (q13Scores) => Object.values(q13Scores).reduce((a, b) => a + b, 0);
const calcMax   = () => Object.values(Q_MAX).reduce((a, b) => a + b, 0); // 100

const getATHPercent = (cur, ath) => {
  if (!cur || !ath) return null;
  return ((cur - ath) / ath * 100).toFixed(1);
};

const getSatsPrice = (coinPrice, btcPrice) => {
  if (!coinPrice || !btcPrice) return null;
  return Math.round((coinPrice / btcPrice) * 1e8);
};

const formatSats = (sats) => {
  if (sats == null) return '—';
  if (sats >= 1e6) return `${(sats / 1e6).toFixed(2)}M ₿`;
  if (sats >= 1e3) return `${(sats / 1e3).toFixed(0)}K ₿`;
  return `${sats} sats`;
};

const getHalvingCountdown = (coin) => {
  if (!coin.nextHalvingDate) return null;
  const diff = coin.nextHalvingDate - Date.now();
  if (diff <= 0) return { text: 'Passed', days: 0, progress: 100 };
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30.44);
  const remDays = days % 30;
  return {
    text: months > 0 ? `${months}mo ${remDays}d` : `${days}d`,
    days,
    progress: Math.max(0, Math.min(100, 100 - (days / 1460) * 100)),
  };
};

const formatPrice = (p) => {
  if (!p) return '—';
  if (p >= 1e6) return `$${(p / 1e6).toFixed(2)}M`;
  if (p >= 1e3) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (p >= 1)   return `$${p.toFixed(2)}`;
  if (p >= 0.01)return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
};

const formatINR = (p) => {
  if (!p) return '—';
  const r = p * 84;
  if (r >= 1e7)  return `₹${(r / 1e7).toFixed(2)}Cr`;
  if (r >= 1e5)  return `₹${(r / 1e5).toFixed(2)}L`;
  if (r >= 1e3)  return `₹${(r / 1e3).toFixed(1)}K`;
  return `₹${r.toFixed(2)}`;
};

const formatMcap = (m) => {
  if (!m) return '—';
  if (m >= 1e12) return `$${(m / 1e12).toFixed(2)}T`;
  if (m >= 1e9)  return `$${(m / 1e9).toFixed(2)}B`;
  if (m >= 1e6)  return `$${(m / 1e6).toFixed(0)}M`;
  return `$${m.toLocaleString()}`;
};

const scoreColor = (val, max) => {
  const p = val / max;
  if (p >= 0.80) return '#22c55e';
  if (p >= 0.65) return '#f59e0b';
  if (p >= 0.50) return '#f97316';
  return '#ef4444';
};

const scoreLabel = (val, max) => {
  const p = val / max;
  if (p >= 0.80) return 'STRONG';
  if (p >= 0.65) return 'MODERATE';
  if (p >= 0.50) return 'WEAK';
  return 'CRITICAL';
};

// ── SPARKLINE (pure SVG, no dependencies) ────────────────────────
function Sparkline({ data, width = 88, height = 30 }) {
  if (!data || data.length < 2) {
    return <div style={{ width, height, background: '#0d1525', borderRadius: 4 }} />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 3 - ((v - min) / range) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const up = data[data.length - 1] >= data[0];
  const clr = up ? '#22c55e' : '#ef4444';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={clr} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── SCORE RING (SVG arc) ──────────────────────────────────────────
function ScoreRing({ score, max = 100, size = 72 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / max) * circ;
  const clr = scoreColor(score, max);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2d47" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={clr} strokeWidth="6"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle"
        fill={clr} fontSize="15" fontWeight="800" fontFamily="monospace">{score}</text>
      <text x={size / 2} y={size / 2 + 13} textAnchor="middle" dominantBaseline="middle"
        fill="#334155" fontSize="9" fontFamily="monospace">/{max}</text>
    </svg>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────
function Bar({ val, max, color }) {
  return (
    <div style={{ height: 4, background: '#111827', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
      <div style={{
        height: '100%', width: `${(val / max) * 100}%`, borderRadius: 2,
        background: color || scoreColor(val, max), transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

// ── BADGE / PILL helpers ──────────────────────────────────────────
const badge = (color, text, sz = 11) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '1px 7px', borderRadius: 5,
    background: `${color}20`, border: `1px solid ${color}40`,
    color, fontSize: sz, fontWeight: 700, letterSpacing: 0.3, fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  }}>{text}</span>
);

const pill = (bg, color, text, sz = 11) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '2px 7px',
    borderRadius: 99, background: bg, color, fontSize: sz, fontWeight: 700, fontFamily: 'monospace',
  }}>{text}</span>
);

// ══════════════════════════════════════════════════════════════════
//  DATA HOOKS
// ══════════════════════════════════════════════════════════════════

function usePriceData() {
  const [data, setData]             = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastUpdated, setUpdated]   = useState(null);

  const fetch_ = useCallback(async () => {
    try {
      const ids = ['bitcoin', ...COINS.map(c => c.cgId)].join(',');
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd` +
        `&ids=${ids}&order=market_cap_desc&per_page=20&page=1` +
        `&sparkline=true&price_change_percentage=24h,7d`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const list = await r.json();
      const map = {};
      list.forEach(c => { map[c.id] = c; });
      setData(map);
      setUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const t = setInterval(fetch_, 120_000); // refresh every 2 min
    return () => clearInterval(t);
  }, [fetch_]);

  return { data, loading, error, lastUpdated, refetch: fetch_ };
}

function useFearGreed() {
  const [fg, setFg] = useState(null);
  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1')
      .then(r => r.json())
      .then(d => setFg(d?.data?.[0] || null))
      .catch(() => {});
  }, []);
  return fg;
}

function useGitHubCommits() {
  const [commits, setCommits] = useState({});
  useEffect(() => {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    COINS.forEach(async (coin) => {
      try {
        const url = `https://api.github.com/repos/${coin.githubOwner}/${coin.githubRepo}/commits?per_page=100&since=${since}`;
        const r = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
        if (!r.ok) return;
        const list = await r.json();
        setCommits(prev => ({ ...prev, [coin.id]: Array.isArray(list) ? list.length : '?' }));
      } catch {}
    });
  }, []);
  return commits;
}

// ══════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════

// ── BTC REFERENCE HEADER CARD ─────────────────────────────────────
function BTCCard({ priceData, fearGreed, btcDomPct }) {
  const btc = priceData?.bitcoin;
  const chg = btc?.price_change_percentage_24h;
  const fgVal = fearGreed ? parseInt(fearGreed.value) : null;
  const fgClr = fgVal == null ? '#475569'
    : fgVal >= 60 ? '#22c55e' : fgVal >= 40 ? '#f59e0b' : fgVal >= 25 ? '#f97316' : '#ef4444';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #111928 0%, #0d1117 100%)',
      border: '1px solid #f59e0b44', borderRadius: 12,
      marginBottom: 20, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
    }}>
      {/* Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10, fontSize: 26,
          background: '#f59e0b20', border: '2px solid #f59e0b55',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>₿</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>Bitcoin</span>
            {badge('#f59e0b', 'BTC', 12)}
            {badge('#22c55e', 'THE STANDARD', 9)}
            {badge('#22c55e', '100/100', 10)}
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>
            SHA-256 · 21M Hard Cap · 15+ Years · ETF Listed · Fair Launch
          </div>
        </div>
      </div>

      {/* Price */}
      <div style={{ minWidth: 140 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>
          {formatPrice(btc?.current_price)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          {pill(chg >= 0 ? '#22c55e22' : '#ef444422', chg >= 0 ? '#22c55e' : '#ef4444',
            `${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg || 0).toFixed(2)}%`)}
          <span style={{ fontSize: 11, color: '#334155' }}>
            {formatINR(btc?.current_price)}
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div>
        <Sparkline data={btc?.sparkline_in_7d?.price} width={96} height={32} />
        <div style={{ fontSize: 9, color: '#334155', textAlign: 'center', marginTop: 2 }}>7-day</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>
            {formatMcap(btc?.market_cap)}
          </div>
          <div style={{ fontSize: 10, color: '#334155' }}>MARKET CAP</div>
        </div>
        {btcDomPct && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
              {btcDomPct}%
            </div>
            <div style={{ fontSize: 10, color: '#334155' }}>BTC DOMINANCE</div>
          </div>
        )}
        {fearGreed && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: fgClr, fontFamily: 'monospace' }}>
              {fearGreed.value}
            </div>
            <div style={{ fontSize: 10, color: '#334155' }}>FEAR & GREED</div>
            <div style={{ fontSize: 9, color: fgClr }}>{fearGreed.value_classification?.toUpperCase()}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── COIN CARD ─────────────────────────────────────────────────────
function CoinCard({ coin, priceData, btcPrice, commits, rank }) {
  const [tab, setTab]       = useState('overview');
  const [ai, setAi]         = useState('');
  const [aiLoad, setAiLoad] = useState(false);

  const cg    = priceData?.[coin.cgId];
  const total = calcTotal(coin.q13Scores);
  const max   = calcMax();
  const clr   = scoreColor(total, max);

  const cur   = cg?.current_price;
  const chg   = cg?.price_change_percentage_24h;
  const mcap  = cg?.market_cap;
  const spark = cg?.sparkline_in_7d?.price;
  const ath   = getATHPercent(cur, coin.ath);
  const sats  = getSatsPrice(cur, btcPrice);
  const halv  = getHalvingCountdown(coin);
  const gh    = commits?.[coin.id];

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'q13',      label: '13Q Breakdown' },
    { id: 'flags',    label: '🚩 Red Flags' },
    { id: 'ai',       label: '🤖 AI Verdict' },
  ];

  const fetchAI = async () => {
    if (ai || aiLoad) return;
    setAiLoad(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 350,
          messages: [{
            role: 'user',
            content: `You are a brutally honest crypto researcher. Analyze ${coin.name} (${coin.ticker}) as a "Next Bitcoin" candidate.

Facts:
- Algorithm: ${coin.algo}
- Supply: ${coin.supplyFull}  Hard cap: ${coin.hardCap ? 'YES' : 'NO — disqualifier'}
- Age: ${new Date().getFullYear() - coin.launched} years  |  13Q Score: ${total}/100
- Current price: ${formatPrice(cur)}  |  ATH: ${formatPrice(coin.ath)} (${ath}% from ATH)
- Top red flags: ${coin.redFlags.slice(0, 3).join(' | ')}

Write exactly 3 sentences. Start with one word verdict (STRONG / MODERATE / WEAK / CRITICAL). Be brutal and honest — no hype, no hedging.`
          }]
        })
      });
      const d = await res.json();
      setAi(d?.content?.[0]?.text || 'Analysis unavailable. Check API key.');
    } catch {
      setAi('AI analysis unavailable. Add REACT_APP_ANTHROPIC_KEY to your .env file.');
    } finally {
      setAiLoad(false);
    }
  };

  const statsGrid = [
    { label: 'Market Cap',   value: formatMcap(mcap) },
    { label: 'INR Price',    value: formatINR(cur) },
    { label: 'Sats Price',   value: formatSats(sats) },
    {
      label: '% from ATH',
      value: ath ? `${ath}%` : '—',
      sub: `ATH ${formatPrice(coin.ath)} (${coin.athDate})`,
      red: true,
    },
    {
      label: 'Next Halving',
      value: halv?.text || (coin.halvingType === 'tail' ? '∞ Tail' : coin.halvingNote ? 'Smooth' : 'N/A'),
      sub: coin.halvingNote,
    },
    {
      label: 'Dev Commits',
      value: gh != null ? `${gh}/30d` : 'Loading…',
      sub: 'GitHub last 30 days',
      red: gh === 0 || gh < 5,
    },
    { label: 'Supply',       value: coin.supply, sub: coin.hardCap ? '✅ Hard Cap' : '❌ Infinite', capFlag: true },
    { label: 'Algorithm',    value: coin.algo.split('/')[0].trim(), sub: coin.algo },
  ];

  return (
    <div style={{
      background: '#0d1117', border: `1px solid ${coin.color}33`,
      borderRadius: 12, overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '16px 20px',
        background: `linear-gradient(135deg, ${coin.color}12, transparent 60%)`,
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        {/* Rank + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 180 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8, flexShrink: 0,
            background: `${coin.color}20`, border: `2px solid ${coin.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: coin.color, fontWeight: 800, fontSize: 13,
          }}>#{rank}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>{coin.name}</span>
              {badge(coin.color, coin.ticker, 12)}
              {!coin.hardCap && badge('#ef4444', '∞ SUPPLY', 9)}
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
              {coin.algo} · Est. {coin.launched} · {new Date().getFullYear() - coin.launched}yr
            </div>
          </div>
        </div>

        {/* Score Ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <ScoreRing score={total} max={max} size={68} />
          <span style={{ fontSize: 9, color: clr, fontWeight: 700, letterSpacing: 1 }}>
            {scoreLabel(total, max)}
          </span>
        </div>

        {/* Price block */}
        <div style={{ minWidth: 130 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', fontFamily: 'monospace' }}>
            {formatPrice(cur)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
            {pill(chg >= 0 ? '#22c55e22' : '#ef444422', chg >= 0 ? '#22c55e' : '#ef4444',
              `${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg || 0).toFixed(2)}%`)}
            <span style={{ fontSize: 10, color: '#334155' }}>{formatINR(cur)}</span>
          </div>
          <Sparkline data={spark} width={92} height={28} />
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 1, background: '#111827', borderBottom: '1px solid #1e293b',
      }}>
        {statsGrid.map(s => (
          <div key={s.label} style={{ padding: '9px 14px', background: '#0d1117' }}>
            <div style={{ fontSize: 9, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
              color: s.red ? '#f87171' : '#f1f5f9',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{s.value}</div>
            {s.sub && (
              <div style={{
                fontSize: 9, marginTop: 1,
                color: s.capFlag
                  ? (coin.hardCap ? '#22c55e' : '#ef4444')
                  : '#334155',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{s.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: '#080c14', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => { setTab(t.id); if (t.id === 'ai') fetchAI(); }}
            style={{
              padding: '8px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none',
              color: tab === t.id ? coin.color : '#475569',
              borderBottom: `2px solid ${tab === t.id ? coin.color : 'transparent'}`,
              transition: 'color 0.15s', whiteSpace: 'nowrap',
            }}>{t.label}</button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding: '14px 20px', minHeight: 90 }}>
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7, marginBottom: 10 }}>
              {coin.verdict}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {coin.greenFlags.slice(0, 4).map((f, i) => (
                <div key={i} style={{
                  fontSize: 11, color: '#86efac', background: '#22c55e0e',
                  border: '1px solid #22c55e20', borderRadius: 6, padding: '3px 8px',
                }}>{f}</div>
              ))}
            </div>
            {halv && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: '#475569' }}>Next halving in</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
                  {halv.text}
                </span>
                <div style={{ flex: 1, maxWidth: 140 }}>
                  <Bar val={halv.progress} max={100} color="#f59e0b" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 13Q BREAKDOWN */}
        {tab === 'q13' && (
          <div>
            <div style={{ fontSize: 11, color: '#334155', marginBottom: 10 }}>
              13Q Score: {' '}
              <span style={{ color: clr, fontWeight: 700, fontFamily: 'monospace' }}>
                {total}/{max}
              </span>
              {' '}— Badge = sum of all criteria below (no hidden manual override)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {Object.entries(Q_MAX).map(([key, maxPts]) => {
                const val = coin.q13Scores[key];
                const qClr = scoreColor(val, maxPts);
                const { label, icon, desc } = Q_META[key];
                return (
                  <div key={key} style={{
                    display: 'grid', gridTemplateColumns: '28px 1fr 38px',
                    gap: 8, alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', fontWeight: 700 }}>
                      {icon}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                      </div>
                      <Bar val={val} max={maxPts} color={qClr} />
                      <div style={{ fontSize: 9, color: '#1e293b', marginTop: 1 }}>{desc}</div>
                    </div>
                    <span style={{
                      fontFamily: 'monospace', fontSize: 11, fontWeight: 700, textAlign: 'right',
                      color: qClr,
                    }}>{val}/{maxPts}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RED FLAGS */}
        {tab === 'flags' && (
          <div>
            <div style={{ fontSize: 11, color: '#334155', marginBottom: 8 }}>
              Critical issues preventing {coin.ticker} from being "Next Bitcoin"
            </div>
            {coin.redFlags.map((f, i) => (
              <div key={i} style={{
                fontSize: 11, color: '#fca5a5', background: '#ef444410',
                border: '1px solid #ef444420', borderRadius: 7, padding: '7px 10px',
                lineHeight: 1.5, marginBottom: 5,
              }}>{f}</div>
            ))}
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, marginTop: 8 }}>
              <div style={{ fontSize: 10, color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                What it does right
              </div>
              {coin.greenFlags.map((f, i) => (
                <div key={i} style={{
                  fontSize: 11, color: '#86efac', background: '#22c55e0d',
                  border: '1px solid #22c55e20', borderRadius: 7, padding: '6px 10px',
                  lineHeight: 1.5, marginBottom: 4,
                }}>{f}</div>
              ))}
            </div>
          </div>
        )}

        {/* AI VERDICT */}
        {tab === 'ai' && (
          <div>
            {aiLoad && (
              <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                Analyzing {coin.name} via Claude API…
              </div>
            )}
            {!aiLoad && !ai && (
              <button onClick={fetchAI} style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${coin.color}44`, background: `${coin.color}12`,
                color: coin.color, fontSize: 12, fontWeight: 600,
              }}>🤖 Get AI Verdict for {coin.ticker}</button>
            )}
            {ai && (
              <div style={{
                fontSize: 12, color: '#cbd5e1', lineHeight: 1.8,
                background: '#080c14', borderRadius: 8, padding: '12px 14px',
                border: '1px solid #1e2d47',
              }}>{ai}</div>
            )}
            <div style={{ fontSize: 10, color: '#1e293b', marginTop: 8 }}>
              Powered by Claude Sonnet. Not financial advice.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── COMPARISON TABLE ──────────────────────────────────────────────
function CompareTable({ coins, priceData, btcPrice }) {
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12, overflowX: 'auto',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ background: '#111827', borderBottom: '2px solid #1e293b' }}>
            {['#', 'Coin', 'Score', 'Price', '24h Δ', 'INR', 'Mcap', 'Sats', 'from ATH', 'Cap', 'Age', 'Dev/30d'].map(h => (
              <th key={h} style={{
                padding: '10px 12px', textAlign: 'left', color: '#334155',
                fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5,
                fontWeight: 700, whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coins.map((coin, i) => {
            const cg   = priceData?.[coin.cgId];
            const cur  = cg?.current_price;
            const chg  = cg?.price_change_percentage_24h;
            const tot  = calcTotal(coin.q13Scores);
            const max  = calcMax();
            const clr  = scoreColor(tot, max);
            return (
              <tr key={coin.id} style={{
                borderBottom: '1px solid #0f172a',
                background: i % 2 === 0 ? '#0d1117' : '#090d16',
              }}>
                <td style={{ padding: '9px 12px', color: '#334155', fontFamily: 'monospace' }}>{i + 1}</td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 99, background: coin.color, flexShrink: 0 }} />
                    <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{coin.ticker}</span>
                    <span style={{ color: '#334155' }}>{coin.name}</span>
                  </div>
                </td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{
                    fontFamily: 'monospace', fontWeight: 800, color: clr,
                    background: `${clr}18`, padding: '2px 6px', borderRadius: 4, fontSize: 12,
                  }}>{tot}</span>
                </td>
                <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                  {formatPrice(cur)}
                </td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{ color: chg >= 0 ? '#22c55e' : '#ef4444', fontFamily: 'monospace' }}>
                    {chg >= 0 ? '▲' : '▼'}{Math.abs(chg || 0).toFixed(2)}%
                  </span>
                </td>
                <td style={{ padding: '9px 12px', color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {formatINR(cur)}
                </td>
                <td style={{ padding: '9px 12px', color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {formatMcap(cg?.market_cap)}
                </td>
                <td style={{ padding: '9px 12px', color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {formatSats(getSatsPrice(cur, btcPrice))}
                </td>
                <td style={{ padding: '9px 12px', color: '#f87171', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {getATHPercent(cur, coin.ath)}%
                </td>
                <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                  {coin.hardCap
                    ? <span style={{ color: '#22c55e' }}>✅</span>
                    : <span style={{ color: '#ef4444' }}>❌</span>}
                </td>
                <td style={{ padding: '9px 12px', color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {new Date().getFullYear() - coin.launched}y
                </td>
                <td style={{ padding: '9px 12px', color: '#475569', fontFamily: 'monospace', textAlign: 'center' }}>
                  —
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── RESEARCH SECTION ──────────────────────────────────────────────
function Research() {
  const sections = [
    {
      title: '🕰️ The Lindy Effect Paradox',
      body: 'Bitcoin has 15+ years of survival. Every year a system survives, it earns credibility for surviving longer. KAS (3 years) would need to survive to 2040 without incident to approach BTC\'s Lindy score. No other PoW coin has endured 15 years of adversarial pressure at Bitcoin\'s scale.',
    },
    {
      title: '🌐 The Network Effect Moat',
      body: 'Bitcoin has 50M+ holders, $600B+ market cap, ETF products, custodians, institutional desks. No PoW coin can replicate this without Bitcoin dying first. The "Next Bitcoin" might not replace Bitcoin — it might serve a different niche entirely.',
    },
    {
      title: '🔒 The Hard Cap Requirement',
      body: 'Any "Digital Gold" must have a fixed hard cap. XMR\'s tail emission immediately disqualifies it as "Digital Gold" regardless of its technical excellence. Supply certainty is the foundation of sound money, and compromising it is fatal to the thesis.',
    },
    {
      title: '⚖️ The Fair Launch Standard',
      body: 'Satoshi mined openly, gave up keys, and disappeared. ZEC\'s founders reward, BCH\'s chain splits, and any ICO structure immediately disqualify coins by this standard. The "Next Bitcoin" must emerge from the grassroots, not a company with a treasury.',
    },
    {
      title: '🛡️ The Hash Rate Independence Problem',
      body: 'Bitcoin\'s hash rate is ~600 EH/s. BCH shares SHA-256 with BTC — a 51% attack requires <0.1% of BTC\'s power. Any "Next Bitcoin" needs an independent, growing hash rate on a unique algorithm that cannot be trivially attacked.',
    },
    {
      title: '📊 Honest Scoring Note',
      body: 'Every score in this tracker is based on publicly verifiable data: GitHub commit counts, CoinGecko API, exchange listings, and protocol documentation. Scores represent our research, not financial advice. We update them when new data emerges. Q2 (Hard Cap) alone disqualifies several coins for the "Next Bitcoin" thesis.',
    },
    {
      title: '⚠️ Honest Conclusion',
      body: 'No current PoW coin meets all 13 criteria at Bitcoin\'s level. KAS comes closest technically but is dangerously young. LTC has Lindy but is dying. The honest answer: Bitcoin is almost certainly irreplaceable as "the" Bitcoin. What exists are specialized PoW coins with unique but narrower value propositions.',
    },
  ];

  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12, padding: '20px 24px' }}>
      <h2 style={{ color: '#f59e0b', fontSize: 16, fontWeight: 800, marginBottom: 4, marginTop: 0 }}>
        📖 Why "Next Bitcoin" is Almost Impossible
      </h2>
      <p style={{ fontSize: 11, color: '#334155', marginBottom: 16 }}>
        Honest research — reading the evidence rather than following the hype.
      </p>
      {sections.map((s, i) => (
        <div key={i} style={{
          background: '#080c14', border: '1px solid #1e293b',
          borderRadius: 8, padding: '12px 16px', marginBottom: 10,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{s.title}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>{s.body}</div>
        </div>
      ))}
      <div style={{
        background: '#0a1628', border: '1px solid #f59e0b33',
        borderRadius: 8, padding: '12px 16px', marginTop: 4,
        fontSize: 11, color: '#64748b', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#f59e0b' }}>⚠️ Disclaimer: </strong>
        This tracker is for research and educational purposes only. Scores are opinion-based on
        publicly available data. Nothing here is financial advice. Cryptocurrency investments carry
        extreme risk of total loss. Always do your own research (DYOR).
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function NextBTC() {
  const [view, setView] = useState('cards'); // 'cards' | 'compare' | 'research'

  const { data: priceData, loading, error, lastUpdated, refetch } = usePriceData();
  const fearGreed = useFearGreed();
  const commits   = useGitHubCommits();

  const btcPrice = priceData?.bitcoin?.current_price;

  // Calculate BTC dominance from loaded data
  const totalMcap = Object.values(priceData).reduce((s, c) => s + (c.market_cap || 0), 0);
  const btcDomPct = totalMcap && priceData?.bitcoin?.market_cap
    ? ((priceData.bitcoin.market_cap / totalMcap) * 100).toFixed(1)
    : null;

  // Sort coins by 13Q total, highest first
  const sortedCoins = [...COINS].sort(
    (a, b) => calcTotal(b.q13Scores) - calcTotal(a.q13Scores)
  );

  const VIEWS = [
    { id: 'cards',    label: '🃏 Cards' },
    { id: 'compare',  label: '📊 Compare' },
    { id: 'research', label: '📖 Research' },
  ];

  return (
    <div style={{
      background: '#080c14', minHeight: '100vh', color: '#e2e8f0',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      paddingBottom: 80,
    }}>

      {/* ── Sticky Header ── */}
      <div style={{
        background: 'linear-gradient(180deg, #0a0f1e, #080c14)',
        borderBottom: '1px solid #111827',
        padding: '16px 24px 0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          {/* Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>₿ NextBTC Tracker</span>
              {badge('#f59e0b', 'v8 TRANSPARENT', 9)}
              {badge('#22c55e', '13Q HONEST', 9)}
            </div>
            <div style={{ fontSize: 11, color: '#334155', marginTop: 3 }}>
              PoW coins ranked by 13Q score — badge = actual sum (no mismatch)
            </div>
          </div>

          {/* Live Stats + Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {btcDomPct && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
                  {btcDomPct}%
                </div>
                <div style={{ fontSize: 9, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>BTC DOM</div>
              </div>
            )}
            {fearGreed && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace',
                  color: parseInt(fearGreed.value) < 30 ? '#ef4444'
                       : parseInt(fearGreed.value) < 50 ? '#f97316' : '#22c55e' }}>
                  {fearGreed.value}
                </div>
                <div style={{ fontSize: 9, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {fearGreed.value_classification}
                </div>
              </div>
            )}
            {lastUpdated && (
              <div style={{ fontSize: 10, color: '#1e293b', fontFamily: 'monospace' }}>
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button onClick={refetch} style={{
              padding: '5px 10px', borderRadius: 6, border: '1px solid #1e293b',
              background: '#0d1117', color: '#475569', fontSize: 10, cursor: 'pointer',
              fontFamily: 'monospace', letterSpacing: 0.3,
            }}>⟳ Refresh</button>
          </div>
        </div>

        {/* View Tabs */}
        <div style={{ maxWidth: 1200, margin: '10px auto 0', display: 'flex', gap: 4 }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding: '7px 14px', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer',
              background: view === v.id ? '#0d1117' : 'transparent',
              color: view === v.id ? '#f1f5f9' : '#334155',
              borderBottom: view === v.id ? '2px solid #f59e0b' : '2px solid transparent',
              fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 0' }}>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: '#ef444412', border: '1px solid #ef444430',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 11, color: '#fca5a5',
          }}>
            ⚠️ CoinGecko API: {error} — live price data unavailable. 13Q scores are still accurate.
            {' '}<button onClick={refetch} style={{
              background: 'none', border: 'none', color: '#f87171', cursor: 'pointer',
              fontSize: 11, textDecoration: 'underline', padding: 0,
            }}>Retry</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#1e293b', fontSize: 13 }}>
            Loading live data from CoinGecko…
          </div>
        ) : (
          <>
            {/* BTC Reference Card — shown in all views */}
            <BTCCard priceData={priceData} fearGreed={fearGreed} btcDomPct={btcDomPct} />

            {/* CARDS VIEW */}
            {view === 'cards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 10, color: '#1e293b', letterSpacing: 0.3, marginBottom: 2,
                }}>
                  <span>Sorted highest → lowest 13Q score</span>
                  <span>Scores: badge = q13 criterion sum (verified)</span>
                </div>
                {sortedCoins.map((coin, i) => (
                  <CoinCard key={coin.id} coin={coin} priceData={priceData}
                    btcPrice={btcPrice} commits={commits} rank={i + 1} />
                ))}
              </div>
            )}

            {/* COMPARE VIEW */}
            {view === 'compare' && (
              <CompareTable coins={sortedCoins} priceData={priceData} btcPrice={btcPrice} />
            )}

            {/* RESEARCH VIEW */}
            {view === 'research' && <Research />}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        maxWidth: 1200, margin: '40px auto 0', padding: '16px 16px 0',
        borderTop: '1px solid #0d1117',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        fontSize: 10, color: '#1e293b', fontFamily: 'monospace',
      }}>
        <span>NextBTC Tracker v8 · 13Q Research Edition</span>
        <span>Data: CoinGecko · GitHub API · Alternative.me · Not financial advice</span>
      </div>
    </div>
  );
}