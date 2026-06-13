import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, BookOpen, AlertTriangle, BarChart3, Plus, Search, 
  Filter, TrendingUp, Target, BrainCircuit, X, Save, Camera, 
  MoreHorizontal, Pencil, Trash2, LogOut, ChevronLeft, ChevronRight, 
  CalendarDays, HeartHandshake, Wallet, ArrowUpRight, ArrowDownRight,
  PieChart as PieIcon, Menu, ChevronUp, ChevronDown, CheckCircle2,
  Activity, TrendingDown, Calendar, Scale 
} from 'lucide-react';

import { 
  AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, Sector, ReferenceLine
} from 'recharts'; 

import AuthScreen from './AuthScreen';

import { uploadScreenshot } from "./utils/imgbb";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { addDoc, updateDoc, doc, collection, getDocs, getDoc, setDoc, deleteDoc } from "firebase/firestore";

import UpdatePasswordScreen from './UpdatePasswordScreen';

import MuyeFxLogoImage from './logo-muye-fx.svg';

// --- 耳 DESIGN SYSTEM & UTILS ---
const THEME = {
  bg: "bg-[#0C0F14]", 
  card: "bg-[#131619]", 
  cardHover: "hover:bg-[#1A1D21]",
  border: "border-white/5",
  glass: "backdrop-blur-xl bg-[#131619]/80 border-white/10",
  accent: {
    green: "#3CFF64", // Neon Green
    red: "#FF4D4D",   
    purple: "#A479FF", 
    cyan: "#4FF3F9",   
    yellow: "#FFD860"  
  },
  text: {
    primary: "text-white",
    secondary: "text-gray-400",
    muted: "text-gray-600"
  }
};

const formatCurrency = (value) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const useCountUp = (end, duration = 1500, decimals = 0) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(end * easeOut);
      if (percentage < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count.toFixed(decimals);
};

const themeConfig = {
  equity: {
    accent: '#4FF3F9', iconBg: 'bg-[#4FF3F9]/10', iconText: 'text-[#4FF3F9]',
    glow: 'shadow-[0_0_20px_rgba(79,243,249,0.15)]',
    gradientGlow: 'radial-gradient(100% 100% at 0% 0%, rgba(79,243,249,0.12) 0%, transparent 100%)',
    icon: Wallet
  },
    mistake_loss: {
    accent: '#FF2A2A', iconBg: 'bg-[#FF2A2A]/10', iconText: 'text-[#FF2A2A]',
    glow: 'shadow-[0_0_30px_rgba(255,42,42,0.25)]',
    gradientGlow: 'radial-gradient(100% 100% at 50% 100%, rgba(255,42,42,0.18) 0%, transparent 100%)',
    icon: AlertTriangle
  },
  pnl_positive: {
    accent: '#3CFF64', iconBg: 'bg-[#3CFF64]/10', iconText: 'text-[#3CFF64]',
    glow: 'shadow-[0_0_20px_rgba(60,255,100,0.15)]',
    gradientGlow: 'radial-gradient(100% 100% at 0% 0%, rgba(60,255,100,0.12) 0%, transparent 100%)',
    icon: TrendingUp
  },
  pnl_negative: {
    accent: '#FF4D4D', iconBg: 'bg-[#FF4D4D]/10', iconText: 'text-[#FF4D4D]',
    glow: 'shadow-[0_0_20px_rgba(255,77,77,0.15)]',
    gradientGlow: 'radial-gradient(100% 100% at 0% 0%, rgba(255,77,77,0.12) 0%, transparent 100%)',
    icon: TrendingDown
  },
  winrate: {
    accent: '#3CFF64', iconBg: 'bg-[#3CFF64]/10', iconText: 'text-[#3CFF64]',
    glow: 'shadow-[0_0_20px_rgba(60,255,100,0.15)]',
    gradientGlow: 'radial-gradient(100% 100% at 0% 0%, rgba(60,255,100,0.12) 0%, transparent 100%)',
    icon: Target
  },
  rr: {
    accent: '#A479FF', iconBg: 'bg-[#A479FF]/10', iconText: 'text-[#A479FF]',
    glow: 'shadow-[0_0_20px_rgba(164,121,255,0.15)]',
    gradientGlow: 'radial-gradient(100% 100% at 0% 0%, rgba(164,121,255,0.12) 0%, transparent 100%)',
    icon: Scale
  },
  best_pair: {
    accent: '#3CFF64', iconBg: 'bg-[#3CFF64]/10', iconText: 'text-[#3CFF64]',
    glow: 'shadow-[0_0_20px_rgba(60,255,100,0.15)]',
    gradientGlow: 'radial-gradient(100% 100% at 0% 0%, rgba(60,255,100,0.12) 0%, transparent 100%)',
    icon: TrendingUp
  },
  worst_pair: {
    accent: '#FF4D4D', iconBg: 'bg-[#FF4D4D]/10', iconText: 'text-[#FF4D4D]',
    glow: 'shadow-[0_0_20px_rgba(255,77,77,0.15)]',
    gradientGlow: 'radial-gradient(100% 100% at 0% 0%, rgba(255,77,77,0.12) 0%, transparent 100%)',
    icon: TrendingDown
  }
};

const InputGroup = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold tracking-wider uppercase text-gray-500">
      {label}
    </label>
    {children}
  </div>
);

const inputClass = "w-full bg-[#0C0F14] border border-white/5 focus:border-[#A479FF]/50 rounded-xl px-4 py-2.5 text-sm font-medium text-white outline-none transition-all duration-200 shadow-inner";
const selectClass = "w-full bg-[#0C0F14] border border-white/5 focus:border-[#A479FF]/50 rounded-xl px-4 py-2.5 text-sm font-medium text-white outline-none transition-all duration-200 appearance-none pr-8 shadow-inner";


// --- ｧｩ UI PRIMITIVES ---

