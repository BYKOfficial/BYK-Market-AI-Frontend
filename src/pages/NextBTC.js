import React, { useState, useEffect } from 'react';

const ESTABLISHED_COINS = [
  { sym: 'ETH', name: 'Ethereum', cat: 'Smart Contract', year: 2015, geckoId: 'ethereum', scores: { decentralization: 72, scarcity: 55, security: 88, adoption: 86, devActivity: 95, storeOfValue: 65, potential: 75, simplicity: 45 }, bull: 'Programmable money — DeFi ka backbone', bear: 'Inflation model, complex monetary policy', btcDna: 'Medium — PoS switched from PoW, no fixed supply' },
  { sym: 'LTC', name: 'Litecoin', cat: 'Payment', year: 2011, geckoId: 'litecoin', scores: { decentralization: 82, scarcity: 88, security: 78, adoption: 62, devActivity: 42, storeOfValue: 72, potential: 50, simplicity: 92 }, bull: 'Silver to Bitcoin gold — 13 years proven', bear: 'No unique value beyond BTC', btcDna: 'Very High — PoW, 84M fixed supply, no premine' },
  { sym: 'XMR', name: 'Monero', cat: 'Privacy', year: 2014, geckoId: 'monero', scores: { decentralization: 88, scarcity: 72, security: 90, adoption: 42, devActivity: 70, storeOfValue: 68, potential: 65, simplicity: 75 }, bull: 'Only truly private censorship-resistant currency', bear: 'Exchange delistings due to regulations', btcDna: 'Very High — PoW, decentralized, community driven' },
  { sym: 'XRP', name: 'XRP', cat: 'Payment', year: 2012, geckoId: 'ripple', scores: { decentralization: 30, scarcity: 75, security: 72, adoption: 82, devActivity: 62, storeOfValue: 58, potential: 70, simplicity: 78 }, bull: 'Bank-grade settlement, mass institutional adoption', bear: 'Ripple controls majority supply — centralized', btcDna: 'Low — no mining, Ripple controlled' },
  { sym: 'SOL', name: 'Solana', cat: 'Smart Contract', year: 2020, geckoId: 'solana', scores: { decentralization: 48, scarcity: 58, security: 68, adoption: 74, devActivity: 90, storeOfValue: 52, potential: 80, simplicity: 65 }, bull: 'Fastest growing L1, massive developer ecosystem', bear: 'Network outages history, VC heavy', btcDna: 'Low — PoS, VC backed, inflationary' },
  { sym: 'ADA', name: 'Cardano', cat: 'Smart Contract', year: 2017, geckoId: 'cardano', scores: { decentralization: 78, scarcity: 68, security: 82, adoption: 55, devActivity: 72, storeOfValue: 58, potential: 60, simplicity: 70 }, bull: 'Peer-reviewed, most formally verified blockchain', bear: 'Slow development, years behind roadmap', btcDna: 'Medium — PoS, academic approach, fixed supply 45B' },
  { sym: 'AVAX', name: 'Avalanche', cat: 'Smart Contract', year: 2020, geckoId: 'avalanche-2', scores: { decentralization: 55, scarcity: 65, security: 78, adoption: 62, devActivity: 80, storeOfValue: 50, potential: 75, simplicity: 60 }, bull: 'JP Morgan testing subnets — institutional adoption', bear: 'VC concentration, not grassroots', btcDna: 'Medium — PoS variant, fixed supply 720M' },
  { sym: 'DOT', name: 'Polkadot', cat: 'Interop', year: 2020, geckoId: 'polkadot', scores: { decentralization: 62, scarcity: 58, security: 76, adoption: 52, devActivity: 80, storeOfValue: 48, potential: 68, simplicity: 52 }, bull: 'Internet of blockchains — cross chain vision', bear: 'Complex tokenomics, confusing parachain model', btcDna: 'Low — NPoS, inflationary, Gavin Wood created' },
  { sym: 'LINK', name: 'Chainlink', cat: 'Oracle', year: 2017, geckoId: 'chainlink', scores: { decentralization: 58, scarcity: 62, security: 80, adoption: 70, devActivity: 76, storeOfValue: 55, potential: 72, simplicity: 58 }, bull: 'Every DeFi protocol needs Chainlink — critical infra', bear: 'Utility token not store of value', btcDna: 'Low — centralized oracle network, ERC-20' },
  { sym: 'ALGO', name: 'Algorand', cat: 'Payment', year: 2019, geckoId: 'algorand', scores: { decentralization: 65, scarcity: 62, security: 82, adoption: 52, devActivity: 68, storeOfValue: 52, potential: 58, simplicity: 72 }, bull: 'MIT-founded, mathematically proven consensus', bear: 'Losing mindshare, slow growth', btcDna: 'Medium — Pure PoS, fixed 10B supply' },
];

