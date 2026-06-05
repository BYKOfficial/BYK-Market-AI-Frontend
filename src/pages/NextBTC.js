import React, { useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   13Q FRAMEWORK — 100 POINTS TOTAL
   Each question is weighted. Bitcoin scores 100/100 by definition.
   ───────────────────────────────────────────────────────────────────────────── */
const Q13 = [
  { id: 'q1',  label: 'Proof of Work Only',     max: 14, desc: 'Pure PoW — no PoS, no hybrid, no delegated consensus' },
  { id: 'q2',  label: 'Hard Supply Cap',         max: 14, desc: 'Fixed maximum supply forever. No tail emission, no inflation.' },
  { id: 'q3',  label: 'Fair Launch',             max: 12, desc: 'No pre-mine, no ICO, no founders reward, no VC allocation' },
  { id: 'q4',  label: 'True Decentralization',   max: 10, desc: 'No single company or person controls protocol decisions' },
  { id: 'q5',  label: 'UTXO Model',              max: 8,  desc: 'Bitcoin-like unspent transaction output architecture' },
  { id: 'q6',  label: 'Emission Schedule',       max: 8,  desc: 'Predictable supply reduction — halving or equivalent' },
  { id: 'q7',  label: 'Hash Rate Health',        max: 8,  desc: 'Mining security — stable or growing over 6-month trend' },
  { id: 'q8',  label: 'Active Development',      max: 7,  desc: 'Regular GitHub commits, protocol upgrades, live team' },
  { id: 'q9',  label: 'Exchange Liquidity',      max: 7,  desc: 'Listed on 5+ major exchanges, accessible globally' },
  { id: 'q10', label: 'Market Survival',         max: 4,  desc: 'Market cap > $200M — not at delisting or death risk' },
  { id: 'q11', label: 'Lindy Effect',            max: 4,  desc: '3+ years running without fatal exploit or chain death' },
  { id: 'q12', label: 'Regulatory Safety',       max: 2,  desc: 'No active government bans, delistings, or legal threats' },
  { id: 'q13', label: 'SoV Narrative',           max: 2,  desc: 'Community actively believes in long-term store of value' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COIN DATA — honest scores, real analysis, no hype
   ───────────────────────────────────────────────────────────────────────────── */
const COINS = [

  /* ── REFERENCE ─────────────────────────────────────────────────────────── */
  {
    id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', cgId: 'bitcoin', cgImgId: 1,
    category: 'reference', score: 100, supply: '21,000,000',
    q13Scores: {
      q1:  { s: 14, n: 'SHA-256 PoW. 15 years of unbroken mining. Gold standard.' },
      q2:  { s: 14, n: '21M hard cap — this concept was INVENTED here. Never changing.' },
      q3:  { s: 12, n: 'Satoshi mined genesis block publicly Jan 2009. Perfect fair launch.' },
      q4:  { s: 10, n: 'No company, no CEO. Protocol changes need global consensus. Nobody controls it.' },
      q5:  { s: 8,  n: 'UTXO model — invented by Satoshi. All others copy this.' },
      q6:  { s: 8,  n: 'Halving every 210,000 blocks. 2012→2016→2020→2024→2028.' },
      q7:  { s: 8,  n: 'Hash rate at all-time high in 2024. Grows every year.' },
      q8:  { s: 7,  n: 'Core devs active. Taproot (2021), Lightning, ongoing improvements.' },
      q9:  { s: 7,  n: 'Every exchange globally. Most liquid asset in crypto.' },
      q10: { s: 4,  n: '$1T+ market cap. Zero survival risk.' },
      q11: { s: 4,  n: '15+ years running. Maximum Lindy Effect in crypto history.' },
      q12: { s: 2,  n: 'Bitcoin ETF approved USA Jan 2024. Institutional validation.' },
      q13: { s: 2,  n: '"Digital Gold" narrative — universally accepted, not debated.' },
    },
    verdict: 'The benchmark. Every other PoW coin is measured against this. 15 years of survival, all-time-high hash rate, institutional adoption via ETF. No other coin comes close.',
    redFlags: [],
    strengths: ['First mover + maximum Lindy Effect (15 years)', 'All-time-high hash rate security', 'Bitcoin ETF approved — institutional money flowing in', 'No controlling entity (Satoshi disappeared)', '21M cap invented and proven here', 'Maximum global liquidity'],
  },

  /* ── NEXTBTC CANDIDATES (sorted by honest score) ─────────────────────── */
  {
    id: 'kaspa', symbol: 'KAS', name: 'Kaspa', cgId: 'kaspa', cgImgId: 33979,
    category: 'nextbtc', score: 72, supply: '28,700,000,000',
    q13Scores: {
      q1:  { s: 14, n: 'kHeavyHash PoW. ASIC machines deployed since 2023, growing network.' },
      q2:  { s: 14, n: '28.7B hard cap with chromatic deflationary emission — capped.' },
      q3:  { s: 12, n: 'Fair launch Nov 2021. No ICO, no pre-mine, no VC allocation.' },
      q4:  { s: 8,  n: 'Kaspa Foundation exists but protocol changes need community consensus. Dr. Sompolinsky (inventor) leads technically — single point of failure risk.' },
      q5:  { s: 8,  n: 'UTXO model extended to DAG architecture (GHOSTDAG protocol).' },
      q6:  { s: 7,  n: 'Chromatic halving: ~1% monthly emission reduction. Gradual vs Bitcoin\'s step-wise but innovative.' },
      q7:  { s: 7,  n: 'Hash rate grew 50× in 2023–2024 with ASIC deployment. Miners are betting on KAS.' },
      q8:  { s: 6,  n: 'Active GitHub. Dr. Sompolinsky (BlockDAG inventor) still leading. Smart contract upgrade in progress.' },
      q9:  { s: 4,  n: 'Binance + OKX listed. NOT on Coinbase yet — major institutional barrier.' },
      q10: { s: 4,  n: '~$2–4B market cap and growing.' },
      q11: { s: 0,  n: '⚠️ Only 3 years old (2021). Has NOT proven Lindy Effect. Biggest risk.' },
      q12: { s: 2,  n: 'No regulatory issues.' },
      q13: { s: 2,  n: 'Growing "fastest PoW" and "digital silver" narrative.' },
    },
    verdict: 'Most technically innovative PoW coin since Bitcoin. BlockDAG genuinely solves scalability without sacrificing decentralization. Growing hash rate = miners believe in it. BUT only 3 years old — needs 5+ more years to prove itself. Highest potential, highest unproven risk.',
    redFlags: ['Only 3 years old — Lindy Effect completely unproven', 'Not on Coinbase = institutional access barrier', 'Small developer team vs Bitcoin core', 'BlockDAG complexity = more attack surface than simple blockchain', 'Unproven behaviour in a real market crash', 'Dr. Sompolinsky is a single point of failure for development'],
    strengths: ['Genuine technical breakthrough — BlockDAG invented at Hebrew University', 'Hash rate grew 50× since ASIC launch (miners believe)', 'Active development by original inventor', 'Fair launch November 2021', 'Hard cap confirmed', 'Chromatic monthly emission reduction is innovative'],
  },

  {
    id: 'litecoin', symbol: 'LTC', name: 'Litecoin', cgId: 'litecoin', cgImgId: 2,
    category: 'nextbtc', score: 71, supply: '84,000,000',
    q13Scores: {
      q1:  { s: 14, n: 'Scrypt PoW. ASIC mining with strong hardware security.' },
      q2:  { s: 14, n: '84M hard cap — 4× Bitcoin supply. Predictable.' },
      q3:  { s: 12, n: 'Fair launch Oct 2011 by Charlie Lee. No pre-mine, no ICO.' },
      q4:  { s: 7,  n: 'Litecoin Foundation exists but cannot force protocol changes. Moderate decentralization.' },
      q5:  { s: 8,  n: 'Identical UTXO model to Bitcoin.' },
      q6:  { s: 8,  n: 'Halving every 840,000 blocks. Last: Aug 2023. Next: ~2027.' },
      q7:  { s: 2,  n: '⚠️ Hash rate DECLINING since 2023 peak. Miners leaving = confidence falling.' },
      q8:  { s: 2,  n: '⚠️ GitHub activity very low. Charlie Lee largely inactive since 2022. MimbleWimble barely maintained.' },
      q9:  { s: 7,  n: 'Binance, Coinbase, Kraken, all Tier-1 exchanges. Maximum liquidity.' },
      q10: { s: 4,  n: '~$3–5B market cap. No survival risk.' },
      q11: { s: 4,  n: '13 years running (2011). Second oldest PoW coin.' },
      q12: { s: 2,  n: 'No regulatory issues globally.' },
      q13: { s: 0,  n: '❌ "Silver to Bitcoin\'s gold" narrative is DEAD. No one argues this seriously anymore.' },
    },
    verdict: 'Technically passes most criteria but the market has voted: LTC is not Next Bitcoin. Hash rate declining = miners not confident. Charlie Lee SOLD ALL his LTC at the 2017 peak — the founder showed zero long-term conviction. Development near-stagnant. Despite high technical score, narrative and momentum are dead.',
    redFlags: ['Hash rate declining — miners are leaving (key signal)', 'Charlie Lee sold ALL his LTC at 2017 ATH — massive conviction red flag', 'No unique value proposition that Bitcoin doesn\'t already offer', 'Payment use case killed by Lightning Network', 'Development near-stagnant since 2022', 'SoV narrative completely dead in the market'],
    strengths: ['Oldest PoW coin after BTC (13 years of Lindy)', 'Perfect fair launch 2011', '84M hard cap', 'Maximum exchange liquidity on all Tier-1 exchanges', 'Identical UTXO model to Bitcoin', 'Strongest Bitcoin-clone technical spec'],
  },

  {
    id: 'ergo', symbol: 'ERG', name: 'Ergo', cgId: 'ergo', cgImgId: 15441,
    category: 'nextbtc', score: 64, supply: '97,739,924',
    q13Scores: {
      q1:  { s: 14, n: 'Autolykos v2 PoW — ASIC-resistant GPU mining. More decentralized mining.' },
      q2:  { s: 14, n: '97.74M hard cap confirmed.' },
      q3:  { s: 8,  n: '⚠️ Dev fund: 4.37% of block rewards went to Ergo Foundation for first 2.5 years. Close to fair launch but not perfect.' },
      q4:  { s: 8,  n: 'Ergo Foundation exists. Alexander Chepurnoy (Kushti) leads. Community governance developing.' },
      q5:  { s: 8,  n: 'Extended UTXO (eUTXO) — Bitcoin UTXO model + smart contract capability. Genuine innovation.' },
      q6:  { s: 8,  n: 'Block rewards reduce over 8 years, then storage rent fees sustain miners.' },
      q7:  { s: 5,  n: 'Hash rate moderate and stable. GPU mining community relatively small.' },
      q8:  { s: 6,  n: 'Active GitHub. Sigma protocols, ErgoScript, DeFi tools being built.' },
      q9:  { s: 3,  n: '⚠️ NOT on Binance or Coinbase. Gate.io, KuCoin only. Major liquidity gap.' },
      q10: { s: 2,  n: '⚠️ ~$100–250M market cap. Near survival threshold. Delisting risk if price drops.' },
      q11: { s: 4,  n: '6 years running (2019). Solid track record.' },
      q12: { s: 2,  n: 'No regulatory issues.' },
      q13: { s: 1,  n: 'Small dedicated community. "PoW + DeFi" narrative slowly emerging.' },
    },
    verdict: 'Best technical innovation in PoW DeFi space. eUTXO is genuinely breakthrough — smart contracts on Bitcoin-like UTXO model. BUT not on Binance/Coinbase = price manipulation risk and low liquidity. Market cap near delisting floor. Needs major exchange listing to prove itself.',
    redFlags: ['NOT on Binance or Coinbase — serious liquidity and price risk', 'Market cap near $200M survival threshold', 'Small dev fund = not a perfect fair launch', 'Very low mainstream awareness', 'Tiny trading community = whale manipulation possible'],
    strengths: ['eUTXO = UTXO + smart contracts (genuine technical breakthrough)', 'ASIC resistant = more decentralized GPU mining', 'Hard cap confirmed', 'Active development team (Kushti very active)', 'DeFi ecosystem building on PoW'],
  },

  {
    id: 'monero', symbol: 'XMR', name: 'Monero', cgId: 'monero', cgImgId: 101,
    category: 'nextbtc', score: 62, supply: '∞ (tail emission)',
    q13Scores: {
      q1:  { s: 14, n: 'RandomX PoW — actively ASIC-resistant. CPU/GPU mining globally distributed.' },
      q2:  { s: 0,  n: '❌ NO HARD CAP. Tail emission: 0.6 XMR per block forever. Intentional but breaks Bitcoin\'s scarcity model completely.' },
      q3:  { s: 12, n: 'Fair launch April 2014. No ICO, no pre-mine. Clean Bytecoin fork by community.' },
      q4:  { s: 10, n: 'Most decentralized non-BTC PoW coin. No controlling company. RandomX prevents ASIC centralization.' },
      q5:  { s: 8,  n: 'Modified UTXO with ring signatures, stealth addresses hiding senders and amounts.' },
      q6:  { s: 2,  n: 'Smooth emission curve (no halving). Then permanent tail emission — NOT deflationary.' },
      q7:  { s: 7,  n: 'Hash rate stable. CPU/GPU miners globally distributed = very decentralized.' },
      q8:  { s: 7,  n: 'Most actively developed PoW coin after Bitcoin. Seraphis/Jamtis upgrade in progress.' },
      q9:  { s: 2,  n: '❌ DELISTED from Binance Feb 2024, Kraken UK, Huobi, multiple others. Only on Gate.io, TradeOgre, Kraken US.' },
      q10: { s: 4,  n: '~$3–7B market cap.' },
      q11: { s: 4,  n: '10 years running (2014). Strong Lindy Effect.' },
      q12: { s: 0,  n: '❌ HIGH REGULATORY RISK. Binance delisted 2024. IRS $625K bounty on cracking XMR. Multiple governments flagging.' },
      q13: { s: 2,  n: 'Strong privacy + fungibility narrative. Real-world use as private money.' },
    },
    verdict: 'Technically the most privacy-preserving and decentralized PoW coin. BUT two critical failures for a "Bitcoin SoV" model: (1) NO hard cap — tail emission means perpetual inflation. (2) Delisted from Binance 2024 — regulatory pressure is accelerating, not slowing. Best for actual private transactions. Worst for "store of value" comparisons to Bitcoin.',
    redFlags: ['❌ NO HARD SUPPLY CAP — tail emission forever invalidates SoV model', '❌ Delisted from Binance February 2024 — biggest exchange loss in crypto', '❌ HIGH regulatory risk — IRS actively targeting, governments building interdiction tools', 'Exchange access declining year-over-year', 'Cannot be held in regulated custodians (ETF impossible)'],
    strengths: ['Most decentralized PoW coin after BTC (RandomX prevents ASIC farms)', 'True on-chain privacy (Ring sigs + RingCT + Stealth addresses)', 'Fair launch 2014', 'Most active PoW development after Bitcoin', '10-year Lindy Effect', 'Genuinely fungible (unlike BTC where tainted coins exist)'],
  },

  {
    id: 'zcash', symbol: 'ZEC', name: 'Zcash', cgId: 'zcash', cgImgId: 486,
    category: 'nextbtc', score: 54, supply: '21,000,000',
    q13Scores: {
      q1:  { s: 14, n: 'Equihash PoW. ASIC and GPU mining both supported.' },
      q2:  { s: 14, n: '21M hard cap — identical structure to Bitcoin.' },
      q3:  { s: 0,  n: '❌ FOUNDERS REWARD FAIL: 20% of ALL block rewards for first 4 years went to ECC founders, investors, Zcash Foundation. This is VC funding disguised as "mining."' },
      q4:  { s: 3,  n: '❌ Electric Coin Company (ECC) controls development decisions. Not decentralized.' },
      q5:  { s: 8,  n: 'UTXO model with transparent and shielded (z-address) transaction types.' },
      q6:  { s: 8,  n: 'Halving schedule exists, similar to Bitcoin.' },
      q7:  { s: 6,  n: 'Hash rate moderate and stable.' },
      q8:  { s: 6,  n: 'ECC has technically strong team. zk-SNARK research ongoing.' },
      q9:  { s: 4,  n: 'Binance listed. Delisted from Binance Japan, South Korea restrictions. Access declining.' },
      q10: { s: 4,  n: '~$500M–1B market cap.' },
      q11: { s: 4,  n: '8 years running (2016).' },
      q12: { s: 0,  n: '❌ Privacy coin regulatory pressure. Binance Japan delisted. South Korea restricted. IRS targeting.' },
      q13: { s: 1,  n: 'Privacy narrative but XMR does privacy better AND had a fair launch.' },
    },
    verdict: 'FAILS THE FUNDAMENTAL TEST: 20% founders reward to Electric Coin Company VCs. ZEC is a venture-capital backed project masquerading as a Bitcoin-like coin. ECC (a company) controls protocol decisions. Even the "privacy" argument fails — Monero has stronger privacy AND a fair launch.',
    redFlags: ['❌ 20% founders reward for 4 years — this is VC funding, not fair launch', '❌ Electric Coin Company (a corporation) controls protocol', 'Delisted from Japanese/Korean exchanges', 'Privacy regulation pressure accelerating globally', 'XMR is a better privacy coin and has a fair launch', 'Founders reward made founders extremely wealthy at early miners\' expense'],
    strengths: ['21M hard cap identical to BTC', 'zk-SNARKs zero-knowledge proof tech (genuine cryptographic breakthrough)', 'Binance listed globally', 'Strong technical team at ECC', '8-year track record'],
  },

  {
    id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash', cgId: 'bitcoin-cash', cgImgId: 780,
    category: 'nextbtc', score: 49, supply: '21,000,000',
    q13Scores: {
      q1:  { s: 14, n: 'SHA-256 PoW — identical to Bitcoin. Same ASIC miners can mine BTC or BCH.' },
      q2:  { s: 14, n: '21M hard cap — same as Bitcoin.' },
      q3:  { s: 12, n: 'Inherited Bitcoin\'s fair launch. Aug 2017 fork had no pre-mine.' },
      q4:  { s: 2,  n: '❌ Roger Ver and small group had disproportionate control. 2018 BCH/BSV war exposed concentrated power.' },
      q5:  { s: 8,  n: 'UTXO model identical to Bitcoin.' },
      q6:  { s: 8,  n: 'Same halving schedule as Bitcoin.' },
      q7:  { s: 3,  n: '⚠️ Hash rate << Bitcoin. Same SHA-256 hardware means 51% attack feasible using BTC mining rigs.' },
      q8:  { s: 3,  n: '⚠️ Development split across competing client teams (BCHN, BCHA). No unified direction.' },
      q9:  { s: 7,  n: 'All major exchanges — inherits Bitcoin brand recognition.' },
      q10: { s: 4,  n: '~$5–8B market cap.' },
      q11: { s: 4,  n: '7 years running (2017).' },
      q12: { s: 2,  n: 'No regulatory issues.' },
      q13: { s: 0,  n: '❌ "Peer-to-peer cash" narrative killed by Lightning Network. BTC does this better now.' },
    },
    verdict: 'Technically Bitcoin-identical but the HUMAN layer is severely damaged. BCH/BSV war 2018 destroyed community trust. Roger Ver (key promoter) arrested 2023. Multiple contentious hard forks. Low hash rate means 51% attack is feasible using BTC mining hardware. Lightning Network kills the payment use case.',
    redFlags: ['❌ Roger Ver arrested 2023 (fraud/tax charges) — key founder/promoter gone', '❌ BCH/BSV 2018 war split community — destroyed trust permanently', '51% attack feasible with BTC-compatible mining hardware', 'Lightning Network renders "p2p cash" argument obsolete', 'Multiple contentious hardforks destroyed credibility', 'Development team fragmented, no unified roadmap'],
    strengths: ['21M hard cap identical to BTC', 'SHA-256 PoW (same as Bitcoin)', 'All major exchange listings', '7-year track record', 'Cheap fast transactions vs BTC base layer'],
  },

  {
    id: 'digibyte', symbol: 'DGB', name: 'DigiByte', cgId: 'digibyte', cgImgId: 63,
    category: 'nextbtc', score: 40, supply: '21,000,000,000',
    q13Scores: {
      q1:  { s: 14, n: '5-algorithm PoW (SHA256d, Scrypt, Skein, Qubit, Odocrypt) — unique but each algorithm individually weak.' },
      q2:  { s: 14, n: '21B hard cap.' },
      q3:  { s: 12, n: 'Fair launch Jan 2014. No ICO, no pre-mine.' },
      q4:  { s: 5,  n: 'DigiByte Foundation exists. Core dev team near-inactive.' },
      q5:  { s: 8,  n: 'UTXO model.' },
      q6:  { s: 8,  n: 'Monthly emission reduction schedule.' },
      q7:  { s: 0,  n: '❌ Hash rate critically low. 5-algo split = each individually weak = cheap 51% attack possible on each algorithm.' },
      q8:  { s: 0,  n: '❌ GitHub essentially abandoned. Last meaningful protocol update 2021. Core developer Jared Tate has moved on.' },
      q9:  { s: 2,  n: '⚠️ Binance listed but volume negligible. Functional delisting in practice.' },
      q10: { s: 1,  n: '⚠️ ~$50–100M market cap. BELOW $200M survival threshold. Real delisting risk.' },
      q11: { s: 4,  n: '10+ years running (2014). Has survived this long.' },
      q12: { s: 2,  n: 'No regulatory issues.' },
      q13: { s: 0,  n: '❌ No real narrative. "Fastest blockchain" claims outdated. No community traction.' },
    },
    verdict: 'WARNING: THIS IS WHAT SLOW COIN DEATH LOOKS LIKE. GitHub abandoned since 2021. Hash rate critically low. Market cap below $200M survival floor. Despite fair launch, hard cap, and 10-year history — no one is developing or using DigiByte. The 5-algorithm design that seemed innovative actually splits hash rate = each algo individually insecure.',
    redFlags: ['❌ GitHub abandoned since 2021 — dead development', '❌ Hash rate critically low — 51% attack cheap on each algorithm', '❌ Market cap below $200M survival threshold', '❌ No active developer team', 'No users, no use case, no momentum, no narrative', '5-algo split makes each algorithm individually insecure', 'Jared Tate (founder) effectively left the project'],
    strengths: ['Fair launch 2014', '21B hard cap', '10+ year survival (Lindy exists)'],
  },

  /* ── WATCHLIST ────────────────────────────────────────────────────────── */
  {
    id: 'alephium', symbol: 'ALPH', name: 'Alephium', cgId: 'alephium', cgImgId: 24426,
    category: 'watchlist', score: 58, supply: '~86,000,000',
    q13Scores: null,
    verdict: 'BlockFlow sharding + PoW + stateful smart contracts. Technically interesting — solves UTXO smart contract limitations differently than ERG. Very early but the team is serious. Watch for exchange listings and adoption.',
    redFlags: ['Very new (2021) — Lindy unproven', 'Low market cap — survival risk', 'Not on major exchanges', 'Unproven under market stress'],
    strengths: ['Genuine PoW + smart contract innovation (BlockFlow)', 'Active developer team', 'Fair launch', 'Growing community'],
  },

  {
    id: 'radiant', symbol: 'RXD', name: 'Radiant', cgId: 'radiant', cgImgId: 26869,
    category: 'watchlist', score: 35, supply: '21,000,000,000',
    q13Scores: null,
    verdict: 'Bitcoin UTXO + induction proofs for smart contracts. Extremely experimental. Near-zero adoption. Interesting design philosophy but unproven in every dimension.',
    redFlags: ['Extremely early stage — nearly no users', 'Near-zero adoption', 'Tiny developer team', 'Completely unproven technology'],
    strengths: ['Pure PoW', 'UTXO model', 'Hard cap', 'Bitcoin-inspired design philosophy'],
  },

  /* ── ALTCOINS — auto-rejected as NextBTC candidates ──────────────────── */
  {
    id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', cgId: 'dogecoin', cgImgId: 5,
    category: 'altcoin', score: 12, supply: '∞ (no cap)',
    q13Scores: null,
    verdict: 'No hard supply cap = infinite inflation = NOT a store of value by design. PoW but auto-rejected. Elon Musk controls sentiment. Meme origin. Market cap driven purely by speculation and tweets.',
    redFlags: ['No supply cap — infinite inflation disqualifies as SoV', 'Elon Musk single-handedly moves price (extreme centralization of influence)', 'Meme coin — zero fundamental value', 'No serious development', 'Not a store of value by design'],
    strengths: ['PoW (Scrypt)', 'Large community', 'High liquidity'],
  },

  {
    id: 'ravencoin', symbol: 'RVN', name: 'Ravencoin', cgId: 'ravencoin', cgImgId: 3843,
    category: 'altcoin', score: 20, supply: '21,000,000,000',
    q13Scores: null,
    verdict: 'Asset issuance utility coin, not SoV. No hard cap. Fair launch but designed for a different purpose than Bitcoin. Auto-rejected as NextBTC candidate.',
    redFlags: ['No hard supply cap', 'Designed as utility/asset coin, not SoV', 'Low adoption', 'Declining development activity'],
    strengths: ['Fair launch', 'PoW (KawPoW)', 'Asset issuance use case'],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────────────── */
const scoreColor = (s) => s >= 70 ? '#22c55e' : s >= 55 ? '#eab308' : s >= 40 ? '#f97316' : '#ef4444';
const scoreBg    = (s) => s >= 70 ? 'rgba(34,197,94,.12)' : s >= 55 ? 'rgba(234,179,8,.12)' : s >= 40 ? 'rgba(249,115,22,.12)' : 'rgba(239,68,68,.12)';
const scoreTag   = (s) => s >= 70 ? 'STRONG' : s >= 55 ? 'MODERATE' : s >= 40 ? 'WEAK' : 'REJECT';

const q13Total = (scores) => scores ? Object.values(scores).reduce((t, q) => t + q.s, 0) : 0;

const fmtUSD = (v) => {
  if (!v) return '—';
  if (v >= 10000) return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (v >= 1)     return `$${v.toFixed(2)}`;
  if (v >= 0.01)  return `$${v.toFixed(4)}`;
  return `$${v.toFixed(6)}`;
};
const fmtINR = (v) => {
  if (!v) return '—';
  if (v >= 1e7)  return `₹${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5)  return `₹${(v / 1e5).toFixed(2)}L`;
  if (v >= 1000) return `₹${Math.round(v).toLocaleString('en-IN')}`;
  return `₹${v.toFixed(2)}`;
};
const fmtMcap = (v) => {
  if (!v) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
export default function NextBTC() {
  const [tab,        setTab]        = useState('nextbtc');
  const [prices,     setPrices]     = useState({});
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [expanded,   setExpanded]   = useState(null);
  const [expSection, setExpSection] = useState('q13');
  const [btcDom,     setBtcDom]     = useState(null);
  const [fearGreed,  setFearGreed]  = useState(null);
  const [inrRate,    setInrRate]    = useState(85);
  const [aiText,     setAiText]     = useState({});
  const [aiLoad,     setAiLoad]     = useState({});

  /* ── Fetch Prices ─────────────────────────────────────────────────────── */
  const fetchPrices = useCallback(async () => {
    try {
      const ids = COINS.map(c => c.cgId).join(',');
      const r = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,inr&include_24hr_change=true&include_market_cap=true`
      );
      if (!r.ok) throw new Error();
      const d = await r.json();
      setPrices(d);
      setLastUpdate(new Date());
      if (d.bitcoin?.usd && d.bitcoin?.inr) setInrRate(Math.round(d.bitcoin.inr / d.bitcoin.usd));
    } catch { /* silent fail — keep old data */ }
    finally { setLoading(false); }
  }, []);

  /* ── Fetch Market Signals ─────────────────────────────────────────────── */
  const fetchMarket = useCallback(async () => {
    try {
      const r = await fetch('https://api.coingecko.com/api/v3/global');
      if (r.ok) { const d = await r.json(); setBtcDom(d.data?.market_cap_percentage?.btc?.toFixed(1)); }
    } catch {}
    try {
      const r = await fetch('https://api.alternative.me/fng/');
      if (r.ok) { const d = await r.json(); setFearGreed(d.data?.[0]); }
    } catch {}
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchMarket();
    const iv = setInterval(fetchPrices, 60000);
    return () => clearInterval(iv);
  }, [fetchPrices, fetchMarket]);

  /* ── AI Analysis ─────────────────────────────────────────────────────── */
  const runAI = async (coin) => {
    if (aiLoad[coin.id] || aiText[coin.id]) return;
    setAiLoad(p => ({ ...p, [coin.id]: true }));
    const p = prices[coin.cgId];
    const prompt = `You are a brutally honest crypto researcher. Analyze ${coin.symbol} (${coin.name}) as a "Next Bitcoin" candidate.

Current data:
- Price: ${fmtUSD(p?.usd)} (${(p?.usd_24h_change ?? 0).toFixed(2)}% 24h)
- Market cap: ${fmtMcap(p?.usd_market_cap)}
- 13Q Score: ${coin.score}/100 (${scoreTag(coin.score)})
- Category: ${coin.category}
- Supply: ${coin.supply}

Known issues: ${coin.redFlags.join('; ')}
Known strengths: ${coin.strengths.join('; ')}

Give a 3-sentence honest verdict. No hype, no shilling. Address: (1) Is this genuinely "Next Bitcoin" or not, (2) One critical weakness, (3) One genuine strength.
Keep it under 80 words. No markdown, plain text.`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 150, messages: [{ role: 'user', content: prompt }] }),
      });
      const d = await r.json();
      const txt = d.content?.find(b => b.type === 'text')?.text || 'Analysis unavailable.';
      setAiText(prev => ({ ...prev, [coin.id]: txt }));
    } catch { setAiText(prev => ({ ...prev, [coin.id]: 'Could not fetch AI analysis. Check connection.' })); }
    finally { setAiLoad(p => ({ ...p, [coin.id]: false })); }
  };

  /* ── Tab Logic ────────────────────────────────────────────────────────── */
  const tabCoins = (() => {
    const sorted = (list) => [...list].sort((a, b) => b.score - a.score);
    switch (tab) {
      case 'nextbtc':   return sorted(COINS.filter(c => c.category === 'nextbtc'));
      case 'all':       return sorted(COINS);
      case 'watchlist': return sorted(COINS.filter(c => c.category === 'watchlist'));
      case 'altcoins':  return sorted(COINS.filter(c => c.category === 'altcoin'));
      default:          return [];
    }
  })();

  const btcData = prices['bitcoin'];

  /* ──────────────────────────────────────────────────────────────────────── */
  /* STYLES                                                                  */
  /* ──────────────────────────────────────────────────────────────────────── */
  const S = {
    wrap:  { background:'#080810', minHeight:'100vh', color:'#e2e8f0', fontFamily:"'JetBrains Mono','Fira Code','Courier New',monospace" },
    hdr:   { background:'linear-gradient(180deg,#0f0f1a 0%,#080810 100%)', borderBottom:'1px solid #1a1a2e', padding:'18px 20px 14px' },
    htitle:{ fontSize:'20px', fontWeight:'800', color:'#f7931a', margin:0, letterSpacing:'-0.5px' },
    hsub:  { fontSize:'10px', color:'#475569', margin:'3px 0 0', textTransform:'uppercase', letterSpacing:'1px' },

    mktBar:{ display:'flex', gap:'16px', padding:'9px 20px', background:'#0a0a14', borderBottom:'1px solid #1a1a2e', flexWrap:'wrap', fontSize:'11px', alignItems:'center' },
    mktItm:{ display:'flex', alignItems:'center', gap:'6px', color:'#475569' },
    mktVal:{ color:'#e2e8f0', fontWeight:'700' },
    chg:   (v) => ({ fontSize:'11px', fontWeight:'700', color: v >= 0 ? '#22c55e' : '#ef4444' }),

    disc:  { margin:'14px 16px', padding:'10px 14px', background:'#0f0900', border:'1px solid #f7931a22', borderRadius:'8px', fontSize:'10px', color:'#78716c', lineHeight:'1.6' },

    btcCard:{ margin:'0 16px 14px', padding:'14px', background:'linear-gradient(135deg,#0f0f1a,#1a1a2e)', border:'1px solid #f7931a33', borderRadius:'10px' },
    btcTop: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
    btcLbl: { fontSize:'9px', color:'#f7931a', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase' },
    btcNm:  { fontSize:'18px', fontWeight:'900', color:'#f7931a', margin:'2px 0' },
    btcSub: { fontSize:'10px', color:'#64748b' },
    btcPr:  { textAlign:'right' },
    btcUSD: { fontSize:'18px', fontWeight:'700', color:'#f1f5f9' },
    btcINR: { fontSize:'11px', color:'#64748b', marginTop:'2px' },
    cgrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginTop:'12px' },
    citem:  { background:'#0a0a0f', border:'1px solid #1a1a2e', borderRadius:'6px', padding:'7px 10px' },
    clbl:   { fontSize:'9px', color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px' },
    cval:   { fontSize:'12px', fontWeight:'700', color:'#f7931a', marginTop:'2px' },

    tabs:   { display:'flex', gap:'2px', padding:'0 16px', borderBottom:'1px solid #1a1a2e', overflowX:'auto' },
    tab:    (a) => ({ padding:'10px 13px', fontSize:'10px', fontWeight:'700', letterSpacing:'0.5px', textTransform:'uppercase', border:'none', background:'transparent', color: a?'#f7931a':'#475569', borderBottom: a?'2px solid #f7931a':'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s' }),

    list:   { padding:'12px 16px' },
    card:   (exp, score) => ({ background:'#0a0a14', border:`1px solid ${exp ? scoreColor(score)+'44' : '#1a1a2e'}`, borderRadius:'10px', marginBottom:'10px', overflow:'hidden', transition:'border-color .2s' }),

    crow:   { display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', cursor:'pointer' },
    rank:   { fontSize:'10px', fontWeight:'700', color:'#334155', width:'16px', textAlign:'center', flexShrink:0 },
    logo:   (s) => ({ width:'38px', height:'38px', borderRadius:'50%', background:scoreBg(s), border:`2px solid ${scoreColor(s)}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', color:scoreColor(s), flexShrink:0, overflow:'hidden' }),
    logoImg:{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' },
    cinfo:  { flex:1, minWidth:0 },
    csym:   { fontSize:'14px', fontWeight:'800', color:'#f1f5f9' },
    cname:  { fontSize:'10px', color:'#475569' },

    sbadge: (s) => ({ display:'flex', flexDirection:'column', alignItems:'center', background:scoreBg(s), border:`1px solid ${scoreColor(s)}33`, borderRadius:'6px', padding:'4px 8px', minWidth:'50px', flexShrink:0 }),
    snum:   (s) => ({ fontSize:'15px', fontWeight:'900', color:scoreColor(s), lineHeight:1 }),
    stag:   (s) => ({ fontSize:'7px', fontWeight:'700', color:scoreColor(s), letterSpacing:'0.5px', marginTop:'2px', textTransform:'uppercase' }),

    pright: { textAlign:'right', flexShrink:0 },
    pusd:   { fontSize:'13px', fontWeight:'700', color:'#f1f5f9' },
    pinr:   { fontSize:'10px', color:'#475569', marginTop:'1px' },
    pmore:  { fontSize:'8px', color:'#334155', marginTop:'3px' },

    mcbar:  { display:'flex', gap:'14px', padding:'8px 14px', borderTop:'1px solid #1a1a2e', flexWrap:'wrap' },
    mcitm:  { display:'flex', flexDirection:'column' },
    mclbl:  { fontSize:'8px', color:'#334155', textTransform:'uppercase', letterSpacing:'0.5px' },
    mcval:  { fontSize:'11px', fontWeight:'600', color:'#64748b' },
    catbadge:(cat) => ({ fontSize:'11px', fontWeight:'600', color: cat==='reference'?'#f7931a':cat==='nextbtc'?'#22c55e':cat==='watchlist'?'#eab308':'#64748b' }),

    expWrap:{ borderTop:'1px solid #1a1a2e', padding:'14px', background:'#06060e' },
    stabs:  { display:'flex', gap:'6px', marginBottom:'14px' },
    stab:   (a) => ({ padding:'5px 10px', fontSize:'9px', fontWeight:'700', letterSpacing:'0.5px', textTransform:'uppercase', border:`1px solid ${a?'#f7931a44':'#1a1a2e'}`, borderRadius:'4px', background: a?'#f7931a11':'transparent', color: a?'#f7931a':'#475569', cursor:'pointer' }),

    q13wrap:{ display:'flex', flexDirection:'column', gap:'8px' },
    q13row: { marginBottom:'4px' },
    q13top: { display:'flex', justifyContent:'space-between', marginBottom:'3px' },
    q13lbl: { fontSize:'10px', color:'#94a3b8', fontWeight:'600' },
    q13pts: (v,m) => ({ fontSize:'10px', fontWeight:'800', color: v===0?'#ef4444':v<m*0.5?'#f97316':v<m?'#eab308':'#22c55e' }),
    pbar:   { height:'4px', background:'#1a1a2e', borderRadius:'2px', overflow:'hidden' },
    pfill:  (v,m) => { const c = v===0?'#ef4444':v<m*0.5?'#f97316':v<m?'#eab308':'#22c55e'; return { height:'100%', width:`${m>0?(v/m)*100:0}%`, background:c, borderRadius:'2px', transition:'width .5s ease' }; },
    q13note:{ fontSize:'9px', color:'#475569', marginTop:'2px', lineHeight:'1.4' },
    q13tot: { display:'flex', justifyContent:'space-between', padding:'10px 0 2px', borderTop:'1px solid #1a1a2e', marginTop:'4px' },
    q13tlbl:{ fontSize:'10px', fontWeight:'700', color:'#475569' },
    q13tval:(s) => ({ fontSize:'12px', fontWeight:'900', color:scoreColor(s) }),

    verdBox:{ background:'#0a0a14', border:'1px solid #1a1a2e', borderRadius:'8px', padding:'12px', marginBottom:'10px' },
    verdTxt:{ fontSize:'11px', color:'#cbd5e1', lineHeight:'1.7' },
    sectHdr:{ fontSize:'9px', fontWeight:'700', color:'#475569', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' },

    flagList:{ margin:0, padding:0 },
    flagItem:{ display:'flex', gap:'8px', padding:'4px 0', fontSize:'10px', color:'#fca5a5', borderBottom:'1px solid #1a1a2e', alignItems:'flex-start' },
    strgItem:{ display:'flex', gap:'8px', padding:'4px 0', fontSize:'10px', color:'#86efac', borderBottom:'1px solid #1a1a2e', alignItems:'flex-start' },

    aibtn:  { padding:'7px 14px', fontSize:'10px', fontWeight:'700', background:'#f7931a15', border:'1px solid #f7931a33', borderRadius:'6px', color:'#f7931a', cursor:'pointer', width:'100%', marginBottom:'10px', letterSpacing:'0.5px', textTransform:'uppercase' },
    aibox:  { background:'#0d0d18', border:'1px solid #1a1a2e', borderRadius:'8px', padding:'12px', fontSize:'11px', color:'#94a3b8', lineHeight:'1.7', fontStyle:'italic' },
    ainote: { fontSize:'9px', color:'#334155', marginTop:'8px' },

    res:    { padding:'16px' },
    rscard: { background:'#0a0a14', border:'1px solid #1a1a2e', borderRadius:'10px', padding:'16px', marginBottom:'12px' },
    rstitle:{ fontSize:'13px', fontWeight:'700', color:'#f7931a', marginBottom:'10px' },
    rstxt:  { fontSize:'11px', color:'#94a3b8', lineHeight:'1.7' },
    qdef:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid #1a1a2e', gap:'10px' },
    qdlbl:  { fontSize:'10px', fontWeight:'700', color:'#e2e8f0', flex:'0 0 180px' },
    qddesc: { fontSize:'9px', color:'#64748b', flex:1, textAlign:'right', lineHeight:'1.4' },
    qdmax:  { fontSize:'10px', fontWeight:'700', color:'#f7931a', width:'28px', textAlign:'right', flexShrink:0 },

    rejCard:{ background:'#12080a', border:'1px solid #ef444433', borderRadius:'8px', padding:'12px', marginTop:'8px' },
    rejItem:{ display:'flex', gap:'8px', fontSize:'10px', color:'#ef9999', padding:'3px 0', alignItems:'flex-start' },

    cmpRow: { display:'flex', alignItems:'center', gap:'8px', padding:'8px 0', borderBottom:'1px solid #1a1a2e' },
    cmpSym: { fontSize:'11px', fontWeight:'800', color:'#e2e8f0', width:'34px' },
    cmpBar: { flex:1, height:'6px', background:'#1a1a2e', borderRadius:'3px', overflow:'hidden' },
    cmpFil: (s) => ({ height:'100%', width:`${s}%`, background:scoreColor(s), borderRadius:'3px' }),
    cmpPts: (s) => ({ fontSize:'11px', fontWeight:'800', color:scoreColor(s), width:'28px', textAlign:'right' }),

    sguide: { display:'flex', flexDirection:'column', gap:'5px' },
    sgitem: (col) => ({ display:'flex', gap:'10px', alignItems:'flex-start', padding:'8px', background:'#0a0a0f', borderRadius:'6px', border:`1px solid ${col}22` }),
    sgrnge: (col) => ({ fontSize:'11px', fontWeight:'800', color:col, width:'50px', flexShrink:0 }),
    sgtag:  (col) => ({ fontSize:'10px', fontWeight:'700', color:col, width:'65px', flexShrink:0 }),
    sgnote: { fontSize:'9px', color:'#64748b', flex:1 },

    footer: { padding:'16px 20px 24px', borderTop:'1px solid #1a1a2e', fontSize:'9px', color:'#2d3748', lineHeight:'1.7' },
    empty:  { display:'flex', justifyContent:'center', padding:'40px', color:'#334155', fontSize:'11px' },
  };

  /* ──────────────────────────────────────────────────────────────────────── */
  /* COIN CARD                                                               */
  /* ──────────────────────────────────────────────────────────────────────── */
  const CoinCard = ({ coin, rank }) => {
    const p    = prices[coin.cgId];
    const usd  = p?.usd;
    const inr  = p?.inr;
    const ch   = p?.usd_24h_change;
    const mcap = p?.usd_market_cap;
    const isExp = expanded === coin.id;
    const total = q13Total(coin.q13Scores);

    const imgSrc = `https://assets.coingecko.com/coins/images/${coin.cgImgId}/small/${coin.cgId}.png`;

    const toggle = () => {
      setExpanded(isExp ? null : coin.id);
      setExpSection('q13');
    };

    return (
      <div style={S.card(isExp, coin.score)}>
        {/* Main Row */}
        <div style={S.crow} onClick={toggle}>
          <div style={S.rank}>{rank}</div>

          <div style={S.logo(coin.score)}>
            <img
              src={imgSrc} alt={coin.symbol} style={S.logoImg}
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerText = coin.symbol.slice(0, 2); }}
            />
          </div>

          <div style={S.cinfo}>
            <div style={S.csym}>{coin.symbol}</div>
            <div style={S.cname}>{coin.name}</div>
            {ch !== undefined && (
              <div style={S.chg(ch)}>{ch >= 0 ? '▲' : '▼'} {Math.abs(ch).toFixed(2)}%</div>
            )}
          </div>

          <div style={S.sbadge(coin.score)}>
            <div style={S.snum(coin.score)}>{coin.score}</div>
            <div style={S.stag(coin.score)}>{scoreTag(coin.score)}</div>
          </div>

          <div style={S.pright}>
            {loading && !usd
              ? <div style={{ fontSize:'11px', color:'#334155' }}>…</div>
              : <>
                  <div style={S.pusd}>{fmtUSD(usd)}</div>
                  <div style={S.pinr}>{fmtINR(inr)}</div>
                </>
            }
            <div style={S.pmore}>{isExp ? '▲ LESS' : '▼ MORE'}</div>
          </div>
        </div>

        {/* Market Cap Row */}
        {mcap && (
          <div style={S.mcbar}>
            <div style={S.mcitm}>
              <span style={S.mclbl}>Market Cap</span>
              <span style={S.mcval}>{fmtMcap(mcap)}</span>
            </div>
            <div style={S.mcitm}>
              <span style={S.mclbl}>Category</span>
              <span style={S.catbadge(coin.category)}>{coin.category.toUpperCase()}</span>
            </div>
            {coin.q13Scores && (
              <div style={S.mcitm}>
                <span style={S.mclbl}>13Q Total</span>
                <span style={{ ...S.mcval, color: scoreColor(coin.score) }}>{total}/100</span>
              </div>
            )}
            <div style={{ ...S.mcitm, marginLeft:'auto' }}>
              <span style={S.mclbl}>Supply</span>
              <span style={S.mcval}>{coin.supply}</span>
            </div>
          </div>
        )}

        {/* Expanded Panel */}
        {isExp && (
          <div style={S.expWrap}>

            {/* Section Tabs */}
            <div style={S.stabs}>
              {coin.q13Scores && (
                <button style={S.stab(expSection === 'q13')} onClick={() => setExpSection('q13')}>13Q Breakdown</button>
              )}
              <button style={S.stab(expSection === 'verdict')} onClick={() => setExpSection('verdict')}>Verdict</button>
              <button style={S.stab(expSection === 'flags')} onClick={() => setExpSection('flags')}>
                Red Flags ({coin.redFlags.length})
              </button>
              <button style={S.stab(expSection === 'ai')} onClick={() => { setExpSection('ai'); runAI(coin); }}>AI Analysis</button>
            </div>

            {/* 13Q Breakdown */}
            {expSection === 'q13' && coin.q13Scores && (
              <div style={S.q13wrap}>
                {Q13.map(crit => {
                  const q = coin.q13Scores[crit.id];
                  if (!q) return null;
                  const icon = q.s === 0 ? '❌' : q.s === crit.max ? '✅' : '⚠️';
                  return (
                    <div key={crit.id} style={S.q13row}>
                      <div style={S.q13top}>
                        <span style={S.q13lbl}>{icon} {crit.label}</span>
                        <span style={S.q13pts(q.s, crit.max)}>{q.s}/{crit.max}</span>
                      </div>
                      <div style={S.pbar}><div style={S.pfill(q.s, crit.max)} /></div>
                      <div style={S.q13note}>{q.n}</div>
                    </div>
                  );
                })}
                <div style={S.q13tot}>
                  <span style={S.q13tlbl}>TOTAL 13Q SCORE</span>
                  <span style={S.q13tval(coin.score)}>{total} / 100</span>
                </div>
                <div style={{ fontSize:'9px', color:'#334155', marginTop:'6px' }}>
                  * Scores reflect research at time of last update. Dynamic criteria (Q7–Q10) change with market conditions.
                </div>
              </div>
            )}

            {/* Verdict */}
            {expSection === 'verdict' && (
              <div>
                <div style={S.sectHdr}>Research Verdict</div>
                <div style={S.verdBox}>
                  <div style={S.verdTxt}>{coin.verdict}</div>
                </div>
                {!coin.q13Scores && (
                  <div style={{ fontSize:'10px', color:'#475569', fontStyle:'italic' }}>
                    Full 13Q breakdown not available for {coin.category} coins.
                  </div>
                )}
              </div>
            )}

            {/* Red Flags + Strengths */}
            {expSection === 'flags' && (
              <div>
                <div style={{ marginBottom:'16px' }}>
                  <div style={S.sectHdr}>⚠️ Red Flags & Weaknesses</div>
                  {coin.redFlags.length === 0
                    ? <div style={{ fontSize:'10px', color:'#22c55e' }}>No critical red flags identified.</div>
                    : coin.redFlags.map((f, i) => (
                        <div key={i} style={S.flagItem}><span style={{ color:'#ef4444', flexShrink:0 }}>▸</span><span>{f}</span></div>
                      ))
                  }
                </div>
                <div>
                  <div style={S.sectHdr}>✅ Genuine Strengths</div>
                  {coin.strengths.map((s, i) => (
                    <div key={i} style={S.strgItem}><span style={{ color:'#22c55e', flexShrink:0 }}>▸</span><span>{s}</span></div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {expSection === 'ai' && (
              <div>
                <button style={S.aibtn} onClick={() => runAI(coin)} disabled={aiLoad[coin.id]}>
                  {aiLoad[coin.id] ? 'Analyzing...' : aiText[coin.id] ? '🔄 Refresh Analysis' : '⚡ Get AI Analysis'}
                </button>
                {aiText[coin.id] && (
                  <div style={S.aibox}>
                    "{aiText[coin.id]}"
                    <div style={S.ainote}>— AI research assistant (not financial advice)</div>
                  </div>
                )}
                {!aiText[coin.id] && !aiLoad[coin.id] && (
                  <div style={{ fontSize:'10px', color:'#475569', textAlign:'center', padding:'16px' }}>
                    Click above for AI-powered honest analysis of {coin.symbol}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    );
  };

  /* ──────────────────────────────────────────────────────────────────────── */
  /* RESEARCH TAB                                                            */
  /* ──────────────────────────────────────────────────────────────────────── */
  const ResearchTab = () => (
    <div style={S.res}>

      {/* What Is This */}
      <div style={S.rscard}>
        <div style={S.rstitle}>₿ What is the "NextBTC" Framework?</div>
        <div style={S.rstxt}>
          <p>This tracker identifies which Proof-of-Work coins have the most Bitcoin-like properties as a potential store of value. It does NOT predict which coin will pump in price.</p>
          <p>Bitcoin succeeded because of a unique combination of factors — anonymous founder, first-mover timing, 2008 financial crisis context, and zero pre-mine. None of these can be replicated exactly.</p>
          <p style={{ color:'#f7931a', fontWeight:'700' }}>
            The 13Q framework scores how Bitcoin-like a coin is on objective criteria. High score ≠ buy signal. Low score = avoid as SoV candidate.
          </p>
        </div>
      </div>

      {/* 13Q Criteria */}
      <div style={S.rscard}>
        <div style={S.rstitle}>📊 The 13Q Criteria (100 Points)</div>
        {Q13.map((c, i) => (
          <div key={c.id} style={S.qdef}>
            <span style={S.qdlbl}>Q{i+1}. {c.label}</span>
            <span style={S.qddesc}>{c.desc}</span>
            <span style={S.qdmax}>{c.max}</span>
          </div>
        ))}
        <div style={{ fontSize:'9px', color:'#475569', marginTop:'8px' }}>
          Static criteria (Q1–Q6, Q11, Q13) are protocol properties. Dynamic criteria (Q7, Q8, Q9, Q10) change with market conditions and are updated periodically.
        </div>
      </div>

      {/* Score Comparison Chart */}
      <div style={S.rscard}>
        <div style={S.rstitle}>🏆 Score Ranking — Honest Comparison</div>
        {/* BTC Reference */}
        <div style={S.cmpRow}>
          <span style={{ ...S.cmpSym, color:'#f7931a' }}>BTC</span>
          <div style={S.cmpBar}><div style={{ height:'100%', width:'100%', background:'#f7931a', borderRadius:'3px' }} /></div>
          <span style={{ ...S.cmpPts(100), color:'#f7931a' }}>100</span>
        </div>
        {COINS.filter(c => c.category === 'nextbtc').sort((a,b) => b.score - a.score).map((c, i) => (
          <div key={c.id} style={S.cmpRow}>
            <span style={S.cmpSym}>#{i+1} {c.symbol}</span>
            <div style={S.cmpBar}><div style={S.cmpFil(c.score)} /></div>
            <span style={S.cmpPts(c.score)}>{c.score}</span>
          </div>
        ))}
        <div style={{ fontSize:'9px', color:'#475569', marginTop:'10px' }}>
          Gap between BTC (100) and best candidate (72) = 28 points. This represents 15 years of Lindy Effect, maximum global liquidity, and institutional adoption that cannot be faked.
        </div>
      </div>

      {/* Why No Next Bitcoin */}
      <div style={S.rscard}>
        <div style={S.rstitle}>🔴 Why "Next Bitcoin" Is Almost Impossible</div>
        <div style={S.rstxt}>
          {[
            ['Satoshi\'s anonymity', 'No living founder means no one to arrest, bribe, or pressure. Every other coin has a known creator who is a liability.'],
            ['Lindy Effect takes decades', '15 years of unbroken survival builds trust that cannot be purchased or simulated. A 3-year-old coin cannot claim this.'],
            ['First-mover network effect', 'Bitcoin is the only crypto with global name recognition outside crypto circles. "Digital Gold" narrative is set.'],
            ['2008 crisis timing', 'Bitcoin launched into a genuine banking system crisis. The narrative was perfect and unrepeatable.'],
            ['Zero institutional competition', 'In 2009, there was no other PoW coin. Now every new PoW coin competes with Bitcoin directly from day one.'],
          ].map(([h, b], i) => (
            <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid #1a1a2e' }}>
              <div style={{ fontSize:'10px', fontWeight:'700', color:'#e2e8f0', marginBottom:'3px' }}>{i+1}. {h}</div>
              <div style={{ fontSize:'10px', color:'#64748b' }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Reject */}
      <div style={S.rscard}>
        <div style={S.rstitle}>🚫 Instant Rejection Criteria</div>
        <div style={S.rstxt}>Any coin with ONE of these is immediately excluded:</div>
        <div style={S.rejCard}>
          {[
            'No hard supply cap — infinite inflation = not a store of value',
            'Proof of Stake or hybrid — no PoW = no Bitcoin-like security model',
            'ICO or VC funding — centralized from birth, regulatory target',
            'Pre-mine > 5% — founder self-enrichment before public launch',
            'Founders reward / development tax on mining rewards',
            'EVM-compatible — competing with Ethereum, not Bitcoin',
            'Named founder with active regulatory/legal exposure',
          ].map((r, i) => (
            <div key={i} style={S.rejItem}><span style={{ flexShrink:0 }}>✕</span><span>{r}</span></div>
          ))}
        </div>
      </div>

      {/* Score Guide */}
      <div style={S.rscard}>
        <div style={S.rstitle}>📈 Score Interpretation</div>
        <div style={S.sguide}>
          {[
            { r:'90–100', col:'#22c55e',  tag:'Bitcoin Tier',  note:'Theoretical only. No other coin reaches this level.' },
            { r:'70–89',  col:'#22c55e',  tag:'Strong',        note:'Serious SoV candidate. Passes most criteria. Warrants deep research.' },
            { r:'55–69',  col:'#eab308',  tag:'Moderate',      note:'Some Bitcoin-like properties. Has at least one critical gap. Speculative.' },
            { r:'40–54',  col:'#f97316',  tag:'Weak',          note:'Fails multiple important criteria. Very high risk.' },
            { r:'0–39',   col:'#ef4444',  tag:'Reject',        note:'Not a NextBTC candidate. May serve other purposes.' },
          ].map(s => (
            <div key={s.r} style={S.sgitem(s.col)}>
              <span style={S.sgrnge(s.col)}>{s.r}</span>
              <span style={S.sgtag(s.col)}>{s.tag}</span>
              <span style={S.sgnote}>{s.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div style={S.rscard}>
        <div style={S.rstitle}>🔗 Data Sources</div>
        <div style={S.rstxt}>
          {[
            ['Live Prices + Market Cap', 'CoinGecko API — updated every 60 seconds'],
            ['Fear & Greed Index', 'alternative.me/fng — sentiment indicator'],
            ['BTC Dominance', 'CoinGecko Global Markets endpoint'],
            ['INR Exchange Rate', 'Derived from BTC USD/INR prices (CoinGecko)'],
            ['13Q Scores', 'Manual research — updated periodically by the researcher'],
            ['AI Analysis', 'Claude (Anthropic) — opinion only, not financial advice'],
          ].map(([k, v], i) => (
            <div key={i} style={{ display:'flex', gap:'8px', padding:'5px 0', borderBottom:'1px solid #1a1a2e', fontSize:'10px' }}>
              <span style={{ color:'#e2e8f0', fontWeight:'600', flex:'0 0 160px' }}>{k}</span>
              <span style={{ color:'#64748b' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  /* ──────────────────────────────────────────────────────────────────────── */
  /* RENDER                                                                  */
  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div style={S.wrap}>

      {/* Header */}
      <div style={S.hdr}>
        <h1 style={S.htitle}>₿ NextBTC Tracker</h1>
        <p style={S.hsub}>PoW coins ranked by transparent 13Q score · live prices · honest analysis</p>
      </div>

      {/* Market Signals */}
      <div style={S.mktBar}>
        {btcData && (
          <>
            <div style={S.mktItm}>
              <span>BTC</span>
              <span style={S.mktVal}>{fmtUSD(btcData.usd)}</span>
              {btcData.usd_24h_change !== undefined && (
                <span style={S.chg(btcData.usd_24h_change)}>
                  {btcData.usd_24h_change >= 0 ? '▲' : '▼'}{Math.abs(btcData.usd_24h_change).toFixed(2)}%
                </span>
              )}
            </div>
          </>
        )}
        {btcDom && (
          <div style={S.mktItm}><span>BTC Dom</span><span style={S.mktVal}>{btcDom}%</span></div>
        )}
        {fearGreed && (
          <div style={S.mktItm}>
            <span>Fear&Greed</span>
            <span style={{ ...S.mktVal, color: fearGreed.value > 75 ? '#ef4444' : fearGreed.value > 55 ? '#f97316' : fearGreed.value > 45 ? '#e2e8f0' : fearGreed.value > 25 ? '#eab308' : '#22c55e' }}>
              {fearGreed.value} — {fearGreed.value_classification}
            </span>
          </div>
        )}
        <div style={S.mktItm}><span>₹</span><span style={S.mktVal}>₹{inrRate}/USD</span></div>
        {lastUpdate && (
          <div style={{ ...S.mktItm, marginLeft:'auto', fontSize:'9px', color:'#334155' }}>
            Updated {lastUpdate.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={S.disc}>
        ⚠️ <strong>DISCLAIMER:</strong> Personal research tool only. 13Q scores are ONE researcher's opinion based on public information. Not financial advice. Crypto investments are highly speculative. Never invest more than you can lose. Always do your own research.
      </div>

      {/* BTC Reference Card — shown on nextbtc + all tabs */}
      {(tab === 'nextbtc' || tab === 'all') && (
        <div style={S.btcCard}>
          <div style={S.btcTop}>
            <div>
              <div style={S.btcLbl}>◈ Reference Benchmark</div>
              <div style={S.btcNm}>Bitcoin (BTC)</div>
              <div style={S.btcSub}>The original. Every candidate is measured against this.</div>
            </div>
            <div style={S.btcPr}>
              {btcData ? (
                <>
                  <div style={S.btcUSD}>{fmtUSD(btcData.usd)}</div>
                  <div style={S.btcINR}>{fmtINR(btcData.inr)}</div>
                  {btcData.usd_24h_change !== undefined && (
                    <div style={S.chg(btcData.usd_24h_change)}>
                      {btcData.usd_24h_change >= 0 ? '▲' : '▼'} {Math.abs(btcData.usd_24h_change).toFixed(2)}%
                    </div>
                  )}
                </>
              ) : <div style={{ color:'#334155' }}>Loading...</div>}
            </div>
          </div>
          <div style={S.cgrid}>
            {[
              ['13Q Score', '100/100 ✅'], ['Supply Cap', '21,000,000'],
              ['Age', '15+ years'], ['Consensus', 'SHA-256 PoW'],
              ['Lindy', 'Maximum'],   ['ETF', 'Approved USA ✅'],
            ].map(([l, v]) => (
              <div key={l} style={S.citem}>
                <div style={S.clbl}>{l}</div>
                <div style={S.cval}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:'9px', color:'#334155', marginTop:'10px', padding:'8px', background:'#06060e', borderRadius:'6px' }}>
            💡 Best candidate scores 72/100 vs BTC's 100. The 28-point gap represents: 15 years of survival, all-time-high hash rate security, institutional ETF money, and a missing/anonymous founder. These cannot be manufactured.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={S.tabs}>
        {[
          { k:'nextbtc',   l:`NextBTC (${COINS.filter(c=>c.category==='nextbtc').length})` },
          { k:'all',       l:`All (${COINS.length})` },
          { k:'watchlist', l:`Watchlist (${COINS.filter(c=>c.category==='watchlist').length})` },
          { k:'altcoins',  l:`Altcoins (${COINS.filter(c=>c.category==='altcoin').length})` },
          { k:'research',  l:'Research' },
        ].map(t => (
          <button key={t.k} style={S.tab(tab === t.k)} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {/* Main Content */}
      {tab === 'research' ? (
        <ResearchTab />
      ) : (
        <div style={S.list}>
          {loading && tabCoins.length === 0 && (
            <div style={S.empty}>Fetching live prices from CoinGecko…</div>
          )}
          {tabCoins.map((coin, i) => (
            <CoinCard key={coin.id} coin={coin} rank={i + 1} />
          ))}
          {!loading && tabCoins.length === 0 && (
            <div style={S.empty}>No coins in this category.</div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={S.footer}>
        ⚠️ IMPORTANT: This is a personal research project, not a financial product. Scores represent one researcher's opinion and may be wrong. Cryptocurrency markets are unregulated, highly volatile, and speculative. Past scores do not predict future price performance. "Next Bitcoin" is a research framework, not a guarantee. Always consult a qualified financial advisor before making investment decisions. Data sourced from public APIs (CoinGecko, alternative.me). AI analysis powered by Anthropic Claude.
        <br /><br />
        Built for educational research purposes only. Not affiliated with any coin project.
      </div>

    </div>
  );
}