const Card = ({ children, className = "", noPadding = false, glow = false }) => (
  <div className={`relative group rounded-2xl border ${THEME.border} ${THEME.card} transition-all duration-300 ${glow ? 'hover:shadow-[0_0_20px_rgba(164,121,255,0.1)] hover:border-white/10' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
    <div className={noPadding ? "" : "p-4 sm:p-5 md:p-6 lg:p-8"}>
      {children}
    </div>
  </div>
);

const Badge = ({ children, type = 'neutral', className = "" }) => {
  const styles = {
    win: `bg-[#3CFF64]/10 text-[#3CFF64] border-[#3CFF64]/20`,
    loss: `bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/20`,
    neutral: `bg-[#4FF3F9]/10 text-[#4FF3F9] border-[#4FF3F9]/20`,
    purple: `bg-[#A479FF]/10 text-[#A479FF] border-[#A479FF]/20`,
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest border ${styles[type] || styles.neutral} ${className}`}>
      {children}
    </span>
  );
};

const IconButton = ({ icon: Icon, onClick, variant = "ghost", className = "" }) => {
  const base = "p-2 rounded-lg transition-all duration-200 flex items-center justify-center";
  const variants = {
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    primary: "bg-[#A479FF] text-white hover:bg-[#9361FF] shadow-lg shadow-[#A479FF]/20",
    danger: "text-gray-400 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10"
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      <Icon size={18} />
    </button>
  );
};


// --- CUSTOM LOADING COMPONENT ---

const JournalLoading = () => (
    <div className="flex justify-center items-center h-96 flex-col">
        {/* Use BrainCircuit icon with the green accent color and the custom slow spin animation */}
        <BrainCircuit size={48} className="text-[#3CFF64] animate-spin-slow" /> 
        <p className="mt-4 text-gray-400">Loading Journal Data...</p>
    </div>
);


// --- 投 ANALYTICS & UTILITIES ---

const TRADEABLE_ASSETS = {
  'Forex Majors': [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD',
    'USD/CAD', 'USD/CHF', 'NZD/USD'
  ],
  'Forex Minors': [
    'EUR/GBP', 'EUR/JPY', 'EUR/AUD', 'EUR/CAD', 'EUR/NZD', 'EUR/CHF',
    'EUR/SEK', 'EUR/NOK', 'EUR/DKK', 'EUR/TRY', 'EUR/ZAR',
    'GBP/JPY', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD', 'GBP/CHF',
    'GBP/SEK', 'GBP/NOK', 'GBP/DKK', 'GBP/TRY',
    'AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'NZD/JPY', 'SEK/JPY', 'NOK/JPY',
    'AUD/CAD', 'AUD/NZD', 'AUD/CHF', 'CAD/CHF', 'NZD/CAD'
  ],
  'Metals': ['XAU/USD (Gold)', 'XAG/USD (Silver)', 'XPT/USD (Platinum)', 'XPD/USD (Palladium)', 'COPPER'],
  'Indices': ['US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'FRA40', 'JPN225', 'AUS200', 'VIX', 'HK50'],
  'Cryptos': ['BTC/USD', 'ETH/USD', 'LTC/USD', 'XRP/USD', 'ADA/USD', 'DOT/USD', 'BNB/USD', 'SOL/USD'],
  'Other': {
    type: 'custom_input',
    placeholder: 'Enter custom symbol (e.g., AAPL, TSLA, BRENT)'
  }
};

function AssetSelector() {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');

  // Build options except for 'Other'
  const assetOptions = useMemo(() => {
    return Object.entries(TRADEABLE_ASSETS).flatMap(([group, pairs]) => {
      if (group === 'Other') return []; // skip 'Other'
      return [
        <option key={group} disabled className="text-gray-600 bg-[#0C0F14]">
          {group.toUpperCase()}
        </option>,
        ...pairs.map(pair => (
          <option key={pair} value={pair} className="text-white bg-[#0C0F14]">
            {pair}
          </option>
        ))
      ];
    });
  }, []);

  // Handle change for select
  const handleSelectChange = e => {
    setSelectedAsset(e.target.value);
    if (e.target.value !== 'Other') {
      setCustomSymbol(''); // reset custom input if not Other
    }
  };

  return (
    <div className="p-4 bg-[#0C0F14] rounded-md max-w-md mx-auto text-white">
      <label htmlFor="asset-select" className="block mb-2 font-semibold">
        Select Tradeable Asset
      </label>
      <select
        id="asset-select"
        value={selectedAsset}
        onChange={handleSelectChange}
        className="w-full p-2 mb-4 bg-[#131619] border border-gray-700 rounded text-white"
      >
        {assetOptions}
        <option value="Other" className="text-white bg-[#0C0F14]">
          Other (custom symbol)
        </option>
      </select>

      {selectedAsset === 'Other' && (
        <>
          <label htmlFor="custom-symbol" className="block mb-2 font-semibold">
            Enter Custom Symbol
          </label>
          <input
            id="custom-symbol"
            type="text"
            placeholder={TRADEABLE_ASSETS.Other.placeholder}
            value={customSymbol}
            onChange={e => setCustomSymbol(e.target.value)}
            className="w-full p-2 bg-[#131619] border border-gray-700 rounded text-white"
          />
        </>
      )}

      {/* For demonstration */}
      <div className="mt-4">
        <strong>Selected Asset:</strong>{' '}
        {selectedAsset === 'Other' ? customSymbol || '(none entered)' : selectedAsset || '(none selected)'}
      </div>
    </div>
  );
}
const getKPIs = (trades, startingBalance) => { 
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const totalTrades = trades.length;
  const winsCount = trades.filter(t => t.outcome === 'WIN').length; 
  const lossesCount = trades.filter(t => t.outcome === 'LOSS').length; 
  
  const winRate = totalTrades > 0 ? (winsCount / totalTrades) * 100 : 0;
  
  const initialEquity = startingBalance > 0 ? startingBalance : 10000;
  const pnlPercentage = initialEquity !== 0 ? (totalPnL / initialEquity) * 100 : 0;
  
  const wins = trades.filter(t => t.outcome === 'WIN');
  const losses = trades.filter(t => t.outcome === 'LOSS');
  const avgWin = winsCount > 0 ? wins.reduce((acc, t) => acc + t.pnl, 0) / winsCount : 0;
  const avgLoss = lossesCount > 0 ? Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0)) / lossesCount : 0;
  const rr = avgLoss > 0 ? (avgWin / avgLoss) : 0;

  return { totalPnL, winRate, rr, totalTrades, pnlPercentage, winsCount, lossesCount };
};

const getCalendarData = (trades) => {
  const dailyData = {};
  trades.forEach(trade => {
    if (!dailyData[trade.date]) dailyData[trade.date] = { pnl: 0, count: 0 };
    dailyData[trade.date].pnl += trade.pnl;
    dailyData[trade.date].count += 1;
  });
  return dailyData;
};

const getPairAnalytics = (trades) => {
    const pairPnL = trades.reduce((acc, trade) => {
        acc[trade.pair] = (acc[trade.pair] || 0) + trade.pnl;
        return acc;
    }, {});
    const sortedPairs = Object.entries(pairPnL)
        .map(([pair, pnl]) => ({ pair, pnl, trades: trades.filter(t => t.pair === pair).length }))
        .sort((a, b) => b.pnl - a.pnl);
    const mostProfitable = sortedPairs.length > 0 ? sortedPairs[0] : null;
    const worstPerforming = sortedPairs.length > 0 ? sortedPairs[sortedPairs.length - 1] : null;
    const top5 = sortedPairs.slice(0, 5);
    const bottom5 = sortedPairs.slice(-5);
    const chartData = [...top5, ...bottom5]
        .filter((item, index, self) => index === self.findIndex((t) => (t.pair === item.pair)))
        .sort((a, b) => b.pnl - a.pnl);
    return { mostProfitable, worstPerforming, chartData };
};

const getTimeAndStrategyAnalytics = (trades) => {
    const SESSIONS = ['Asian', 'London', 'NYC', 'Close'];
    const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const analytics = { sessionPnL: {}, dayPnL: {}, strategyPnL: {} };
    DAYS_OF_WEEK.forEach((day, index) => { analytics.dayPnL[day] = { pnl: 0, trades: 0, order: index }; });

    trades.forEach(trade => {
        const session = trade.session || 'Unspecified';
        analytics.sessionPnL[session] = (analytics.sessionPnL[session] || 0) + trade.pnl;
        const tradeDate = new Date(trade.date + 'T00:00:00Z');
        let dayIndex = tradeDate.getUTCDay();
        dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        const day = DAYS_OF_WEEK[dayIndex];
        if (analytics.dayPnL[day]) {
             analytics.dayPnL[day].pnl += trade.pnl;
             analytics.dayPnL[day].trades += 1;
        }
        const strategy = trade.setup || 'Unspecified';
        analytics.strategyPnL[strategy] = (analytics.strategyPnL[strategy] || 0) + trade.pnl;
    });

    const sessionData = Object.entries(analytics.sessionPnL).map(([name, pnl]) => ({ name, pnl })).sort((a, b) => SESSIONS.indexOf(a.name) - SESSIONS.indexOf(b.name));
    const dayData = Object.values(analytics.dayPnL).filter(d => d.trades > 0).sort((a, b) => a.order - b.order).map(d => ({ name: DAYS_OF_WEEK[d.order], pnl: d.pnl }));
    const strategyData = Object.entries(analytics.strategyPnL).map(([name, pnl]) => ({ name, pnl })).sort((a, b) => b.pnl - a.pnl);

    return { sessionData, dayData, strategyData };
};

const getMistakeAnalytics = (trades) => {
    const mistakeTrades = trades.filter(t => t.mistake && t.mistake.length > 0);
    const totalMistakePnL = mistakeTrades.reduce((acc, t) => acc + t.pnl, 0);
    const frequencyMap = mistakeTrades.reduce((acc, t) => {
        acc[t.mistake] = (acc[t.mistake] || 0) + 1;
        return acc;
    }, {});
    const frequencyData = Object.entries(frequencyMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { totalMistakePnL, frequencyData, mistakeTrades };
};

// --- ｧｱ REUSABLE CHART COMPONENT ---

const ModernBarChart = ({
  data = [],
  title = "Performance Analytics",
  keyName = "name",
  valueKey = "pnl",
  height = 350,
  className = ""
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      ...item,
      // FIX: much more generous truncation limit
            displayName: item[keyName] && item[keyName].length > 14 ? `${item[keyName].substring(0, 12)}...` : item[keyName]
    }));
  }, [data, keyName]);


  if (!data || data.length === 0) {
    return (
      <div className={`bg-[#131619] rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-gray-500 min-h-[300px] ${className}`}>
        <Activity className="mb-2 opacity-20 animate-pulse" size={40} />
        <p className="text-sm font-medium tracking-tight">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-[#131619] rounded-2xl border border-white/5 p-6 shadow-2xl transition-all duration-500 hover:border-white/10 ${className}`}>
      {/* Header */}
{/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
            {title}
          </h3>
          <p className="text-gray-500 text-xs mt-1 font-medium italic"></p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="neutralGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              vertical={false} 
              strokeDasharray="0" 
              stroke="#ffffff08" 
            />
            
             <XAxis 
              dataKey="displayName" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
              dy={10}
            />

            />
              <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(val) => `$${val}`}
            />

              <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  const isProfit = value > 0;
                  const isLoss = value < 0;
                  // FIX: show the full original name on hover, not the truncated axis label
                  const fullName = payload[0].payload[keyName] || label;
                  return (
                    <div className="bg-[#0C0F14]/90 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md ring-1 ring-white/10 animate-in fade-in zoom-in duration-200">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{fullName}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold ${isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-500' : 'text-cyan-400'}`}>
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}
                        </span>
                        {isProfit ? <TrendingUp size={14} className="text-emerald-400" /> : isLoss ? <TrendingDown size={14} className="text-rose-500" /> : null}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={false}
              animationDuration={150}
            />

            <Bar 
              dataKey={valueKey} 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {processedData.map((entry, index) => {
                const val = entry[valueKey];
                const isHovered = hoveredIndex === index;
                
                let fillUrl = "url(#neutralGrad)";
                let strokeColor = "#22d3ee";
                
                if (val > 0) {
                  fillUrl = "url(#profitGrad)";
                  strokeColor = "#10b981";
                } else if (val < 0) {
                  fillUrl = "url(#lossGrad)";
                  strokeColor = "#f43f5e";
                }

                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fillUrl}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 2 : 1}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      filter: isHovered 
                        ? `drop-shadow(0 0 12px ${strokeColor}88) brightness(1.3)` 
                        : `drop-shadow(0 0 4px ${strokeColor}22)`,
                      opacity: hoveredIndex === null || isHovered ? 1 : 0.4,
                      transformOrigin: 'bottom'
                    }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-5">
        <div className="flex gap-5">
          <div className="flex items-center gap-2 group cursor-help">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[10px] text-gray-500 group-hover:text-gray-300 uppercase tracking-widest font-bold transition-colors">Net Profit</span>
          </div>
          <div className="flex items-center gap-2 group cursor-help">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
            <span className="text-[10px] text-gray-500 group-hover:text-gray-300 uppercase tracking-widest font-bold transition-colors">Drawdown</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};
// --- ｧｩ DASHBOARD WIDGETS ---

const MuyeFXLogo = () => (
  <div className="flex items-center justify-start gap-3 px-2">
    <img
      src={MuyeFxLogoImage}
      alt="MuyeFX Logo"
      className="h-10 w-auto object-contain"
    />
    <span
      className="text-2xl font-black tracking-[-0.03em]"
      style={{ color: '#EBEBEB', fontFamily: "Inter Variable, Inter, sans-serif" }}
    >
      MUYE<span style={{ color: THEME.accent.green }}>FX</span>
    </span>
  </div>
);

const Sidebar = ({ currentView, setCurrentView, triggerSignOut }) => { 
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'mistakes', icon: AlertTriangle, label: 'Mistakes' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-20 flex items-center justify-start px-6 border-b border-white/5">
        <MuyeFXLogo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const active = currentView === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group
                ${active ? 'bg-[#A479FF]/10 text-[#A479FF]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={20} className={active ? "text-[#A479FF]" : "group-hover:text-white"} />
              <span className="text-[15px] font-semibold tracking-[-0.01em]">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#A479FF] shadow-[0_0_10px_#A479FF]" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-[#0C0F14]">
        <button onClick={triggerSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const KpiCard = ({ 
  title, value, type, prefix = '', suffix = '', decimals = 0,
  trendValue, trendPositive, subLabel, extraLabel,
  amount,           
  amountPrefix = '', 
  className = 'min-h-[150px]', valueClassName = 'text-white'
}) => {
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(value, 2000, decimals);
  const animatedAmount = useCountUp(amount ?? 0, 2000, 2); 
  let themeKey = type;
  if (type === 'pnl') themeKey = value >= 0 ? 'pnl_positive' : 'pnl_negative';
  const theme = themeConfig[themeKey];
  const Icon = theme.icon;

  const fmt = (val) => {
    const p = val.toString().split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return p.join('.');
  };

  return (
    <div className={`group relative rounded-2xl bg-[#131619] p-6 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl border border-white/5 hover:border-white/10 flex flex-col justify-between cursor-default ${className}`}>
      <div className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" style={{ background: theme.gradientGlow }} />
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
      <div className="relative flex justify-between items-start w-full z-10 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${theme.iconBg} ${theme.glow} ring-1 ring-white/5 transition-all duration-300 group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${theme.iconText}`} strokeWidth={2.5} />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-sm ring-1 ring-white/5 ${trendPositive ? 'text-[#3CFF64]' : 'text-[#FF4D4D]'}`}>
            {trendPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div className="relative z-10 w-full mt-auto">
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          {isNumeric && prefix && <span className="text-base font-semibold text-gray-400">{prefix}</span>}
          <span className={`${isNumeric ? 'text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight truncate' : 'text-base sm:text-xl font-bold truncate'} ${valueClassName}`}>
            {isNumeric ? fmt(animatedValue) : value}
          </span>
          {isNumeric && suffix && <span className="text-base font-semibold text-gray-400">{suffix}</span>}
        </div>

        {amount !== undefined && (
          <div className={`text-sm font-bold mt-1.5 ${theme.iconText}`}>
            {amountPrefix}{fmt(animatedAmount)}
          </div>
        )}

        {(subLabel || extraLabel) && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.02]">
            {subLabel && <p className="text-xs font-medium text-gray-400 truncate">{subLabel}</p>}
            {extraLabel && <div className="flex items-center">{extraLabel}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00Z');
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const CalendarTooltip = ({ data, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX + 15, y: e.clientY + 15 });
  };
  return (
    <div className="relative w-full h-full" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} onMouseMove={handleMouseMove}>
      {children}
      {isVisible && data && (
        <div className="fixed z-50 pointer-events-none" style={{ left: position.x, top: position.y }}>
          <div className="bg-[#0C0F14] border border-gray-800 p-3 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
            <span className="text-gray-400 text-xs font-medium tracking-wider uppercase mb-1">{formatDate(data.date)}</span>
            {data.count > 0 ? (
              <>
                <div className="flex justify-between items-center w-full">
                  <span className="text-gray-400 text-sm">PnL</span>
                  <span className={`text-sm font-bold ${data.pnl > 0 ? 'text-[#3CFF64]' : data.pnl < 0 ? 'text-[#FF4D4D]' : 'text-[#4FF3F9]'}`}>
                    {data.pnl === 0 ? '$0' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(data.pnl)}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-gray-400 text-sm">Trades</span>
                  <span className="text-[#3CFF64] text-sm font-medium">{data.count}</span>
                </div>
              </>
            ) : (
              <span className="text-gray-500 text-sm italic">No trading data</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarWidget = ({ trades }) => {
  const [date, setDate] = useState(new Date());
  const dailyData = useMemo(() => getCalendarData(trades), [trades]);
  
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); 
  const offset = startDay === 0 ? 6 : startDay - 1; 
  const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

  const maxAbsPnl = useMemo(() => {
    const values = Object.values(dailyData).map(d => Math.abs(d.pnl)).filter(v => v > 0);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [dailyData]);

  const getIntensityStyles = (pnl, isBreakEven) => {
    if (isBreakEven) {
      return {
        text: 'text-[#4FF3F9]',
        glow: 'inset 0 0 12px rgba(79,243,249,0.15)',
        gradient: 'linear-gradient(135deg, rgba(79,243,249,0.05), rgba(79,243,249,0.1))'
      };
    }
    const ratio = Math.min(Math.abs(pnl) / (maxAbsPnl || 1), 1);
    const intensity = 0.15 + (ratio * 0.7);
    if (pnl > 0) {
      return {
        text: 'text-[#3CFF64]',
        glow: `inset 0 0 ${10 + ratio * 20}px rgba(60,255,100,${intensity * 0.4})`,
        gradient: `linear-gradient(135deg, rgba(60,255,100,${intensity * 0.1}), rgba(60,255,100,${intensity * 0.3}))`
      };
    } else {
      return {
        text: 'text-[#FF4D4D]',
        glow: `inset 0 0 ${10 + ratio * 20}px rgba(255,77,77,${intensity * 0.4})`,
        gradient: `linear-gradient(135deg, rgba(255,77,77,${intensity * 0.1}), rgba(255,77,77,${intensity * 0.3}))`
      };
    }
  };

  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <Card className="w-full overflow-hidden min-w-0" noPadding>
      <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-sm sm:text-lg font-semibold tracking-[-0.02em] text-white flex items-center gap-3">
          <CalendarDays size={18} className="text-[#4FF3F9]" /> Performance Heatmap
        </h3>
        <div className="flex items-center gap-2">
          <IconButton icon={ChevronLeft} onClick={() => setDate(new Date(year, month - 1, 1))} />
          <span className="text-[10px] sm:text-xs font-medium text-gray-300 w-24 sm:w-32 text-center">{monthName}</span>
          <IconButton icon={ChevronRight} onClick={() => setDate(new Date(year, month + 1, 1))} />
        </div>
      </div>
      
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-400 border-b border-white/5 bg-black/10">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3CFF64] shadow-[0_0_8px_rgba(60,255,100,0.5)]"></div>
          <span>Profit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D] shadow-[0_0_8px_rgba(255,77,77,0.5)]"></div>
          <span>Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4FF3F9] shadow-[0_0_8px_rgba(79,243,249,0.5)]"></div>
          <span>Break-even</span>
        </div>
      </div>
      
      <div className="p-5 sm:p-6 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2 min-w-[280px]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-[10px] sm:text-[11px] font-medium text-gray-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[280px]">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="aspect-square rounded-lg bg-[#1A1D21]/30" />;
            
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const data = dailyData[dateKey];
            const hasData = data && data.count > 0;
            const isBreakEven = hasData && data.pnl === 0;
            const styles = hasData ? getIntensityStyles(data.pnl, isBreakEven) : null;
            
            return (
              <CalendarTooltip key={i} data={hasData ? { date: dateKey, pnl: data.pnl, count: data.count } : null}>
                <div 
                  className={`
                    aspect-square relative rounded-md sm:rounded-xl p-0.5 sm:p-2 flex flex-col justify-between transition-all duration-300 cursor-pointer group
                    ${hasData ? 'hover:scale-[1.05] hover:z-10' : 'opacity-60'}
                    ${!hasData ? 'bg-[#1A1D21]/30 border border-[#1A1D21]/50' : ''}
                  `}
                  style={hasData ? {
                    background: styles.gradient,
                    boxShadow: styles.glow,
                    borderColor: isBreakEven ? 'rgba(79, 243, 249, 0.3)' : (data.pnl > 0 ? 'rgba(60, 255, 100, 0.3)' : 'rgba(255, 77, 77, 0.3)')
                  } : undefined}
                >
                  <span className={`text-[10px] sm:text-xs font-medium ${hasData ? 'text-white' : 'text-gray-600'}`}>{d}</span>
                  {hasData && (
                    <div className="text-right">
                      <div className={`text-[10px] sm:text-[11px] font-bold tracking-tight ${styles.text} drop-shadow-md truncate`}>
                        {data.pnl === 0 ? 'BE' : (Math.abs(data.pnl) >= 1000 ? `${(data.pnl/1000).toFixed(1)}k` : data.pnl)}
                      </div>
                      <div className="hidden sm:block text-[10px] text-gray-400 mt-0.5 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                        {data.count} trades
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-md sm:rounded-xl bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
                </div>
              </CalendarTooltip>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

const pulseStyle = `
  @keyframes pulse-glow {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.6); opacity: 0.3; }
    100% { transform: scale(1); opacity: 0.8; }
  }
  .animate-pulse-glow {
    animation: pulse-glow 2.5s infinite ease-in-out;
  }
`;

const EquityCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const startingBalance = payload[0].payload.startingBalance;
    const isProfitable = value >= startingBalance;
    const diff = value - startingBalance;

    return (
      <div className="bg-[#0C0F14] border border-[#ffffff15] p-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-2 text-[#64748b] text-[10px] font-bold uppercase tracking-widest">
          <Calendar size={10} className="opacity-70" />
          {payload[0].payload.date}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
            </span>
          </div>
          <div className={`text-[10px] flex items-center gap-1 font-semibold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
             {isProfitable ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
             {diff >= 0 ? '+' : ''}{diff.toLocaleString()} ({( (diff/startingBalance) * 100 ).toFixed(2)}%)
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomActiveDot = (props) => {
  const { cx, cy, stroke, index, dataLength } = props;
  if (index !== dataLength - 1) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={stroke} className="animate-pulse-glow" />
      <circle cx={cx} cy={cy} r={6} fill={stroke} opacity="0.3" />
      <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="#0C0F14" strokeWidth={2} />
    </g>
  );
};

const EquityCurveWidget = ({ trades, startingBalance }) => {
  const validStartingBalance = Number(startingBalance) || 10000;
  
  const processedData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return [{ 
        date: new Date().toISOString().substring(0, 10), 
        balance: validStartingBalance,
        startingBalance: validStartingBalance 
      }];
    }
    
    let runningBalance = validStartingBalance;
    const data = trades.slice().reverse().map(t => {
      const validPnl = Number(t.pnl) || 0;
      runningBalance += validPnl;
      return { 
        date: t.date, 
        balance: Number(runningBalance.toFixed(2)),
        startingBalance: validStartingBalance
      };
    });
    
    return data;
  }, [trades, validStartingBalance]);

  const currentBalance = processedData[processedData.length - 1]?.balance || validStartingBalance;
  const isProfitable = currentBalance >= validStartingBalance;
  const mainColor = isProfitable ? '#A479FF' : '#EF4444';
  const pnl = currentBalance - validStartingBalance;
  const pnlPercent = ((pnl / validStartingBalance) * 100).toFixed(2);

  const balances = processedData.map(d => d.balance);
  const minBal = Math.min(...balances, validStartingBalance);
  const maxBal = Math.max(...balances, validStartingBalance);
  const range = maxBal - minBal;
  const domain = [
    Math.floor(minBal - (range * 0.15 || 500)), 
    Math.ceil(maxBal + (range * 0.15 || 500))
  ];

  return (
    <div className="w-full h-full flex flex-col group select-none">
      <style>{pulseStyle}</style>

      {/* Header Info Section */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#A479FF] shadow-[0_0_8px_#A479FF]" />
            <h3 className="text-[#64748b] text-[12px] font-bold uppercase tracking-[0.2em]">Equity Curve</h3>
          </div>
          <div className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-lg ${isProfitable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {isProfitable ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {pnlPercent}%
          </div>
        </div>
        
        <div className="text-right hidden sm:block">
          <p className="text-[#64748b] text-[10px] uppercase tracking-widest font-bold mb-1 opacity-60">Session P/L</p>
          <p className={`text-sm font-mono font-bold ${pnl >= 0 ? 'text-[#A479FF]' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} <span className="text-[10px] opacity-50">USD</span>
          </p>
        </div>
      </div>


      {/* Chart - Fixed height container */}
      <div className="relative w-full h-[250px] sm:h-[310px] px-2 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={processedData}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={mainColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <CartesianGrid vertical={false} stroke="#ffffff08" strokeDasharray="8 8" />
            
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
              minTickGap={60}
              dy={15}
            />

            <YAxis 
              domain={domain}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
              tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(0) + 'k' : val}`}
            />

            <Tooltip 
              content={<EquityCustomTooltip />} 
              cursor={{ stroke: '#ffffff15', strokeWidth: 1.5 }}
              animationDuration={200}
            />

            <ReferenceLine y={validStartingBalance} stroke="#ffffff10" strokeDasharray="4 4" />

            <Area
              type="monotone"
              dataKey="balance"
              stroke={mainColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorEquity)"
              filter="url(#glow)"
              animationBegin={200}
              animationDuration={2000}
              animationEasing="ease-in-out"
              activeDot={<CustomActiveDot dataLength={processedData.length} />}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- 淘 VIEWS: ANALYTICS & MISTAKES ---

const AnalyticsView = ({ trades }) => {
    const { mostProfitable, worstPerforming, chartData: pairChartData } = getPairAnalytics(trades);
    const { sessionData, dayData, strategyData } = getTimeAndStrategyAnalytics(trades);

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ModernBarChart data={pairChartData} title="Top & Bottom Pairs" keyName="pair" valueKey="pnl" />
                <ModernBarChart data={strategyData} title="Strategy Performance" keyName="name" valueKey="pnl" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ModernBarChart data={sessionData} title="Session Performance" keyName="name" valueKey="pnl" />
                <ModernBarChart data={dayData} title="Day of Week Performance" keyName="name" valueKey="pnl" />
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {mostProfitable ? (
                    <KpiCard 
                        title="Most Profitable Pair" 
                        value={mostProfitable.pair} 
                        type="best_pair"
                        amount={mostProfitable.pnl}
                        amountPrefix="+$"
                        subLabel="Most Profitable Asset"
                    />
                ) : (
                    <Card className="min-w-0">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Most Profitable Pair</div>
                        <div className="text-gray-500">N/A</div>
                    </Card>
                )}

                {worstPerforming ? (
                    <KpiCard 
                        title="Worst Performing Pair" 
                        value={worstPerforming.pair} 
                        type="worst_pair" 
                        amount={worstPerforming.pnl}
                        amountPrefix="$"
                        subLabel="Lowest Yield Asset"
                    />
                ) : (
                    <Card className="min-w-0">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Worst Performing Pair</div>
                        <div className="text-gray-500">N/A</div>
                    </Card>
                )}
            </div>
        </div>
    );
};

const MistakeTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0C0F14]/90 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md ring-1 ring-white/10 animate-in fade-in zoom-in duration-200">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{data.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white">
            {data.value} <span className="text-gray-500 text-xs font-normal normal-case tracking-normal">occurrences</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const MISTAKE_COLORS = [
  { solid: '#FF4D4D', light: 'rgba(255, 77, 77, 0.15)' },   // Red
  { solid: '#A479FF', light: 'rgba(164, 121, 255, 0.15)' },  // Purple
  { solid: '#4FF3F9', light: 'rgba(79, 243, 249, 0.15)' },   // Cyan
  { solid: '#FFD860', light: 'rgba(255, 216, 96, 0.15)' },   // Yellow
  { solid: '#3CFF64', light: 'rgba(60, 255, 100, 0.15)' },   // Green
];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 6} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill} opacity={0.3} cornerRadius={2}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4} outerRadius={outerRadius + 4}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill} cornerRadius={10}
      />
    </g>
  );
};

const MistakeLegend = ({ data, activeIndex, setActiveIndex }) => (
  <div className="flex flex-col gap-2 w-full lg:max-w-[280px]">
    <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2 ml-1">Breakdown</h3>
    {data.map((entry, index) => (
      <div 
        key={`legend-${index}`}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
        className={`group flex items-center justify-between p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
          activeIndex === index 
            ? 'bg-white/5 border border-white/10 translate-x-1 shadow-lg' 
            : 'bg-transparent border border-transparent opacity-60 hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-1.5 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: entry.fillColor,
              boxShadow: activeIndex === index ? `0 0 15px ${entry.fillColor}` : 'none',
              height: activeIndex === index ? '24px' : '16px'
            }} 
          />
          <div className="flex flex-col">
            <span className="text-white text-[13px] font-semibold leading-tight">{entry.name}</span>
            <span className="text-gray-500 text-[10px] font-mono">{entry.value} trades</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-white font-bold text-xs">{entry.percent}%</span>
        </div>
      </div>
    ))}
  </div>
);

const MistakeDonutChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const processedData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return [...data]
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
        fillColor: MISTAKE_COLORS[index % MISTAKE_COLORS.length].solid,
        gradId: `mistake-grad-${index}`
      }));
  }, [data]);

  const totalMistakes = processedData.reduce((sum, item) => sum + item.value, 0);
  const hoveredItem = activeIndex !== null ? processedData[activeIndex] : null;
  const topMistake = processedData[0];

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-[#131619] rounded-[2.5rem] p-6 sm:p-10 border border-white/5 shadow-2xl flex flex-col items-center justify-center text-gray-500 min-h-[400px]">
        <Activity className="mb-2 opacity-20 animate-pulse" size={40} />
        <p className="text-sm font-medium tracking-tight">No mistake data available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#131619] rounded-[2.5rem] p-6 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden group/card">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D4D]/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-white tracking-tight italic">MISTAKE REVIEW</h2>
            <div className="h-1 w-8 bg-[#FF4D4D] rounded-full" />
          </div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Review your mistakes</p>
        </div>
        
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 xl:gap-16 relative z-10">
        {/* Chart Area */}
        <div className="relative w-full aspect-square max-w-[360px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {processedData.map((entry) => (
                  <linearGradient key={entry.gradId} id={entry.gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.fillColor} />
                    <stop offset="100%" stopColor={entry.fillColor} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>

              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={processedData}
                cx="50%" cy="50%"
                innerRadius="65%" outerRadius="82%"
                paddingAngle={8} dataKey="value" stroke="none"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationBegin={0} animationDuration={1200}
                animationEasing="cubic-bezier(0.2, 0, 0.2, 1)"
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#${entry.gradId})`}
                    className="transition-all duration-300 outline-none"
                    style={{
                      opacity: activeIndex === null || activeIndex === index ? 1 : 0.2,
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Dynamic Center Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div className={`transition-all duration-500 ease-out transform ${hoveredItem ? '-translate-y-2' : 'translate-y-0'}`}>
              
            </div>

            <div className="relative h-16 flex items-center justify-center my-1">
              <div className={`absolute transition-all duration-500 transform ${hoveredItem ? 'opacity-0 scale-75 translate-y-4' : 'opacity-100 scale-100'}`}>
                <span className="text-6xl font-black text-white tracking-tighter leading-none italic">{totalMistakes}</span>
              </div>
              <div className={`absolute transition-all duration-500 transform ${hoveredItem ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-125 -translate-y-4'}`}>
                <span className="text-5xl font-black tracking-tighter leading-none italic" style={{ color: hoveredItem?.fillColor }}>
                  {hoveredItem?.value}
                </span>
              </div>
            </div>

            <div className={`transition-all duration-500 transform ${hoveredItem ? 'translate-y-2 opacity-100' : 'translate-y-0 opacity-100'}`}>
              {hoveredItem ? (
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-white text-[11px] font-bold uppercase tracking-wider">{hoveredItem.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[#3CFF64]">
                  <Activity size={12} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest italic">Live Metrics</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <MistakeLegend data={processedData} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </div>

      {/* Footer Insight */}
      <div className="mt-10 p-5 bg-[#0C0F14] rounded-3xl border border-white/5 flex items-center gap-5 transition-all duration-500">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all duration-500"
          style={{ 
            backgroundColor: hoveredItem ? `${hoveredItem.fillColor}15` : 'rgba(255, 77, 77, 0.1)',
            borderColor: hoveredItem ? `${hoveredItem.fillColor}30` : 'rgba(255, 77, 77, 0.2)'
          }}>
          <TrendingDown style={{ color: hoveredItem ? hoveredItem.fillColor : '#FF4D4D' }} size={24} className="transition-colors duration-500" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
            {hoveredItem ? `Focus : ${hoveredItem.name}` : 'Most Frequent Occurance'}
          </p>
          <p className="text-white text-sm mt-1 leading-relaxed line-clamp-2">
            {hoveredItem 
              ? `This mistake occurs in ${hoveredItem.percent}% of failed trades.` 
              : `${topMistake?.name || 'N/A'} is your main problem. Improve your stategy here. It has occured ${topMistake?.value || 0} times.`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

const MistakesView = ({ trades, onEdit, onDelete }) => {
    const { totalMistakePnL, frequencyData, mistakeTrades } = getMistakeAnalytics(trades);

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <KpiCard 
                    title="Total Loss (Mistakes)" 
                    value={Math.abs(totalMistakePnL)} 
                    type="mistake_loss" 
                    prefix="-$"
                    decimals={2}
                    className="h-full min-h-[140px] sm:min-h-[160px] xl:min-h-full border-[#FF2A2A]/20" 
                    valueClassName="text-[#FF2A2A] drop-shadow-[0_0_12px_rgba(255,42,42,0.6)]"
                />

                <div className="col-span-1 lg:col-span-2">
                    <MistakeDonutChart data={frequencyData} />
                </div>
            </div>

            {mistakeTrades.length === 0 ? (
                <Card noPadding className="w-full overflow-hidden min-w-0">
                    <div className="p-4 sm:p-6 border-b border-white/5">
                        <h3 className="text-xl font-semibold tracking-[-0.02em] text-white flex items-center gap-2">
                            <HeartHandshake className="text-[#3CFF64]" size={20} /> Trade Review & Corrections
                        </h3>
                    </div>
                    <div className="p-8 text-center text-gray-500">No mistakes logged. Keep it up!</div>
                </Card>
            ) : (
                <TradeList 
                    trades={mistakeTrades} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    showHeader 
                    title="Trade Review & Corrections" 
                />
            )}
        </div>
    );
};

// --- 統 TRADE LIST & CARD COMPONENTS ---

const MobileTradeCard = ({ trade, onExpand, isExpanded, onEdit, onDelete }) => (
  <div className="bg-[#131619] border border-white/5 rounded-xl p-4 mb-3">
    <div className="flex justify-between items-start mb-2" onClick={onExpand}>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base">{trade.pair}</span>
          <span className={`text-[12px] font-medium px-1.5 py-0.5 rounded ${trade.type === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {trade.type}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{trade.date}</div>
      </div>
      <div className="text-right">
        <div className={`font-mono font-bold text-base ${trade.pnl > 0 ? 'text-[#3CFF64]' : trade.pnl < 0 ? 'text-[#FF4D4D]' : 'text-gray-400'}`}>
           {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
        </div>
        <div className="mt-1"><Badge type={trade.outcome === 'WIN' ? 'win' : 'loss'}>{trade.outcome}</Badge></div>
      </div>
    </div>
    
    {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
             {/* Prices */}
             {(trade.entry || trade.exit) && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0C0F14] p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Entry Price</p>
                        <p className="text-sm text-gray-300 font-mono">{trade.entry || '-'}</p>
                    </div>
                    <div className="bg-[#0C0F14] p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Exit Price</p>
                        <p className="text-sm text-gray-300 font-mono">{trade.exit || '-'}</p>
                    </div>
                </div>
            )}
             {/* Notes */}
             {trade.notes && (
                <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Notes</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{trade.notes}</p>
                </div>
            )}
            
            {/* Setup */}
            {trade.setup && (
                <div className='flex gap-2 items-center'>
                     <p className="text-[10px] text-gray-500 uppercase font-semibold">Strategy:</p>
                     <p className="text-sm text-gray-300">{trade.setup}</p>
                </div>
            )}

            {/* Chart Screenshot - ADDED for consistency and cleaned up display */}
            {trade.screenshot_url && (
                <div className="p-3 rounded-lg bg-[#0C0F14] border border-[#A479FF]/20 flex items-center justify-between">
                    <p className="text-[#A479FF] font-semibold uppercase text-[10px]">Chart Screenshot</p>
                    <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#A479FF] hover:text-white transition-colors" >
                        <Camera size={14} /> View Image
                    </a>
                </div>
            )}

            {/* Tags & Actions */}
            <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1 flex-wrap">
                    {trade.tags && trade.tags.map((tag, i) => (
                         <span key={i} className="px-2 py-0.5 text-[10px] rounded-full bg-[#4FF3F9]/10 text-[#4FF3F9] font-medium">{tag}</span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <IconButton icon={Pencil} onClick={() => onEdit(trade)} variant="ghost" />
                    <IconButton icon={Trash2} onClick={() => onDelete(trade)} variant="danger" />
                </div>
            </div>
        </div>
    )}
    {!isExpanded && (
        <div className="flex justify-center mt-2" onClick={onExpand}>
            <ChevronDown size={16} className="text-gray-600" />
        </div>
    )}
  </div>
);

// --- 統 TRADE LIST & CARD COMPONENTS ---

function TradeList({ trades, onEdit, onDelete, title, showHeader = false }) {
    const [expandedTradeId, setExpandedTradeId] = useState(null);
    const [selectedScreenshot, setSelectedScreenshot] = useState(null);
    
    const toggleExpand = (id) => {
        setExpandedTradeId(prevId => prevId === id ? null : id);
    };

    if (trades.length === 0) {
        return (
            <div className="bg-[#131619] border border-slate-800/60 rounded-2xl overflow-hidden">
                <div className="text-center py-16 px-4">
                    <div className="inline-flex p-3 bg-slate-800/30 rounded-full text-slate-500 mb-3">
                        <Filter className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200">No trading records found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try adjusting your filters, searching for a different pair, or add a brand new trade manually.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#131619] border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl">
                {showHeader && (
                    <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold tracking-[-0.02em]">{title || 'Activity Records'}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Showing {trades.length} Mistakes</p>
                        </div>
                        <span className="text-[12px] font-mono text-slate-500 uppercase tracking-widest bg-slate-800/40 px-2 py-1 rounded-md border border-slate-800/60">
                            Sorted by latest
                        </span>
                    </div>
                )}
                <div className="divide-y divide-slate-800/60">
                    {trades.map((trade) => {
                        const isExpanded = expandedTradeId === trade.id;
                        const isWin = trade.outcome === "WIN";
                        const isLoss = trade.outcome === "LOSS";
                        const isBe = trade.outcome === "BREAKEVEN";
                        
                        let statusColorBg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                        let pnlColorText = "text-emerald-400";
                        if (isLoss) {
                            statusColorBg = "bg-rose-500/10 border-rose-500/20 text-rose-400";
                            pnlColorText = "text-rose-400";
                        } else if (isBe) {
                            statusColorBg = "bg-[#4FF3F9]/10 border-[#4FF3F9]/20 text-[#4FF3F9]";
                            pnlColorText = "text-slate-300";
                        }

                        return (
                            <div 
                                key={trade.id}
                                className={`transition-all duration-300 relative ${
                                    isExpanded 
                                        ? 'bg-slate-900/60 shadow-[inset_3px_0_0_0_#A479FF]' 
                                        : 'hover:bg-slate-800/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.01)]'
                                } cursor-pointer`}
                                onClick={() => toggleExpand(trade.id)}
                            >
                                {/* MAIN ROW */}
                                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 select-none">
                                    {/* Pair, Date, & Direction */}
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        {/* Direction Icon */}
                                        <div className={`p-2.5 rounded-xl border flex-shrink-0 relative ${
                                            trade.type === 'Long' 
                                                ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                                                : 'bg-rose-500/5 border-rose-500/15 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.05)]'
                                        }`}>
                                            {trade.type === 'Long' ? (
                                                <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                            ) : (
                                                <ArrowDownRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                            )}
                                            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                                                trade.type === 'Long' ? 'bg-emerald-400' : 'bg-rose-400'
                                            }`} />
                                        </div>

                                        {/* Pair Info */}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-white tracking-wide uppercase">
                                                    {trade.pair}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="font-medium tracking-tight text-slate-500">
                                                    {trade.date}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-800" />
                                                <span className="text-[11px] text-slate-400 truncate max-w-[140px] md:max-w-xs">
                                                    {trade.setup || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: Badges, P&L, Actions */}
                                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 border-t border-slate-800/40 pt-3 mt-3 md:pt-0 md:mt-0 md:border-none">
                                        {/* Status Badge */}
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[12px] font-semibold font-bold tracking-widest px-2.5 py-1 rounded-md border ${statusColorBg} shadow-sm`}>
                                                {trade.outcome === 'BREAKEVEN' ? 'BE' : trade.outcome}
                                            </span>
                                        </div>

                                        {/* PNL Display */}
                                        <div className="text-right min-w-[90px]">
                                            <p className={`text-xs font-semibold tracking-tight ${pnlColorText}`}>
                                                {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800/40">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(trade);
                                                }}
                                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
                                                title="Edit Trade"
                                            >
                                                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(trade);
                                                }}
                                                className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                                                title="Delete Trade"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                                            </button>
                                            <ChevronDown className={`h-4 w-4 text-slate-500 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* EXPANDABLE SECTION */}
                                <div className={`overflow-hidden transition-all duration-300 border-slate-800/40 ${
                                    isExpanded ? 'max-h-[1000px] border-t px-4 pb-5 pt-3 bg-[#131619]/60' : 'max-h-0'
                                }`}>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-2">
                                        {/* Left: Prices, Tags, Timing */}
                                        <div className="md:col-span-5 space-y-4">
                                            {/* Entry / Exit Mini-Cards */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-[#0C0F14] rounded-xl border border-slate-800 flex flex-col justify-between">
                                                    <span className="text-[12px] font-semibold tracking-[0.08em] font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        Entry Price
                                                    </span>
                                                    <div className="mt-2 flex items-baseline gap-1.5">
                                                        <span className="text-[15px] font-semibold font-bold text-white">{trade.entry || '-'}</span>
                                                        <span className="text-[10px] text-emerald-400/80">▲</span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-500 mt-1">Market Execution</span>
                                                </div>

                                                <div className="p-3 bg-[#0C0F14] rounded-xl border border-slate-800 flex flex-col justify-between">
                                                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isLoss ? 'bg-rose-400' : isBe ? 'bg-[#4FF3F9]' : 'bg-emerald-400'}`} />
                                                        Exit Price
                                                    </span>
                                                    <div className="mt-2 flex items-baseline gap-1.5">
                                                        <span className="text-sm font-mono font-bold text-white">{trade.exit || '-'}</span>
                                                        <span className={`text-[10px] ${isLoss ? 'text-rose-400/80' : 'text-[#4FF3F9]/80'}`}>▼</span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-500 mt-1">Take Profit Limit</span>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            {trade.tags && trade.tags.length > 0 && (
                                                <div>
                                                    <div className="text-[12px] font-semibold tracking-[0.08em] font-semibold uppercase text-slate-500 tracking-widest mb-2">Tags</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {trade.tags.map((tag, i) => (
                                                            <span 
                                                                key={i} 
                                                                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-medium"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timing */}
                                            <div className="p-3 bg-[#0C0F14]/60 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs">
                                                <span className="text-slate-400 flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-[#A479FF]" />
                                                    Date/Session 
                                                </span>
                                                <span className="font-mono text-slate-300 font-medium">
                                                    {trade.date}{trade.session ? ` • ${trade.session}` : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Middle: Notes */}
                                        <div className="md:col-span-5 space-y-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-[#A479FF]/10 text-[#A479FF] rounded-lg border border-[#A479FF]/20">
                                                    <BookOpen className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Notes</span>
                                            </div>
                                            
                                            <div className="p-3.5 bg-[#0C0F14] rounded-xl border border-slate-800/80 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#A479FF]/5 to-transparent rounded-bl-full pointer-events-none" />
                                                <p className="text-[14px] leading-7 text-slate-300 leading-relaxed font-normal">
                                                    &ldquo;{trade.notes || 'No notes recorded for this trade.'}&rdquo;
                                                </p>
                                            </div>
                                            
                                            {trade.learnings && (
                                                <div className="p-3.5 bg-[#0C0F14] rounded-xl border border-[#3CFF64]/20 relative overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="p-1 bg-[#3CFF64]/10 text-[#3CFF64] rounded border border-[#3CFF64]/20">
                                                            <Target className="h-3 w-3" />
                                                        </div>
                                                        <span className="text-[10px] font-semibold text-[#3CFF64] uppercase tracking-wider">Key Learning</span>
                                                    </div>
                                                    <p className="text-[14px] leading-7 text-slate-300 leading-relaxed font-normal">
                                                        &ldquo;{trade.learnings}&rdquo;
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {trade.mistake && trade.mistake !== 'None' && (
                                                <div className="p-3.5 bg-[#0C0F14] rounded-xl border border-[#FF4D4D]/20 relative overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="p-1 bg-[#FF4D4D]/10 text-[#FF4D4D] rounded border border-[#FF4D4D]/20">
                                                            <AlertTriangle className="h-3 w-3" />
                                                        </div>
                                                        <span className="text-[10px] font-semibold text-[#FF4D4D] uppercase tracking-wider">Mistake Logged</span>
                                                    </div>
                                                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                                                        {trade.mistake}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

{/* Right: Screenshots */}
<div className="md:col-span-2 flex flex-col justify-start gap-3">
  {/* Before Trade Screenshot */}
  {trade.screenshot_before && (
    <div className="space-y-2">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
        Before Trade
      </span>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedScreenshot(trade.screenshot_before);
        }}
        className="relative rounded-xl overflow-hidden border border-emerald-500/20 cursor-zoom-in h-24 group bg-slate-900"
      >
        <img 
          src={trade.screenshot_before} 
          alt="Before trade setup" 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="p-1.5 bg-slate-900/90 rounded-lg text-white">
            <Camera className="h-4 w-4" />
          </div>
        </div>
      </div>
      <a
        href={trade.screenshot_before}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="w-full py-2 px-3 bg-[#0C0F14] hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5"
      >
        <ArrowUpRight className="h-3 w-3" />
        View Before
      </a>
    </div>
  )}

  {/* After Trade Screenshot (backward compat: old screenshot_url maps here) */}
  {(trade.screenshot_after || trade.screenshot_url) && (
    <div className="space-y-2">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A479FF] shadow-[0_0_6px_rgba(164,121,255,0.6)]"></span>
        After Trade
      </span>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedScreenshot(trade.screenshot_after || trade.screenshot_url);
        }}
        className="relative rounded-xl overflow-hidden border border-[#A479FF]/20 cursor-zoom-in h-24 group bg-slate-900"
      >
        <img 
          src={trade.screenshot_after || trade.screenshot_url} 
          alt="After trade result" 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="p-1.5 bg-slate-900/90 rounded-lg text-white">
            <Camera className="h-4 w-4" />
          </div>
        </div>
      </div>
      <a
        href={trade.screenshot_after || trade.screenshot_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="w-full py-2 px-3 bg-[#0C0F14] hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5"
      >
        <ArrowUpRight className="h-3 w-3" />
        View After
      </a>
    </div>
  )}

  {/* No screenshots placeholder */}
  {(!trade.screenshot_before && !trade.screenshot_after && !trade.screenshot_url) && (
    <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-xl p-4">
      <Camera className="h-6 w-6 mb-2 opacity-30" />
      <span className="text-[10px] uppercase tracking-wider">No Screenshots</span>
    </div>
  )}
</div>

{/* Close Grid */}
</div>

{/* Close Expandable Section */}
</div>

{/* Close Trade Row */}
</div>
);
})}

{/* Close divide-y */}
</div>

{/* Close Outer Card */}
</div>

{/* Screenshot Fullscreen Modal */}
{selectedScreenshot && (
  <div 
    className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setSelectedScreenshot(null)}
  >
    <div className="relative max-w-4xl w-full bg-[#131619] border border-slate-800 rounded-2xl overflow-hidden p-2 animate-in fade-in zoom-in-95 duration-200">
      <button 
        className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl transition-all z-10"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedScreenshot(null);
        }}
      >
        <X className="h-4 w-4" />
      </button>
      <img 
        src={selectedScreenshot} 
        alt="Trading Chart Snapshot" 
        className="w-full h-auto rounded-xl"
      />
      <p className="text-xs text-slate-400 text-center py-2">
        Chart Screenshot Analysis — Click anywhere to exit view.
      </p>
    </div>
  </div>
)}
</>
);
}

const TagsInput = ({ tags, setTags, label }) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault(); 
            e.stopPropagation(); 
            const newTag = inputValue.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '');
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setInputValue('');
            }
        }
    };
    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };
    return (
        <InputGroup label={label}>
            <div className="flex flex-wrap gap-2 p-2 min-h-[44px] bg-[#0C0F14] border border-white/10 rounded-xl transition-colors focus-within:border-[#A479FF]">
                {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-[#4FF3F9]/20 text-white cursor-pointer hover:bg-[#4FF3F9]/40 transition-colors" onClick={() => handleRemoveTag(tag)} >
                        {tag} <X size={12} className="text-gray-300" />
                    </span>
                ))}
                <input type="text" inputMode="text" formNoValidate enterKeyHint="done" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} onKeyUp={(e) => e.key === "Enter" && e.preventDefault()} className="flex-1 bg-transparent border-none text-white outline-none placeholder-gray-600 p-0 text-sm min-w-[100px]" placeholder={tags.length === 0 ? "Add tags (e.g., HTF, LONDON, SCALP)" : ""} />
            </div>
        </InputGroup>
    );
};

  // --- REUSABLE MODAL COMPONENT ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className={`bg-[#131619] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 border border-white/10 ${THEME.text.primary}`} onClick={e => e.stopPropagation()} >
        <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#131619] z-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] font-bold">{title}</h2>
          <IconButton icon={X} onClick={onClose} variant="ghost" />
        </div>
        {children}
      </div>
    </div>
  );
};



// --- TRADE MODAL LOGIC ---
const initialTradeState = {
  date: new Date().toISOString().substring(0, 10),
  pair: 'EUR/USD',
  type: 'Long',
  outcome: 'WIN',
  pnl: '',           // Must be string, not undefined
  setup: '',         // Must be string, not undefined
  session: 'London',
  notes: '',         // Must be string, not undefined
  mistake: '',       // Must be string, not undefined
  learnings: '',     // Must be string, not undefined
  tags: [],          // Must be array, not undefined
  screenshot_before: '',  
  screenshot_after: '', 
  screenshot_url: '', // Must be string, not undefined
  entry: '',         // Must be string, not undefined
  exit: '',          // Must be string, not undefined
};

const ScreenshotUploader = ({ label, fieldName, url, isUploading, fileRef, onFileChange, onRemove }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-400">{label}</label>
    {url ? (
      <div className="p-3 bg-[#131619] border border-white/10 rounded-xl flex justify-between items-center">
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#A479FF] hover:underline">
          <Camera size={18} /> View Screenshot
        </a>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500">
          <X size={18} />
        </button>
      </div>
    ) : (
      <>
        <input type="file" ref={fileRef} onChange={onFileChange} className="hidden" accept="image/*" />
        <button 
          type="button" 
          onClick={() => fileRef.current?.click()} 
          className="w-full text-center text-sm font-medium py-2.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/50 transition-colors flex items-center justify-center gap-2" 
          disabled={isUploading}
        >
          {isUploading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-[#A479FF] rounded-full" /> : <Camera size={18} />}
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </>
    )}
  </div>
);

const TradeModal = ({ isOpen, onClose, onSave, tradeToEdit, user }) => {

  const [trade, setTrade] = useState(initialTradeState);
  const [error, setError] = useState('');
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);
  const fileInputRefBefore = useRef(null);
  const fileInputRefAfter = useRef(null);


  useEffect(() => {
    if (isOpen) {
      setError('');
      if (tradeToEdit) {
        // BACKWARD COMPATIBILITY: Old screenshot_url maps to screenshot_after (the trade result)
        const migratedBefore = tradeToEdit.screenshot_before || '';
        const migratedAfter = tradeToEdit.screenshot_after || tradeToEdit.screenshot_url || '';

        setTrade({ 
          id: tradeToEdit.id,
          date: tradeToEdit.date || new Date().toISOString().substring(0, 10),
          pair: tradeToEdit.pair || 'EUR/USD',
          type: tradeToEdit.type || 'Long',
          outcome: tradeToEdit.outcome || 'WIN',
          pnl: tradeToEdit.pnl != null ? String(tradeToEdit.pnl) : '', 
          setup: tradeToEdit.setup || '',
          session: tradeToEdit.session || 'London',
          notes: tradeToEdit.notes || '',
          mistake: tradeToEdit.mistake || '',
          learnings: tradeToEdit.learnings || '',
          tags: tradeToEdit.tags || [],
          screenshot_before: migratedBefore,
          screenshot_after: migratedAfter,
          entry: tradeToEdit.entry != null ? String(tradeToEdit.entry) : '',
          exit: tradeToEdit.exit != null ? String(tradeToEdit.exit) : '',
        });
      } else {
        setTrade(initialTradeState);
      }
    }
  }, [isOpen, tradeToEdit]);

  // Simplified handleChange to keep all values as strings, allowing the '-' sign for PnL
  const handleChange = (e) => {
  const { name, value } = e.target;
  // Never allow undefined to be set
  setTrade(prev => ({ ...prev, [name]: value ?? '' }));
};
  
const handleFileChangeBefore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingBefore(true);
    try {
      const url = await uploadScreenshot(file);
      if (url) setTrade(prev => ({ ...prev, screenshot_before: url }));
    } catch (err) {
      setError(`Before upload failed: ${err.message}`);
    } finally {
      setIsUploadingBefore(false);
    }
  };

const handleFileChangeAfter = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setIsUploadingAfter(true);
  try {
    const url = await uploadScreenshot(file);
    if (url) setTrade(prev => ({ ...prev, screenshot_after: url }));
  } catch (error) {
    setError(`After upload failed: ${error.message}`);
  } finally {
    setIsUploadingAfter(false);
  }
};
  const handleTagChange = (newTags) => {
    setTrade(prev => ({ ...prev, tags: newTags }));
  };
  
  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    setIsUploading(true);
    try {
      const url = await uploadScreenshot(file);
      if (url) setTrade(prev => ({ ...prev, screenshot_url: url }));
    } catch (error) {
      setError(`File upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }
  if (fileInputRef.current) fileInputRef.current.value = "";
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingBefore || isUploadingAfter) return; 
    setError('');
    
    // --- UPDATED PARSING LOGIC for PnL and Prices (using 'entry' and 'exit') ---
    const pnlValue = parseFloat(trade.pnl);
    // Use null for empty string or non-numeric input for optional price fields
    const entryValue = trade.entry ? parseFloat(trade.entry) : null;
    const exitValue = trade.exit ? parseFloat(trade.exit) : null;

    if (isNaN(pnlValue)) {
        setError('Please enter a valid PnL amount (e.g., 50.75 or -25.00).');
        return;
    }
    // Check if the input is present but invalid (not null, not an empty string, and not a number)
    if (trade.entry && !isNaN(trade.entry) && isNaN(entryValue)) {
        setError('Please enter a valid number for Entry Price, or leave it blank.');
        return;
    }
    if (trade.exit && !isNaN(trade.exit) && isNaN(exitValue)) {
        setError('Please enter a valid number for Exit Price, or leave it blank.');
        return;
    }

    try {
      const tradeToSave = { 
        ...trade, 
        pnl: pnlValue, // Pass parsed number
        entry: entryValue, // Pass parsed number or null (MATCH DB SCHEMA)
        exit: exitValue,   // Pass parsed number or null (MATCH DB SCHEMA)
        tags: trade.tags.filter(t => t.length > 0) 
      };
      await onSave(tradeToSave);
      onClose(); 
    } catch (err) {
      // The reported error was here.
      // If the error persists, it will be due to RLS or other configuration issues, not schema mismatch.
      setError(`Failed to save trade: ${err.message}`);
    }
  };



const handleRemoveScreenshot = async (field) => {
  // Check the specific field for the URL
  const urlToDelete = trade[field];
  if (!urlToDelete) return;

  try {
    const storage = getStorage();

    // Convert full URL back to storage path
    const url = new URL(urlToDelete);
    const path = decodeURIComponent(
      url.pathname.split("/o/")[1].split("?")[0]
    );

    const fileRef = ref(storage, path);

    await deleteObject(fileRef);

    // Reset the specific field in state
    setTrade(prev => ({ ...prev, [field]: '' }));

  } catch (error) {
    console.error("Error deleting file:", error);
    setError("Could not remove screenshot. Try manually deleting it.");
  }
};

const assetOptions = useMemo(() => {
  return Object.entries(TRADEABLE_ASSETS).flatMap(([group, pairs]) => {
    if (group === 'Other') {
      // Don't render options for 'Other' here
      return [];
    }
    return [
      <option key={group} disabled className="text-gray-600 bg-[#0C0F14]">{group.toUpperCase()}</option>,
      ...pairs.map(pair => (
        <option key={pair} value={pair} className="text-white bg-[#0C0F14]">{pair}</option>
      ))
    ];
  });
}, []);


  const sessionOptions = ['Asian', 'London', 'NYC', 'Close', 'Unspecified'];
  const mistakeOptions = [
  'None', 'Over-leveraging', 'Revenge Trading', 'No Stop Loss', 'Late Entry/FOMO', 
  'Early Exit', 'Over-trading', 'Misreading Chart/Bias','Poor Execution', 'Breaching Plan', 'Other'
];

return (
  <Modal isOpen={isOpen} onClose={onClose} title={tradeToEdit ? "Edit Trade Journal Entry" : "New Trade Journal Entry"}>
    <div className="px-6">
      {error && (
        <div className="p-3 mb-4 text-sm text-[#FF4D4D] bg-[#FF4D4D]/10 rounded-lg border border-[#FF4D4D]/30">{error}</div>
      )}
    </div>
    <form 
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
      className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputGroup label="Trade Date">
          <input type="date" name="date" value={trade.date} onChange={handleChange} className={inputClass} required />
        </InputGroup>
        <InputGroup label="Currency Pair / Asset">
          <div className="relative">
            <select name="pair" value={trade.pair} onChange={handleChange} className={selectClass} required>
              {assetOptions}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </InputGroup>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputGroup label="Type">
          <select name="type" value={trade.type} onChange={handleChange} className={selectClass} required>
            <option value="Long">Long (Buy)</option>
            <option value="Short">Short (Sell)</option>
          </select>
        </InputGroup>
        <InputGroup label="PnL ($)">
          <input type="text" name="pnl" value={trade.pnl} onChange={handleChange} className={`${inputClass} font-mono`} placeholder="e.g., 50.75 or -25.00" required />
        </InputGroup>
        <InputGroup label="Outcome">
          <select name="outcome" value={trade.outcome} onChange={handleChange} className={selectClass} required>
            <option value="WIN">WIN</option>
            <option value="LOSS">LOSS</option>
            <option value="BREAKEVEN">BREAKEVEN (BE)</option>
          </select>
        </InputGroup>
      </div>
        
        {/* MATCHING USER'S DB COLUMNS: 'entry' and 'exit' */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Entry Price (Optional)">
  <input 
    type="text" 
    name="entry" 
    value={trade.entry || ''}  // Fallback to empty string if undefined
    onChange={handleChange} 
    className={`${inputClass} font-mono`} 
    placeholder="e.g., 1.07542" 
  />
</InputGroup>

<InputGroup label="Exit Price (Optional)">
  <input 
    type="text" 
    name="exit" 
    value={trade.exit || ''}   // Fallback to empty string if undefined
    onChange={handleChange} 
    className={`${inputClass} font-mono`} 
    placeholder="e.g., 1.07600" 
  />
</InputGroup>
        </div>
        {/* END DB MATCH */}

        <InputGroup label="Trading Session">
          <select name="session" value={trade.session} onChange={handleChange} className={selectClass} required>
            {sessionOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </InputGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputGroup label="Setup / Strategy Used">
            <input type="text" name="setup" value={trade.setup} onChange={handleChange} className={inputClass} placeholder="e.g., SMC, Wyckoff, Scalp" />
          </InputGroup>
          <InputGroup label="Primary Mistake (Self-Correction)">
            <select name="mistake" value={trade.mistake} onChange={handleChange} className={`${selectClass} ${trade.mistake !== 'None' ? 'border-[#FF4D4D]/50 text-[#FF4D4D]' : ''}`}>
              {mistakeOptions.map(m => (
                <option key={m} value={m} className={m !== 'None' ? 'text-[#FF4D4D] bg-[#0C0F14]' : 'text-white bg-[#0C0F14]'}>{m}</option>
              ))}
            </select>
          </InputGroup>
        </div>
        <TagsInput label="Tags (Enter to add)" tags={trade.tags} setTags={handleTagChange} />
        <InputGroup label="Trade Notes & Rationale">
          <textarea name="notes" value={trade.notes} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="Detailed entry/exit logic, confluence, R:R calculation..." />
        </InputGroup>
        {trade.mistake !== 'None' && (
          <InputGroup label="Corrective Action / Key Learning">
            <textarea name="learnings" value={trade.learnings} onChange={handleChange} className={`${inputClass} min-h-[80px] border-[#3CFF64]/50`} placeholder="What rule will I implement to prevent this mistake next time?" />
          </InputGroup>
        )}

 {/* DUAL SCREENSHOT UPLOADERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScreenshotUploader 
            label="Before Trade Screenshot (Optional)"
            fieldName="screenshot_before"
            url={trade.screenshot_before}
            isUploading={isUploadingBefore}
            fileRef={fileInputRefBefore}
            onFileChange={handleFileChangeBefore}
            onRemove={() => handleRemoveScreenshot('before')}
          />
          <ScreenshotUploader 
            label="After Trade Screenshot (Optional)"
            fieldName="screenshot_after"
            url={trade.screenshot_after}
            isUploading={isUploadingAfter}
            fileRef={fileInputRefAfter}
            onFileChange={handleFileChangeAfter}
            onRemove={() => handleRemoveScreenshot('after')}
          />
        </div>

        <button type="submit" className="w-full mt-6 py-3 text-lg font-medium rounded-xl bg-[#3CFF64] text-black hover:bg-[#2EB84D] transition-colors flex items-center justify-center gap-2" disabled={isUploadingBefore || isUploadingAfter}>
          <Save size={18} /> Save Entry
        </button>
      </form>
    </Modal>
  );
};

// --- BALANCE MODAL ---
const EditBalanceModal = ({ isOpen, onClose, currentBalance, onUpdate }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deposit'); 
  const [error, setError] = useState('');

  useEffect(() => {
    if(isOpen) {
      setAmount('');
      setType('deposit');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    const actualChange = type === 'deposit' ? numAmount : -numAmount;
    if (type === 'withdrawal' && actualChange + currentBalance < 0) {
      setError('Withdrawal exceeds current equity.');
      return;
    }
    onUpdate(actualChange);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Account Balance">
      <p className="text-gray-400 mb-4 px-6">Current Equity: <span className="text-white font-mono font-medium">{formatCurrency(currentBalance)}</span></p>
      {error && (
        <div className="p-3 mb-4 mx-6 text-sm text-[#FF4D4D] bg-[#FF4D4D]/10 rounded-lg border border-[#FF4D4D]/30">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        <InputGroup label="Transaction Type">
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass} >
            <option value="deposit">Deposit (Add Funds)</option>
            <option value="withdrawal">Withdrawal (Remove Funds)</option>
          </select>
        </InputGroup>
        <InputGroup label="Amount ($)">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} step="0.01" placeholder="e.g., 500.00" required />
        </InputGroup>
        <button type="submit" className="w-full py-3 text-[14px] font-semibold rounded-xl bg-[#A479FF] text-white hover:bg-[#9361FF] transition-colors mt-6">
          Confirm Update
        </button>
      </form>
    </Modal>
  );
};

// --- DELETE MODAL ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => (
  <ActionModal 
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete Trade Entry"
    message="Are you sure you want to delete this trade? This action is permanent and cannot be undone."
    confirmText="Delete Trade"
    isDestructive={true}
  />
);

// --- SIGN OUT MODAL ---
const SignOutConfirmationModal = ({ isOpen, onClose, onConfirm }) => (
  <ActionModal 
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Sign Out"
    message="Are you sure you want to sign out of your MFX Journal?"
    confirmText="Log Out"
    isDestructive={false}
  />
);


// --- NEW AUTH PAGE COMPONENT ---
const AuthPage = ({ authView, setAuthView }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0F14] relative overflow-hidden p-4">
      {/* Background Decor: Technical Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-radial-gradient from-[#A479FF]/10 via-transparent to-transparent opacity-40 pointer-events-none" />
      
      {/* Auth Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
           <img src={MuyeFxLogoImage} alt="MuyeFX" className="h-16 w-auto mb-4 drop-shadow-[0_0_15px_rgba(60,255,100,0.3)]" />
           <h1 className="text-2xl font-bold tracking-tight text-white">
             MUYE<span className="text-[#3CFF64]">FX</span>
           </h1>
           <p className="text-gray-400 text-sm mt-2">Professional Trade Journaling</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#131619]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Custom Toggle Switch */}
          <div className="p-2 bg-[#0C0F14]/50 border-b border-white/5">
            <div className="relative flex w-full bg-[#0C0F14] rounded-xl p-1 border border-white/5">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1A1D21] border border-white/10 rounded-lg shadow-sm transition-all duration-300 ease-out transform ${authView === 'sign_in' ? 'left-1' : 'left-[calc(50%+2px)]'}`} 
              />
              <button 
                onClick={() => setAuthView('sign_in')}
                className={`relative flex-1 py-2 text-[14px] font-semibold transition-colors duration-200 z-10 ${authView === 'sign_in' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthView('sign_up')}
                className={`relative flex-1 py-2 text-[14px] font-semibold transition-colors duration-200 z-10 ${authView === 'sign_up' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="p-8">
             <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold font-semibold text-white mb-1">
                  {authView === 'sign_in' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm leading-6 text-gray-500">
                  {authView === 'sign_in' 
                    ? 'Enter your credentials to access your journal.' 
                    : 'Start tracking your edge today.'}
                </p>
             </div>

             <AuthScreen onAuthSuccess={handleAuthSuccess} />
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[12px] tracking-[0.15em] text-gray-600 uppercase tracking-widest">
             &copy; {new Date().getFullYear()} MFX Journal
           </p>
        </div>
      </div>
    </div>
  );
};

const ActionModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#131619] border border-white/[0.08] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all">
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">{message}</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 bg-[#0C0F14]/50 border-t border-white/[0.04]">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3 text-sm font-bold text-black rounded-xl transition-all ${isDestructive ? 'bg-[#FF4D4D] hover:bg-[#ff3333]' : 'bg-[#3CFF64] hover:bg-[#32e057]'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};



// --- MAIN APP COMPONENT ---

const App = () => {
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [balance, setBalance] = useState(10000); 
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [authView, setAuthView] = useState('sign_in');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ outcome: '', pair: '' });
  const [tradeToDelete, setTradeToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Set dark mode root class logic
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Inject Plus Jakarta Sans for premium fintech feel
  useEffect(() => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => document.head.removeChild(link);
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsResettingPassword(true);
      setLoadingTrades(false);
      return;
    }

    if (user) {
      fetchInitialData();
    } else {
      setLoadingTrades(false);
    }
  }, [user]);

  const fetchInitialData = async () => {
    if (!user) return;
    setLoadingTrades(true);

    try {
      // Fetch trades
      const tradesRef = collection(db, "users", user.uid, "trades");
      const tradesSnap = await getDocs(tradesRef);


      const tradesData = tradesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      tradesData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTrades(tradesData.map(t => ({
        ...t,
        pnl: Number(t.pnl)
      })));

      // Fetch settings
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data?.settings?.starting_balance !== undefined) {
          setBalance(Number(data.settings.starting_balance) || 10000);
        } else {
          await updateDoc(userRef, {
            "settings.starting_balance": balance
          });
        }
      } else {
        await setDoc(userRef, {
          settings: { starting_balance: balance }
        });
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }

    setLoadingTrades(false);
  };

  const updateBalanceInDB = async (newBalance) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "settings.starting_balance": newBalance
      });
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const handleSave = async (tradeToSave) => {
    const isEditing = !!tradeToSave.id;
    const { pnl, entry, exit, ...rest } = tradeToSave;

    try {
      if (isEditing) {
        const tradeRef = doc(db, "users", user.uid, "trades", tradeToSave.id);
        await updateDoc(tradeRef, { ...rest, pnl, entry, exit });
        setTrades(trades.map(t => t.id === tradeToSave.id ? { ...t, ...tradeToSave } : t));
      } else {
        const tradesRef = collection(db, "users", user.uid, "trades");
        const docRef = await addDoc(tradesRef, { ...rest, pnl, entry, exit });
        const newTrade = { id: docRef.id, ...rest, pnl, entry, exit };
        setTrades([newTrade, ...trades]);
      }
    } catch (error) {
      console.error("Error saving trade:", error);
      throw new Error(`Failed to save trade entry: ${error.message}`);
    }
  };

// 1. Trigger the modal instead of showing window.confirm
const handleDelete = (trade) => {
  setTradeToDelete(trade);
  setIsDeleteModalOpen(true);
};

// 2. This logic runs only after the user clicks "Delete" inside the modal
const confirmDelete = async () => {
  if (!tradeToDelete) return;
  
  try {
    const tradeRef = doc(db, "users", user.uid, "trades", tradeToDelete.id);
    await deleteDoc(tradeRef);
    setTrades(trades.filter(t => t.id !== tradeToDelete.id));
  } catch (error) {
    console.error("Error deleting trade:", error);
  } finally {
    setTradeToDelete(null);
    setIsDeleteModalOpen(false);
  }
};

  const handleEdit = (trade) => {
    setEditTrade(trade);
    setModalOpen(true);
  };
  
  const handleBalanceUpdate = async (changeAmount) => {
    const newBalance = balance + changeAmount; 
    await updateBalanceInDB(newBalance);
    setBalance(newBalance); 
  };

  const triggerSignOut = () => setSignOutModalOpen(true);
  
  const confirmSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setSignOutModalOpen(false);
  };

  const handleAuthSuccess = () => {
    // This function is called when auth is successful
    // The onAuthStateChanged listener will handle the rest
  };


  const toggleFilter = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: prev[name] === value ? '' : value }));
  };

  // Filtered trades memo
  const filteredTrades = useMemo(() => {
    let filtered = trades;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.pair.toLowerCase().includes(lowerSearchTerm) || 
        trade.setup?.toLowerCase().includes(lowerSearchTerm) || 
        trade.notes?.toLowerCase().includes(lowerSearchTerm) 
      );
    }
    if (filters.outcome) filtered = filtered.filter(trade => trade.outcome === filters.outcome);
    if (filters.pair) filtered = filtered.filter(trade => trade.pair === filters.pair);
    return filtered;
  }, [trades, searchTerm, filters]);

  const pairFilterOptions = useMemo(() => {
    const uniquePairs = [...new Set(trades.map(t => t.pair))].sort();
    return uniquePairs;
  }, [trades]);

  // --- RENDER FUNCTIONS ---

  const renderContent = () => {
    if (loadingTrades) {
      return <JournalLoading />;
    }

    switch (currentView) {
      case 'dashboard':
        const { totalPnL, winRate, rr, totalTrades, pnlPercentage, winsCount, lossesCount } = getKPIs(trades, balance);
        const currentEquityForDisplay = balance + totalPnL; 

        return (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
    <KpiCard title="Current Equity" value={currentEquityForDisplay} type="equity" prefix="$" decimals={2} />
    <KpiCard 
  title="Total PnL" 
  value={totalPnL} 
  type="pnl" 
  prefix={totalPnL >= 0 ? '+$' : '-$'} 
  decimals={2} 
  trendValue={Math.abs(pnlPercentage).toFixed(1)} 
  trendPositive={pnlPercentage >= 0} 
  valueClassName={totalPnL >= 0 ? 'text-[#3CFF64]' : 'text-[#FF4D4D]'} 
/>
    <KpiCard 
  title="Win Rate" 
  value={winRate} 
  type="winrate" 
  suffix="%"
  decimals={1}
  extraLabel={
    <div className="flex items-center gap-1 text-[10px] font-bold">
      <span className="text-[#3CFF64] tracking-wider">{winsCount}W</span>
      <span className="text-gray-500">/</span>
      <span className="text-[#FF4D4D] tracking-wider">{lossesCount}L</span>
    </div>
  }
/>
    <KpiCard title="Average R:R" value={rr} type="rr" prefix="1 : " decimals={2} />
</div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
    <Card className="min-h-[360px] sm:min-h-[420px] w-full overflow-hidden min-w-0" noPadding>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A479FF]/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
        <div className="p-5 sm:p-6 h-full relative z-10 flex flex-col">
            <EquityCurveWidget trades={trades} startingBalance={balance} />
        </div>
    </Card>
    <div className="min-h-[360px] sm:min-h-[420px]">
        <CalendarWidget trades={trades} />
    </div>
</div>

            <div className='pt-2 sm:pt-4'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-xl font-bold text-white">Recent Trades</h2>
                    <button onClick={() => setCurrentView('journal')} className="text-sm font-medium text-[#A479FF] hover:text-white transition-colors" >
                        View All ({totalTrades}) <ChevronRight size={16} className="inline-block ml-1" />
                    </button>
                </div>
                <TradeList trades={trades.slice(0, 5)} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          </div>
        );
      case 'journal':
        const { totalTrades: allTradesCount } = getKPIs(trades, balance); 
        return (
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Trade Journal ({allTradesCount})</h1>
            
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Search by pair, setup, or notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10 bg-[#0C0F14]`} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-gray-400 font-medium hidden sm:block">Filter:</span>
                    <div className="flex space-x-2">
                        {['WIN', 'LOSS', 'BREAKEVEN'].map(outcome => (
                            <button key={outcome} onClick={() => toggleFilter('outcome', outcome)} className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${filters.outcome === outcome ? 'bg-[#A479FF] text-white border-[#A479FF] shadow-lg shadow-[#A479FF]/20' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'}`} >
                                {outcome}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <select value={filters.pair} onChange={(e) => toggleFilter('pair', e.target.value)} className={`${selectClass} py-1.5 pr-8 text-xs h-9 bg-[#0C0F14] appearance-none`} >
                            <option value="">All Pairs</option>
                            {pairFilterOptions.map(pair => <option key={pair} value={pair}>{pair}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </Card>
            <TradeList trades={filteredTrades} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        );
      case 'analytics':
        return <AnalyticsView trades={trades} />;
      case 'mistakes':
    return <MistakesView trades={trades} onEdit={handleEdit} onDelete={handleDelete} />;
      default:
        return <div className="text-white">View not found.</div>;
    }
  };

  // Priority 1: Password reset mode
  if (isResettingPassword) {
    return (
      <UpdatePasswordScreen 
        onComplete={() => {
          setIsResettingPassword(false);
          window.location.hash = ''; 
        }} 
      />
    );
  }

  // Priority 2: Not authenticated
  if (!user) {
  return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
}

    // Priority 3: Authenticated - Main App
  const { totalPnL } = getKPIs(trades, balance);
  const currentEquityForModal = balance + totalPnL;
  
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
  ];

  return (
    <> 
      <div className={`min-h-screen ${THEME.bg} flex flex-col ${THEME.text.primary} relative overflow-x-hidden`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* STICKY HEADER */}
        <header className="sticky top-0 z-50 h-[64px] sm:h-[76px] w-full shrink-0 bg-gradient-to-b from-[#0C0F14]/95 to-[#0C0F14]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 md:px-8">
          
          {/* TOP LEFT: Logo */}
          <div className="flex items-center gap-1 sm:gap-2">
            <h1 className="text-[15px] sm:text-xl tracking-tight flex items-center">
              <span className="font-extrabold text-white">M</span>
              <span className="font-extrabold text-[#3CFF64] drop-shadow-[0_0_12px_rgba(60,255,100,0.4)]">FX</span>
              <span className="font-bold text-white ml-1 sm:ml-1.5 opacity-90">Journal</span>
            </h1>
          </div>

          {/* TOP RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 p-1 bg-[#131619] border border-white/[0.06] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/10 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
              
              {/* Hide balance text on mobile, keep visible on sm+ */}
              <div className="hidden sm:flex flex-col pl-3 pr-2 py-1 relative z-10">
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold mb-0.5">Total Balance</span>
                <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(currentEquityForModal)}</span>
              </div>
              
              <button onClick={() => setBalanceModalOpen(true)} className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-transparent hover:border-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-all duration-250 ease-out relative z-10">
                <Wallet size={16} />
              </button>
            </div>

            <div className="hidden sm:block w-[1px] h-8 bg-white/[0.06] mx-1"></div>

            <button onClick={() => { setEditTrade(null); setModalOpen(true); }} className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-[#3CFF64] hover:bg-[#32e057] text-[#0C0F14] font-bold text-[13px] sm:text-[14px] flex items-center gap-1.5 sm:gap-2 shadow-[0_0_15px_rgba(60,255,100,0.15)] hover:shadow-[0_0_25px_rgba(60,255,100,0.3)] hover:-translate-y-[1px] transition-all duration-250 ease-out active:translate-y-[1px]">
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add Trade</span>
              <span className="inline sm:hidden">Add</span>
            </button>
          </div>
        </header>

        {/* HORIZONTAL NAVIGATION - Sticky below header */}
        <div className="sticky top-[76px] z-40 bg-[#0C0F14]/95 backdrop-blur-xl border-b border-white/[0.04] px-6 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-250 ease-out whitespace-nowrap
                    ${isActive 
                      ? 'text-white bg-[#131619] border border-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.1)]' 
                      : 'text-[#9CA3AF] border border-transparent hover:text-white hover:bg-white/[0.03]'
                    }`}
                >
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3CFF64] shadow-[0_0_8px_rgba(60,255,100,0.6)]"></div>
                  )}
                  <item.icon size={16} className={isActive ? 'text-[#3CFF64]' : ''} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="ml-auto flex items-center">
              <button onClick={triggerSignOut} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#9CA3AF] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-all duration-250 ease-out border border-transparent">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 sm:p-8 z-10">
          <div className="max-w-7xl mx-auto pb-safe">
            {renderContent()}
          </div>
        </main>
      </div>

      <TradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} tradeToEdit={editTrade} user={user} />
      <EditBalanceModal isOpen={balanceModalOpen} onClose={() => setBalanceModalOpen(false)} currentBalance={currentEquityForModal} onUpdate={handleBalanceUpdate} />
      <SignOutConfirmationModal isOpen={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} onConfirm={confirmSignOut} />
      <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} />
      
      <style>{`
        .recharts-tooltip-cursor { fill: rgba(255,255,255,0.05) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0C0F14; }
        ::-webkit-scrollbar-thumb { background: #1A1D21; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #2A2D31; }
        
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        @keyframes shimmer {
  100% { transform: translateX(100%); }
}
      `}</style>
    </>
  );
};

export default App;