const NEW_COINS = [
  { sym: 'KAS', name: 'Kaspa', cat: 'PoW New Gen', year: 2022, geckoId: 'kaspa', scores: { decentralization: 90, scarcity: 85, security: 88, adoption: 42, devActivity: 78, storeOfValue: 72, potential: 88, simplicity: 85 }, bull: 'Bitcoin 2.0 — same PoW philosophy, 10x faster with BlockDAG. 28,700 TPS', bear: 'Very early, no DeFi, speculative', btcDna: 'Highest — PoW, fixed supply, no premine, no VC', founder: 'Yonatan Sompolinsky — Hebrew University DAG researcher' },
  { sym: 'ERG', name: 'Ergo', cat: 'PoW Smart Contract', year: 2019, geckoId: 'ergo', scores: { decentralization: 88, scarcity: 88, security: 85, adoption: 35, devActivity: 72, storeOfValue: 70, potential: 80, simplicity: 78 }, bull: 'PoW + Smart contracts + No premine — most fair launch after BTC', bear: 'Tiny ecosystem, limited exchange listings', btcDna: 'Very High — PoW Autolykos, no premine, no ICO', founder: 'Alexander Chepurnoy — ex IOHK Cardano researcher' },
  { sym: 'ALPH', name: 'Alephium', cat: 'PoW Smart Contract', year: 2022, geckoId: 'alephium', scores: { decentralization: 85, scarcity: 82, security: 85, adoption: 30, devActivity: 75, storeOfValue: 65, potential: 85, simplicity: 72 }, bull: 'Bitcoin security + Ethereum programmability. BlockFlow sharding + PoW', bear: 'Extremely early, very small community', btcDna: 'Very High — Proof of Less Work, sharding, no premine', founder: 'Cheng Wang — Distributed systems PhD' },
  { sym: 'CKB', name: 'Nervos', cat: 'PoW L1', year: 2019, geckoId: 'nervos-network', scores: { decentralization: 82, scarcity: 75, security: 80, adoption: 38, devActivity: 72, storeOfValue: 68, potential: 78, simplicity: 60 }, bull: 'Store of value layer specifically. PoW + RISC-V VM. BTC assets bridge', bear: 'Very technical, hard for retail to understand', btcDna: 'Very High — PoW, store of value focused', founder: 'Terry Tai + Jan Xie — ex Ethereum China' },
  { sym: 'DGB', name: 'DigiByte', cat: 'Payment PoW', year: 2014, geckoId: 'digibyte', scores: { decentralization: 85, scarcity: 78, security: 90, adoption: 48, devActivity: 50, storeOfValue: 62, potential: 58, simplicity: 90 }, bull: '5 PoW algorithms — 51% attack virtually impossible. 12 years battle-tested', bear: 'Never achieved mainstream adoption despite strong tech', btcDna: 'Very High — PoW x5, fixed 21B supply, no premine', founder: 'Jared Tate — self-funded, community driven' },
  { sym: 'RVN', name: 'Ravencoin', cat: 'Asset Transfer', year: 2018, geckoId: 'ravencoin', scores: { decentralization: 82, scarcity: 80, security: 78, adoption: 45, devActivity: 55, storeOfValue: 65, potential: 62, simplicity: 88 }, bull: 'Direct Bitcoin fork — no ICO, no premine. Real world asset tokenization', bear: 'Narrow use case, ETH dominates tokenization', btcDna: 'High — Direct BTC code fork, X16R algo, no premine', founder: 'Bruce Fenton — Bitcoin Foundation board member' },
  { sym: 'ZEPH', name: 'Zephyr', cat: 'Privacy PoW', year: 2023, geckoId: 'zephyr-protocol', scores: { decentralization: 85, scarcity: 80, security: 82, adoption: 22, devActivity: 65, storeOfValue: 70, potential: 82, simplicity: 68 }, bull: 'Private stablecoin on PoW chain. Monero privacy + algorithmic stability', bear: '2023 launch — extremely early, unproven at scale', btcDna: 'High — PoW CryptoNote, anonymous community launch', founder: 'Anonymous team — community driven like BTC' },
  { sym: 'KDA', name: 'Kadena', cat: 'Scalable PoW', year: 2020, geckoId: 'kadena', scores: { decentralization: 72, scarcity: 70, security: 82, adoption: 40, devActivity: 68, storeOfValue: 60, potential: 75, simplicity: 55 }, bull: 'Only scalable PoW — 20 chains parallel. Ex-JPMorgan blockchain team', bear: 'Pact language barrier, slow ecosystem growth', btcDna: 'High — PoW consensus, 1B fixed supply', founder: 'Stuart Popejoy + Will Martino — ex JPMorgan' },
  { sym: 'FLUX', name: 'Flux', cat: 'Decentralized Cloud', year: 2019, geckoId: 'zelcash', scores: { decentralization: 80, scarcity: 72, security: 75, adoption: 52, devActivity: 76, storeOfValue: 58, potential: 82, simplicity: 65 }, bull: 'Decentralized AWS — actual enterprise clients. PoW + node rewards', bear: 'Competing against AWS/Google Cloud giants', btcDna: 'Medium-High — PoW, fixed supply, node network', founder: 'Daniel Keller — infrastructure background' },
  { sym: 'XCH', name: 'Chia', cat: 'Proof of Space', year: 2021, geckoId: 'chia', scores: { decentralization: 75, scarcity: 65, security: 80, adoption: 38, devActivity: 70, storeOfValue: 55, potential: 70, simplicity: 62 }, bull: 'Bram Cohen (BitTorrent) created eco-friendly BTC alternative. No energy waste', bear: 'Hard drive farming caused secondary market issues', btcDna: 'Medium — Proof of Space/Time, eco-friendly consensus', founder: 'Bram Cohen — BitTorrent protocol inventor' },
];

const BTC_L2 = [
  { sym: 'STX', name: 'Stacks', cat: 'Bitcoin L2', year: 2017, geckoId: 'blockstack', scores: { decentralization: 75, scarcity: 70, security: 85, adoption: 58, devActivity: 80, storeOfValue: 72, potential: 85, simplicity: 55 }, bull: 'Only production Bitcoin L2 with smart contracts. Nakamoto upgrade = full BTC security', bear: 'Clarity language limits developers, slow growth' },
  { sym: 'CORE', name: 'Core', cat: 'Bitcoin L2 New', year: 2023, geckoId: 'coredaoorg', scores: { decentralization: 65, scarcity: 72, security: 80, adoption: 50, devActivity: 75, storeOfValue: 65, potential: 88, simplicity: 60 }, bull: 'BTC staking + EVM compatible — earn yield on BTC natively', bear: 'Early, centralized validators still' },
  { sym: 'RUNE', name: 'THORChain', cat: 'BTC Native 2024', year: 2019, geckoId: 'thorchain', scores: { decentralization: 88, scarcity: 85, security: 88, adoption: 55, devActivity: 65, storeOfValue: 70, potential: 82, simplicity: 65 }, bull: "Native cross-chain liquidity. Pure Bitcoin security", bear: '2024 standard, ecosystem still forming' },
  { sym: 'SYS', name: 'Syscoin', cat: 'BTC Merge-Mined', year: 2014, geckoId: 'syscoin', scores: { decentralization: 82, scarcity: 78, security: 86, adoption: 40, devActivity: 70, storeOfValue: 65, potential: 75, simplicity: 60 }, bull: 'Bitcoin merge-mined L1 + EVM L2. Only chain with both', bear: 'Low awareness despite strong fundamentals' },
  { sym: 'RSK', name: 'Rootstock', cat: 'BTC Smart Contract', year: 2018, geckoId: 'rootstock', scores: { decentralization: 80, scarcity: 85, security: 88, adoption: 42, devActivity: 68, storeOfValue: 75, potential: 80, simplicity: 55 }, bull: 'Smart contracts directly secured by Bitcoin miners. Oldest BTC sidechain', bear: 'Low DeFi TVL, slow adoption' },
];

const FOUNDERS = [
  { name: 'Satoshi Nakamoto', role: 'Bitcoin Creator', initials: 'SN', color: '#FAEEDA', tc: '#854F0B', quote: "The root problem with conventional currency is all the trust that's required. Bitcoin is peer-to-peer cash — no trusted third party.", view: 'Satoshi ke principles: decentralization sabse pehle, simplicity essential. Is framework pe Kaspa (KAS) aur Ergo (ERG) sabse zyada fit hote hain — PoW, no premine, no VC funding.', pick: 'KAS / ERG' },
  { name: 'Hal Finney', role: 'First BTC Transaction, Cypherpunk', initials: 'HF', color: '#E6F1FB', tc: '#185FA5', quote: 'Bitcoin seems to be a very promising idea. I like using cryptographic proof rather than relying on trust.', view: 'Hal ka focus tha proof-of-work security pe. DigiByte (DGB) 5 simultaneous PoW algorithms ke saath unke security standards pe sabse fit hai.', pick: 'DGB / KAS' },
  { name: 'Adam Back', role: 'Hashcash Inventor, Blockstream CEO', initials: 'AB', color: '#EAF3DE', tc: '#3B6D11', quote: 'Bitcoin is digital gold. Layer 2 will make it the global payment rail.', view: 'Adam Back ka maanna hai ki Bitcoin replaceable nahi hai. Unke hisab se Stacks (STX) aur Rootstock (RSK) best extensions hain — Bitcoin ko extend karo, replace mat karo.', pick: 'STX / RSK' },
  { name: 'Nick Szabo', role: 'Smart Contracts Pioneer', initials: 'NS', color: '#EEEDFE', tc: '#3C3489', quote: 'Trusted third parties are security holes. The next evolution is programmable trustless money.', view: 'Nick Szabo ka smart contract vision Ergo (ERG) mein sabse zyada accurately implement hua hai — PoW security + trustless programmability dono.', pick: 'ERG / ALPH' },
  { name: 'Wladimir van der Laan', role: 'Bitcoin Core Lead Dev', initials: 'WV', color: '#E1F5EE', tc: '#0F6E56', quote: 'Code quality and security reviews matter more than features. Slow and careful wins.', view: 'Bitcoin Core dev perspective: Alephium (ALPH) aur Nervos (CKB) Bitcoin codebase se directly inspired hain aur security-first approach follow karte hain.', pick: 'ALPH / CKB' },
];

const DIMS = [
  { key: 'decentralization', label: 'Decentralization', weight: 0.22 },
  { key: 'scarcity', label: 'Scarcity', weight: 0.20 },
  { key: 'security', label: 'Security', weight: 0.18 },
  { key: 'adoption', label: 'Adoption', weight: 0.10 },
  { key: 'devActivity', label: 'Dev Activity', weight: 0.10 },
  { key: 'storeOfValue', label: 'Store of Value', weight: 0.10 },
  { key: 'potential', label: 'Growth Potential', weight: 0.08 },
  { key: 'simplicity', label: 'Simplicity', weight: 0.02 },
];

function calcScore(scores) {
  return Math.round(DIMS.reduce((s, d) => s + (scores[d.key] || 0) * d.weight, 0));
}
function getTier(n) {
  if (n >= 80) return { label: 'S', bg: 'rgba(0,204,112,0.12)', color: '#00cc70' };
  if (n >= 65) return { label: 'A', bg: 'rgba(0,212,255,0.1)', color: '#00d4ff' };
  if (n >= 50) return { label: 'B', bg: 'rgba(255,204,0,0.1)', color: '#ffcc00' };
  if (n >= 35) return { label: 'C', bg: 'rgba(255,136,0,0.1)', color: '#ff8800' };
  return { label: 'D', bg: 'rgba(255,68,68,0.1)', color: '#ff4444' };
}
function barColor(n) {
  if (n >= 75) return '#00cc70';
  if (n >= 55) return '#ffcc00';
  return '#ff4444';
}

function formatPrice(price) {
  if (!price) return '—';
  if (price >= 1000) return '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  if (price >= 1) return '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  if (price >= 0.01) return '₹' + price.toFixed(4);
  return '₹' + price.toFixed(6);
}

export default function NextBTC({ isDark }) {
  const [tab, setTab] = useState('established');
  const [subTab, setSubTab] = useState('list');
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('overall');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [horizon, setHorizon] = useState('5 Year');
  const [focus, setFocus] = useState('Hidden gem');
  const [livePrices, setLivePrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState(null);

  const c = {
    bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text: isDark ? '#fff' : '#0a0a1a',
    sub: isDark ? '#888' : '#666',
    muted: isDark ? '#555' : '#999',
    accent: isDark ? '#00d4ff' : '#0066cc',
    input: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    inputBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)',
    secondary: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    green: '#00cc70',
    red: '#ff4444',
  };

  const fetchPrices = async () => {
    setPriceLoading(true);
    try {
      const SYM_TO_GECKO = {
        'ETH': 'ethereum', 'LTC': 'litecoin', 'XMR': 'monero',
        'XRP': 'ripple', 'SOL': 'solana', 'ADA': 'cardano',
        'AVAX': 'avalanche-2', 'DOT': 'polkadot', 'LINK': 'chainlink',
        'ALGO': 'algorand', 'KAS': 'kaspa', 'ERG': 'ergo',
        'CKB': 'nervos-network', 'DGB': 'digibyte', 'RVN': 'ravencoin',
        'KDA': 'kadena', 'FLUX': 'zelcash', 'XCH': 'chia',
        'STX': 'blockstack', 'RUNE': 'thorchain', 'SYS': 'syscoin',
      };
      const syms = Object.keys(SYM_TO_GECKO).join(',');
      const res = await fetch(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${syms}&tsyms=INR`
      );
      const data = await res.json();
      const priceMap = {};
      Object.entries(data.RAW || {}).forEach(([sym, currencies]) => {
        const geckoId = SYM_TO_GECKO[sym];
        if (geckoId && currencies.INR) {
          priceMap[geckoId] = {
            inr: currencies.INR.PRICE,
            inr_24h_change: currencies.INR.CHANGEPCT24HOUR,
          };
        }
      });
      setLivePrices(priceMap);
      setLastPriceUpdate(new Date().toLocaleTimeString('en-IN'));
    } catch (e) {
      console.error('Price fetch failed', e);
    }
    setPriceLoading(false);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const getPriceInfo = (geckoId) => {
    if (!geckoId || !livePrices[geckoId]) return { price: null, change: null };
    return {
      price: livePrices[geckoId].inr,
      change: livePrices[geckoId].inr_24h_change,
    };
  };

  const Card = ({ children, style = {}, onClick }) => (
    <div onClick={onClick} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px', marginBottom: '10px', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );

  const Pill = ({ children, active, onClick, style = {} }) => (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${active ? c.accent : c.border}`, background: active ? `${c.accent}22` : 'transparent', color: active ? c.accent : c.muted, cursor: 'pointer', fontSize: '12px', fontWeight: active ? '700' : '400', ...style }}>
      {children}
    </button>
  );

  const PBar = ({ value, height = 5 }) => (
    <div style={{ height, borderRadius: 99, background: c.input, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: barColor(value), borderRadius: 99, transition: 'width 0.8s ease' }} />
    </div>
  );

  const getSorted = (list) => [...list].sort((a, b) => {
    if (sortBy === 'overall') return calcScore(b.scores) - calcScore(a.scores);
    return (b.scores[sortBy] || 0) - (a.scores[sortBy] || 0);
  });

  const renderCoinDetail = (coin, onBack) => {
    const score = calcScore(coin.scores);
    const t = getTier(score);
    const { price, change } = getPriceInfo(coin.geckoId);
    return (
      <div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: c.sub, cursor: 'pointer', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>← Back</button>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: c.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: c.text }}>{coin.sym}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: c.text }}>{coin.name}
                <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: t.bg, color: t.color }}>Tier {t.label}</span>
              </div>
              <div style={{ fontSize: 11, color: c.muted }}>Launch {coin.year} · {coin.cat} · Score {score}%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: barColor(score) }}>{score}%</div>
              {price && (
                <div style={{ fontSize: 13, fontWeight: 700, color: c.accent, marginTop: 2 }}>{formatPrice(price)}</div>
              )}
              {change !== null && (
                <div style={{ fontSize: 11, color: change >= 0 ? c.green : c.red, marginTop: 1 }}>
                  {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                </div>
              )}
            </div>
          </div>

          {/* Live Price Box */}
          {price && (
            <div style={{ background: isDark ? 'rgba(0,212,255,0.06)' : 'rgba(0,100,200,0.05)', border: `1px solid ${c.accent}33`, borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>🟢 Live Price (INR)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: c.accent }}>{formatPrice(price)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>24h Change</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: change >= 0 ? c.green : c.red }}>
                  {change >= 0 ? '+' : ''}{change?.toFixed(2)}%
                </div>
              </div>
            </div>
          )}

          {coin.btcDna && <div style={{ background: c.secondary, borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Bitcoin DNA</div>
            <div style={{ fontSize: 12, color: c.text, lineHeight: 1.6 }}>{coin.btcDna}</div>
          </div>}
          {coin.founder && <div style={{ background: c.secondary, borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Founder</div>
            <div style={{ fontSize: 12, color: c.text, lineHeight: 1.6 }}>{coin.founder}</div>
          </div>}
          {DIMS.map(d => (
            <div key={d.key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: c.sub }}>{d.label} <span style={{ fontSize: 10, color: c.muted }}>({Math.round(d.weight * 100)}% weight)</span></span>
                <span style={{ fontSize: 12, fontWeight: 700, color: barColor(coin.scores[d.key] || 0) }}>{coin.scores[d.key] || 0}%</span>
              </div>
              <PBar value={coin.scores[d.key] || 0} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <div style={{ background: 'rgba(0,204,112,0.08)', border: '1px solid rgba(0,204,112,0.2)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#00cc70', marginBottom: 4, textTransform: 'uppercase' }}>Bull case</div>
              <div style={{ fontSize: 11, color: c.sub, lineHeight: 1.6 }}>{coin.bull}</div>
            </div>
            <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#ff4444', marginBottom: 4, textTransform: 'uppercase' }}>Bear case</div>
              <div style={{ fontSize: 11, color: c.sub, lineHeight: 1.6 }}>{coin.bear}</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderList = (coins, sectionKey) => {
    if (selected && selected.section === sectionKey) {
      const coin = coins.find(c => c.sym === selected.sym);
      if (coin) return renderCoinDetail(coin, () => setSelected(null));
    }
    const sorted = getSorted(coins);
    const tiers = { S: [], A: [], B: [], C: [], D: [] };
    sorted.forEach((coin, i) => { const t = getTier(calcScore(coin.scores)); tiers[t.label].push({ coin, i }); });
    return (
      <div>
        {/* Price refresh bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '8px 12px', background: c.secondary, borderRadius: 10, border: `1px solid ${c.border}` }}>
          <div style={{ fontSize: 11, color: c.muted }}>
            {priceLoading ? '⏳ Fetching live prices...' : lastPriceUpdate ? `🟢 Prices updated: ${lastPriceUpdate}` : '📡 Loading prices...'}
          </div>
          <button onClick={fetchPrices} disabled={priceLoading}
            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.accent, cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Coins', value: coins.length, color: c.accent },
            { label: 'S+A Tier', value: coins.filter(x => calcScore(x.scores) >= 65).length, color: '#00cc70' },
            { label: 'Top Pick', value: sorted[0]?.sym, color: '#ffcc00' },
          ].map((s, i) => (
            <div key={i} style={{ background: c.secondary, borderRadius: 10, padding: '10px', textAlign: 'center', border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {Object.entries(tiers).filter(([, arr]) => arr.length > 0).map(([tl, arr]) => {
          const tierLabels = { S: 'Bitcoin DNA match', A: 'Strong contender', B: 'Moderate similarity', C: 'Low similarity', D: 'Different category' };
          return (
            <div key={tl} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: c.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Tier {tl} — {tierLabels[tl]}</div>
              <Card style={{ padding: '6px 8px' }}>
                {arr.map(({ coin, i }) => {
                  const score = calcScore(coin.scores);
                  const t = getTier(score);
                  const { price, change } = getPriceInfo(coin.geckoId);
                  return (
                    <div key={coin.sym} onClick={() => setSelected({ sym: coin.sym, section: sectionKey })}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = c.input}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ minWidth: 26, fontSize: 12, color: c.muted, fontWeight: 700 }}>#{i + 1}</div>
                      <div style={{ minWidth: 44, fontSize: 13, fontWeight: 700, color: c.text }}>{coin.sym}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 12, color: c.sub }}>{coin.name}</span>
                          <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, background: c.secondary, color: c.muted, border: `1px solid ${c.border}` }}>{coin.cat}</span>
                          {coin.year >= 2022 && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>New</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {DIMS.slice(0, 6).map(d => (
                            <div key={d.key} style={{ width: 7, height: 7, borderRadius: '50%', background: barColor(coin.scores[d.key] || 0) }} title={`${d.label}: ${coin.scores[d.key]}%`} />
                          ))}
                        </div>
                      </div>

                      {/* Live Price Column */}
                      <div style={{ textAlign: 'right', minWidth: 80 }}>
                        {price ? (
                          <>
                            <div style={{ fontSize: 12, fontWeight: 700, color: c.accent }}>{formatPrice(price)}</div>
                            <div style={{ fontSize: 10, color: change >= 0 ? c.green : c.red, fontWeight: 600 }}>
                              {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: 10, color: c.muted }}>Loading...</div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', minWidth: 50 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: barColor(score) }}>{score}%</div>
                        <div style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: t.bg, color: t.color, display: 'inline-block' }}>T-{t.label}</div>
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFounders = () => (
    <div>
      <div style={{ fontSize: 12, color: c.muted, marginBottom: 14 }}>Bitcoin ecosystem key contributors — unka "next Bitcoin" perspective:</div>
      {FOUNDERS.map(f => (
        <Card key={f.name}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: f.color, color: f.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{f.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{f.name}</div>
              <div style={{ fontSize: 11, color: c.muted }}>{f.role}</div>
            </div>
            <div style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,204,0,0.12)', color: '#ffcc00', fontWeight: 700 }}>→ {f.pick}</div>
          </div>
          <div style={{ borderLeft: '3px solid #00d4ff', paddingLeft: 12, paddingTop: 8, paddingBottom: 8, background: c.secondary, borderRadius: '0 10px 10px 0', fontStyle: 'italic', fontSize: 12, color: c.sub, lineHeight: 1.6, marginBottom: 8 }}>"{f.quote}"</div>
          <div style={{ fontSize: 12, color: c.sub, lineHeight: 1.6 }}>{f.view}</div>
        </Card>
      ))}
      <Card style={{ background: c.secondary }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 10 }}>Collective verdict</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[{ sym: 'KAS', votes: 2, desc: 'PoW pick' }, { sym: 'ERG', votes: 2, desc: 'Fair launch' }, { sym: 'STX', votes: 2, desc: 'BTC L2' }, { sym: 'ALPH', votes: 1, desc: 'New gen' }].map(x => {
            const allCoins = [...ESTABLISHED_COINS, ...NEW_COINS, ...BTC_L2];
            const coin = allCoins.find(c => c.sym === x.sym);
            const { price } = coin ? getPriceInfo(coin.geckoId) : {};
            return (
              <div key={x.sym} style={{ background: c.bg, borderRadius: 10, padding: '10px', textAlign: 'center', border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: c.accent }}>{x.sym}</div>
                {price && <div style={{ fontSize: 11, color: c.accent, marginTop: 2 }}>{formatPrice(price)}</div>}
                <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{x.votes} votes</div>
                <div style={{ fontSize: 10, color: c.muted }}>{x.desc}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const runAI = async (type) => {
    setAiLoading(true); setAiResult(null);
    const isNew = type === 'new';
    const coins = isNew ? NEW_COINS : ESTABLISHED_COINS;
    const focusTerm = isNew ? focus : horizon;

    const priceContext = coins.map(c => {
      const { price, change } = getPriceInfo(c.geckoId);
      return `${c.sym}(score:${calcScore(c.scores)}%,price:${price ? formatPrice(price) : 'N/A'},24h:${change ? change.toFixed(1) + '%' : 'N/A'})`;
    }).join(', ');

    const prompt = `You are the world's top crypto research analyst.
Analyze these coins for "${focusTerm}": ${priceContext}
${isNew ? 'These are new/early stage coins with Bitcoin-like PoW fundamentals.' : 'These are established coins being compared to Bitcoin.'}
Bitcoin DNA checklist: PoW, fixed supply, no premine, decentralized, censorship resistant, store of value.
Consider both similarity score AND current price momentum in your analysis.
Respond ONLY in JSON (no markdown):
{"winner":"SYM","winnerFull":"Name","score":82,"verdict":"3 sentence Hinglish analysis","top3":[{"rank":1,"sym":"X","name":"Y","score":82,"why":"12 word Hinglish"},{"rank":2,"sym":"X","name":"Y","score":74,"why":"12 word"},{"rank":3,"sym":"X","name":"Y","score":68,"why":"12 word"}],"darkHorse":"SYM","darkHorseReason":"1 sentence Hinglish","satoshiPick":"SYM","satoshiReason":"1 sentence","risk":"1 line Hinglish risk","confidence":78}`;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }) });
      const data = await res.json();
      const r = JSON.parse(data.content[0].text.replace(/```json|```/g, '').trim());
      setAiResult(r);
    } catch (e) { setAiResult({ error: true }); }
    setAiLoading(false);
  };

  const renderAIResult = (type) => (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {(type === 'established' ? ['5 Year', '10 Year', 'Technology', 'Adoption', 'Cycle peak'] : ['Hidden gem', 'Most BTC-like', '10 year potential', 'Founder quality', 'Risk/Reward']).map(h => (
          <Pill key={h} active={(type === 'established' ? horizon : focus) === h} onClick={() => { type === 'established' ? setHorizon(h) : setFocus(h); setAiResult(null); }}>{h}</Pill>
        ))}
      </div>
      {aiLoading && <div style={{ textAlign: 'center', color: c.accent, padding: '40px 0', fontSize: 14 }}>🤖 AI analyzing {type === 'new' ? 'new gen' : 'established'} coins...</div>}
      {aiResult && !aiResult.error && (
        <Card style={{ border: `1px solid ${c.accent}44`, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>AI verdict — {type === 'established' ? horizon : focus}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: c.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: c.text }}>{aiResult.winner}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: c.text }}>{aiResult.winnerFull}</div>
              <div style={{ fontSize: 12, color: c.muted }}>{aiResult.score}% similarity · Confidence {aiResult.confidence}%</div>
              {(() => { const allCoins = [...ESTABLISHED_COINS, ...NEW_COINS, ...BTC_L2]; const coin = allCoins.find(c => c.sym === aiResult.winner); const { price, change } = coin ? getPriceInfo(coin.geckoId) : {}; return price ? <div style={{ fontSize: 13, color: c.accent, fontWeight: 700, marginTop: 2 }}>{formatPrice(price)} <span style={{ color: change >= 0 ? '#00cc70' : '#ff4444', fontSize: 11 }}>{change >= 0 ? '▲' : '▼'}{Math.abs(change).toFixed(2)}%</span></div> : null; })()}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: barColor(aiResult.score) }}>{aiResult.score}%</div>
          </div>
          <div style={{ fontSize: 13, color: c.sub, lineHeight: 1.7, marginBottom: 14 }}>{aiResult.verdict}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
            {aiResult.top3?.map(x => {
              const allCoins = [...ESTABLISHED_COINS, ...NEW_COINS, ...BTC_L2];
              const coin = allCoins.find(c => c.sym === x.sym);
              const { price } = coin ? getPriceInfo(coin.geckoId) : {};
              return (
                <div key={x.rank} style={{ background: c.secondary, borderRadius: 10, padding: '10px', textAlign: 'center', border: `1px solid ${c.border}` }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: barColor(x.score) }}>{x.sym}</div>
                  {price && <div style={{ fontSize: 11, color: c.accent, marginTop: 2 }}>{formatPrice(price)}</div>}
                  <div style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '4px 0' }}>{x.score}%</div>
                  <div style={{ fontSize: 10, color: c.muted, lineHeight: 1.4 }}>{x.why}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'rgba(0,204,112,0.08)', border: '1px solid rgba(0,204,112,0.2)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#00cc70', marginBottom: 4 }}>DARK HORSE</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{aiResult.darkHorse}</div>
              <div style={{ fontSize: 11, color: c.sub, marginTop: 4, lineHeight: 1.5 }}>{aiResult.darkHorseReason}</div>
            </div>
            <div style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#ffcc00', marginBottom: 4 }}>SATOSHI PICK</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{aiResult.satoshiPick}</div>
              <div style={{ fontSize: 11, color: c.sub, marginTop: 4, lineHeight: 1.5 }}>{aiResult.satoshiReason}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: c.muted, padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 10, borderLeft: '3px solid #ff4444' }}>⚠️ {aiResult.risk}</div>
        </Card>
      )}
      {aiResult?.error && <div style={{ color: '#ff4444', fontSize: 13, padding: 12 }}>Error. Please try again.</div>}
      <button onClick={() => runAI(type)} disabled={aiLoading}
        style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${c.border}`, background: c.secondary, color: c.accent, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
        {aiLoading ? '⏳ Analyzing...' : '🤖 Generate AI Analysis ↗'}
      </button>
      <div style={{ fontSize: 11, color: c.muted, textAlign: 'center', marginTop: 8 }}>Real Claude AI · Live prices included · Not financial advice</div>
    </div>
  );

  const renderCompare = () => {
    const newTop5 = getSorted(NEW_COINS).slice(0, 5);
    const estTop5 = getSorted(ESTABLISHED_COINS).slice(0, 5);
    return (
      <div>
        <div style={{ fontSize: 12, color: c.muted, marginBottom: 14 }}>New generation vs Established — Bitcoin similarity + live price comparison:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[{ title: 'New Generation Top 5', coins: newTop5 }, { title: 'Established Top 5', coins: estTop5 }].map((grp, gi) => (
            <div key={gi}>
              <div style={{ fontSize: 11, color: c.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{grp.title}</div>
              {grp.coins.map(coin => {
                const score = calcScore(coin.scores);
                const { price, change } = getPriceInfo(coin.geckoId);
                return (
                  <div key={coin.sym} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ minWidth: 38, fontSize: 12, fontWeight: 700, color: c.text }}>{coin.sym}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 10, color: c.muted }}>{score}%</span>
                          {price && <span style={{ fontSize: 10, color: c.accent }}>{formatPrice(price)}</span>}
                        </div>
                        <div style={{ height: 5, borderRadius: 99, background: c.input, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${score}%`, background: barColor(score), borderRadius: 99 }} />
                        </div>
                      </div>
                      {change !== null && <div style={{ fontSize: 10, color: change >= 0 ? '#00cc70' : '#ff4444', minWidth: 40, textAlign: 'right' }}>{change >= 0 ? '▲' : '▼'}{Math.abs(change).toFixed(1)}%</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <Card style={{ background: c.secondary }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 8 }}>Key insight</div>
          <div style={{ fontSize: 12, color: c.sub, lineHeight: 1.7 }}>
            New generation coins jaise <b style={{ color: c.text }}>KAS, ERG, ALPH</b> Bitcoin ke principles (PoW, no premine, decentralization) ko established coins se zyada closely follow karte hain — lekin unki <b style={{ color: c.text }}>adoption aur network effect</b> bahut kam hai. Yahi unka biggest risk aur opportunity dono hai.
          </div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 10 }}>
          {[
            { label: 'Avg New Gen', value: Math.round(newTop5.reduce((s, x) => s + calcScore(x.scores), 0) / newTop5.length) + '%', color: '#00cc70' },
            { label: 'Avg Established', value: Math.round(estTop5.reduce((s, x) => s + calcScore(x.scores), 0) / estTop5.length) + '%', color: c.accent },
            { label: 'Hidden gem', value: 'KAS', color: '#ffcc00' },
          ].map((s, i) => (
            <div key={i} style={{ background: c.secondary, borderRadius: 10, padding: '10px', textAlign: 'center', border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 11, color: c.muted, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'established', label: '📊 Top 20 Coins' },
    { id: 'new', label: '🔭 New Gen Coins' },
    { id: 'btcl2', label: '⚡ BTC Layer 2' },
    { id: 'compare', label: '⚖️ Comparison' },
    { id: 'founders', label: '👥 Founders View' },
  ];

  const subTabs = { established: ['list', 'ai'], new: ['list', 'ai'], btcl2: ['list'], compare: [], founders: [] };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: c.muted, marginTop: 4 }}>Bitcoin similarity analysis · 8 dimensions · Tier S→D ranking · 🟢 Live INR prices</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {tabs.map(t => (
          <Pill key={t.id} active={tab === t.id} onClick={() => { setTab(t.id); setSelected(null); setAiResult(null); setSubTab('list'); }}>{t.label}</Pill>
        ))}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 20, border: `1px solid ${c.border}`, background: c.secondary, color: c.text, fontSize: 12, cursor: 'pointer', outline: 'none' }}>
          <option value="overall">Sort: Overall</option>
          <option value="decentralization">Decentralization</option>
          <option value="scarcity">Scarcity</option>
          <option value="security">Security</option>
          <option value="potential">Potential</option>
        </select>
      </div>
      {subTabs[tab]?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {subTabs[tab].map(st => (
            <Pill key={st} active={subTab === st} onClick={() => { setSubTab(st); setAiResult(null); }} style={{ fontSize: 11 }}>
              {st === 'list' ? '📋 Rankings' : '🤖 AI Verdict'}
            </Pill>
          ))}
        </div>
      )}
      {tab === 'established' && subTab === 'list' && renderList(ESTABLISHED_COINS, 'established')}
      {tab === 'established' && subTab === 'ai' && renderAIResult('established')}
      {tab === 'new' && subTab === 'list' && renderList(NEW_COINS, 'new')}
      {tab === 'new' && subTab === 'ai' && renderAIResult('new')}
      {tab === 'btcl2' && renderList(BTC_L2, 'btcl2')}
      {tab === 'compare' && renderCompare()}
      {tab === 'founders' && renderFounders()}
    </div>
  );
}