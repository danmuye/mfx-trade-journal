import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, BookOpen, AlertTriangle, BarChart3, Plus, Search, 
  Filter, TrendingUp, Target, BrainCircuit, X, Save, Camera, 
  MoreHorizontal, Pencil, Trash2, LogOut, ChevronLeft, ChevronRight, 
  CalendarDays, HeartHandshake, Wallet, ArrowUpRight, ArrowDownRight,
  PieChart as PieIcon, Menu, ChevronUp, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';
// NOTE: Assuming this imports Auth and the client instance
import { supabase, useAuth, Auth } from './supabase'; 

import AuthScreen from './AuthScreen';

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

const InputGroup = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{label}</label>
    {children}
  </div>
);

const inputClass = "w-full bg-[#0C0F14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#A479FF] outline-none transition-colors";
const selectClass = "w-full bg-[#0C0F14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#A479FF] outline-none transition-colors appearance-none pr-8";


// --- ｧｩ UI PRIMITIVES ---

const Card = ({ children, className = "", noPadding = false, glow = false }) => (
  <div className={`relative group rounded-2xl border ${THEME.border} ${THEME.card} transition-all duration-300 ${glow ? 'hover:shadow-[0_0_20px_rgba(164,121,255,0.1)] hover:border-white/10' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
    <div className={noPadding ? "" : "p-4 sm:p-6"}>
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
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider border ${styles[type] || styles.neutral} ${className}`}>
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

const ModernBarChart = ({ data, title, primaryColor = THEME.accent.cyan, keyName = 'name', height = 300 }) => {
    if (!data || data.length === 0) return (
        <Card className="flex items-center justify-center min-h-[300px] text-gray-500 text-sm w-full overflow-hidden">
            No data available for {title}
        </Card>
    );

    return (
        <Card noPadding className="w-full overflow-hidden min-w-0">
            <div className="p-4 sm:p-6 border-b border-white/5">
                <h3 className="text-lg font-medium text-white">{title}</h3>
            </div>
            <div className="p-4 sm:p-6" style={{ height: `${height}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey={keyName} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#0C0F14', border: '1px solid #333', borderRadius: '12px' }} 
                            formatter={(value) => [`$${value.toFixed(2)}`, 'PnL']}
                            labelStyle={{ color: '#fff', marginBottom: '5px' }}
                        />
                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? THEME.accent.green : THEME.accent.red} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
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
      className="text-xl font-extrabold tracking-tight"
      style={{ color: '#EBEBEB', fontFamily: 'Arial, sans-serif' }}
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
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const active = currentView === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${active ? 'bg-[#A479FF]/10 text-[#A479FF]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={20} className={active ? "text-[#A479FF]" : "group-hover:text-white"} />
              <span className="text-sm font-medium">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#A479FF] shadow-[0_0_10px_#A479FF]" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-[#0C0F14]">
        <button onClick={triggerSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const StatsWidget = ({ label, value, subValue, trend, icon: Icon, accentColor }) => (
  <Card className="flex flex-col justify-between h-[120px] sm:h-[140px]" glow>
    <div className="flex justify-between items-start">
      <div className={`p-2 sm:p-2.5 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${accentColor}1A` }}>
        <Icon size={18} sm:size={20} style={{ color: accentColor }} />
        </div>
      {trend && (
        <span className={`flex items-center text-xs font-medium ${parseFloat(trend) >= 0 ? 'text-[#3CFF64]' : 'text-[#FF4D4D]'}`}>
          {parseFloat(trend) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(parseFloat(trend))}%
        </span>
      )}
    </div>
    <div>
      <h4 className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1 truncate">{label}</h4>
      <div className="text-xl sm:text-2xl font-semibold text-white tracking-tight truncate">{value}</div>
      {subValue && <div className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{subValue}</div>}
    </div>
  </Card>
);

const CalendarWidget = ({ trades }) => {
  const [date, setDate] = useState(new Date());
  const dailyData = useMemo(() => getCalendarData(trades), [trades]);
  
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); 
  const offset = startDay === 0 ? 6 : startDay - 1; 

  const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <Card className="col-span-1 lg:col-span-2 w-full overflow-hidden min-w-0" noPadding>
      <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
          <CalendarDays size={18} className="text-[#4FF3F9]" /> Profit Calendar
        </h3>
        <div className="flex items-center gap-2">
          <IconButton icon={ChevronLeft} onClick={() => setDate(new Date(year, month - 1, 1))} />
          <span className="text-xs sm:text-sm font-medium text-gray-300 w-24 sm:w-32 text-center">{monthName}</span>
          <IconButton icon={ChevronRight} onClick={() => setDate(new Date(year, month + 1, 1))} />
        </div>
      </div>
      
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 min-w-[280px]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[280px]">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="aspect-square rounded-lg bg-[#1A1D21]/30" />;
            
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const data = dailyData[dateKey];
            
            let bg = "bg-[#1A1D21] border border-white/5";
            let text = "text-gray-500";
            
            if (data) {
              if (data.pnl > 0) {
                bg = "bg-[#3CFF64]/10 border border-[#3CFF64]/30 hover:bg-[#3CFF64]/20";
                text = "text-[#3CFF64]";
              } else if (data.pnl < 0) {
                bg = "bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 hover:bg-[#FF4D4D]/20";
                text = "text-[#FF4D4D]";
              } else {
                bg = "bg-[#4FF3F9]/10 border border-[#4FF3F9]/30";
                text = "text-[#4FF3F9]";
              }
            }

            return (
              <div key={i} className={`aspect-square rounded-md sm:rounded-xl p-0.5 sm:p-2 flex flex-col justify-center sm:justify-between transition-all cursor-pointer group ${bg}`}>
                <span className={`text-[9px] sm:text-xs font-medium text-center sm:text-left ${data ? 'text-white' : 'text-gray-600'}`}>{d}</span>
                {data && (
                  <div className="text-center sm:text-right">
                    <div className={`text-[8px] sm:text-xs font-bold tracking-tight ${text}`}>
                      {data.pnl > 0 ? '+' : ''}{data.pnl.toFixed(0)}
                    </div>
                    <div className="hidden sm:block text-[9px] text-gray-500 mt-0.5 font-medium">
                      {data.count} Trd
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

const EquityCurveWidget = ({ trades, startingBalance }) => {
  let balance = startingBalance;
  const data = trades.slice().reverse().map(t => {
    balance += t.pnl;
    return { ...t, balance };
  });

  if (data.length === 0) {
      data.push({ date: new Date().toISOString().substring(0, 10), balance: startingBalance });
  }

  return (
    <Card className="col-span-1 h-full min-h-[350px] sm:min-h-[400px] w-full overflow-hidden min-w-0" noPadding>
      <div className="p-4 sm:p-6 border-b border-white/5">
        <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-[#A479FF]" /> Equity Curve
        </h3>
        </div>
      <div className="h-[280px] sm:h-[320px] w-full p-2 sm:p-4 pt-4 sm:pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A479FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#A479FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0C0F14', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#A479FF' }}
            />
            <Area type="monotone" dataKey="balance" stroke="#A479FF" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// --- 淘 VIEWS: ANALYTICS & MISTAKES ---

const AnalyticsView = ({ trades }) => {
    const { mostProfitable, worstPerforming, chartData: pairChartData } = getPairAnalytics(trades);
    const { sessionData, dayData, strategyData } = getTimeAndStrategyAnalytics(trades);

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ModernBarChart data={pairChartData} title="Top & Bottom Pairs" keyName="pair" />
                <ModernBarChart data={strategyData} title="Strategy Performance" keyName="name" primaryColor={THEME.accent.purple} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ModernBarChart data={sessionData} title="Session Performance" keyName="name" primaryColor={THEME.accent.yellow} />
                <ModernBarChart data={dayData} title="Day of Week Performance" keyName="name" primaryColor={THEME.accent.cyan} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Most Profitable Pair</div>
                    {mostProfitable ? (
                        <div>
                            <div className="text-3xl font-bold text-white">{mostProfitable.pair}</div>
                            <div className="text-[#3CFF64] text-lg font-mono">+${mostProfitable.pnl.toFixed(2)}</div>
                        </div>
                    ) : <div className="text-gray-500">N/A</div>}
                </Card>
                <Card className="min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Worst Performing Pair</div>
                    {worstPerforming ? (
                        <div>
                            <div className="text-3xl font-bold text-white">{worstPerforming.pair}</div>
                            <div className="text-[#FF4D4D] text-lg font-mono">${worstPerforming.pnl.toFixed(2)}</div>
                        </div>
                    ) : <div className="text-gray-500">N/A</div>}
                </Card>
            </div>
        </div>
    );
};

const MistakesView = ({ trades, onEdit }) => {
    const { totalMistakePnL, frequencyData, mistakeTrades } = getMistakeAnalytics(trades);
    const COLORS = [THEME.accent.red, THEME.accent.purple, THEME.accent.yellow, THEME.accent.cyan, THEME.accent.green, '#fff'];

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="col-span-1 lg:col-span-1 flex flex-col justify-center border-[#FF4D4D]/30 min-w-0" glow>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Loss Due to Mistakes</div>
                    <div className={`text-4xl font-bold font-mono ${totalMistakePnL <= 0 ? 'text-[#FF4D4D]' : 'text-[#3CFF64]'}`}>
                        {totalMistakePnL > 0 ? '+' : ''}${totalMistakePnL.toFixed(2)}
                    </div>
                    <div className="mt-3 text-[10px] text-gray-500">Cumulative PnL of all trades tagged with a mistake.</div>
                </Card>

                <Card className="col-span-1 lg:col-span-2 min-h-[300px] w-full overflow-hidden min-w-0" noPadding>
                    <div className="p-4 sm:p-6 border-b border-white/5">
                        <h3 className="text-lg font-medium text-white">Mistake Frequency</h3>
                    </div>
                    <div className="h-[250px] w-full p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={frequencyData} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                                    paddingAngle={5} dataKey="value"
                                    stroke="#131619" 
                                >
                                    {frequencyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0C0F14', border: '1px solid #333', borderRadius: '8px' }} 
                                    itemStyle={{ color: '#fff' }} 
                                />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card noPadding className="w-full overflow-hidden min-w-0">
                <div className="p-4 sm:p-6 border-b border-white/5">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <HeartHandshake className="text-[#3CFF64]" size={20} /> Trade Review & Corrections
                    </h3>
                </div>
                <div className="divide-y divide-white/5">
                    {mistakeTrades.map(trade => (
                        <div key={trade.id} className="p-4 sm:p-6 hover:bg-[#1A1D21] transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-white font-bold">{trade.pair}</span>
                                        <span className="text-xs text-gray-500">{trade.date}</span>
                                    </div>
                                    <Badge type="loss">{trade.mistake}</Badge>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-mono font-bold ${trade.pnl > 0 ? 'text-[#3CFF64]' : 'text-[#FF4D4D]'}`}>
                                        {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                    </span>
                                    <IconButton icon={Pencil} onClick={() => onEdit(trade)} />
                                </div>
                            </div>
                            <div className="bg-[#0C0F14] p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Corrective Action</p>
                                <p className="text-sm text-gray-300 italic">
                                    {trade.learnings || "No corrective action recorded. Edit trade to add."}
                                </p>
                            </div>
                        </div>
                    ))}
                    {mistakeTrades.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No mistakes logged. Keep it up!</div>
                    )}
                </div>
            </Card>
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
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${trade.type === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
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

const TradeList = ({ trades, onEdit, onDelete }) => {
    const [expandedTradeId, setExpandedTradeId] = useState(null);
    const toggleExpand = (id) => {
        setExpandedTradeId(prevId => prevId === id ? null : id);
    };

    return (
        <div className='w-full'>
            {/* MOBILE VIEW: Stack of Cards */}
            <div className="md:hidden">
                {trades.map((trade) => (
                    <MobileTradeCard 
                        key={trade.id} 
                        trade={trade} 
                        isExpanded={expandedTradeId === trade.id}
                        onExpand={() => toggleExpand(trade.id)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {/* DESKTOP VIEW: Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5 bg-[#131619]">
                <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                        <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-white/5">
                            <th className="p-4 pl-6">Date</th>
                            <th className="p-4">Pair</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Setup</th>
                            <th className="p-4 text-right">PnL</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Details</th> 
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-300">
                        {trades.map((trade) => (
                            <React.Fragment key={trade.id}>
                                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 pl-6 font-mono text-gray-400">{trade.date}</td>
                                    <td className="p-4 font-medium text-white">{trade.pair}</td>
                                    <td className="p-4">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${trade.type === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400">{trade.setup || '-'}</td>
                                    <td className={`p-4 text-right font-mono font-medium ${trade.pnl > 0 ? 'text-[#3CFF64]' : trade.pnl < 0 ? 'text-[#FF4D4D]' : 'text-gray-400'}`}>
                                        {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <Badge type={trade.outcome === 'WIN' ? 'win' : 'loss'}>{trade.outcome}</Badge>
                                    </td>
                                    <td className="p-4 text-center">
                                        <IconButton icon={expandedTradeId === trade.id ? ChevronUp : MoreHorizontal} onClick={() => toggleExpand(trade.id)} />
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex justify-end items-center gap-2">
                                            <IconButton icon={Pencil} onClick={() => onEdit(trade)} variant="ghost" className="opacity-70 group-hover:opacity-100" />
                                            <IconButton icon={Trash2} onClick={() => onDelete(trade)} variant="danger" className="opacity-70 group-hover:opacity-100" />
                                        </div>
                                    </td>
                                </tr>
                                {expandedTradeId === trade.id && (
                                    <tr className="bg-white/[0.01]">
                                        <td colSpan="8" className="p-6 border-b border-white/5">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="col-span-1">
                                                    {(trade.entry || trade.exit) && (
                                                        <div className="mb-4">
                                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Prices</p>
                                                            <div className="flex gap-4 text-sm font-mono text-white">
                                                                <span className="text-gray-400">Entry: <span className='text-white'>{trade.entry || '-'}</span></span>
                                                                <span className="text-gray-400">Exit: <span className='text-white'>{trade.exit || '-'}</span></span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {trade.notes && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Notes & Rationale</p>
                                                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{trade.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {trade.learnings && (
                                                    <div className="col-span-1">
                                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Key Learning</p>
                                                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{trade.learnings}</p>
                                                    </div>
                                                )}
                                                <div className={`col-span-1 space-y-3 ${!trade.notes && !trade.learnings ? 'md:col-span-3' : ''}`}>
                                                    {trade.tags && trade.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {trade.tags.map((tag, i) => (
                                                                <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-[#4FF3F9]/10 text-[#4FF3F9] font-medium">{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {trade.screenshot_url && (
                                                        <div className="p-3 rounded-lg bg-[#0C0F14] border border-[#A479FF]/20 flex items-center justify-between">
                                                            <p className="text-[#A479FF] font-semibold uppercase text-[10px]">Chart Screenshot</p>
                                                            <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#A479FF] hover:text-white transition-colors" >
                                                                {/* UPDATED: Removed the truncated URL string, kept only the button style */}
                                                                <Camera size={14} /> View Image
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {trades.length === 0 && (
                <div className="p-12 text-center text-gray-500 text-sm">No trades found. Start journaling.</div>
            )}
        </div>
    );
};

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className={`bg-[#131619] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 border border-white/10 ${THEME.text.primary}`} onClick={e => e.stopPropagation()} >
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#131619] z-10">
          <h2 className="text-xl font-bold">{title}</h2>
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
  pnl: '', // Changed to empty string to allow negative sign input
  setup: '',
  session: 'London',
  notes: '',
  mistake: '',
  learnings: '',
  tags: [],
  screenshot_url: '',
  // NEW FIELDS (Renamed to match user's DB schema)
  entry: '',
  exit: '',
};

const TradeModal = ({ isOpen, onClose, onSave, tradeToEdit, user }) => {
  const [trade, setTrade] = useState(initialTradeState);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (tradeToEdit) {
        setTrade({ 
          ...tradeToEdit, 
          pnl: String(tradeToEdit.pnl), // Convert pnl to string for the text input
          entry: tradeToEdit.entry ? String(tradeToEdit.entry) : '', // MATCH DB SCHEMA
          exit: tradeToEdit.exit ? String(tradeToEdit.exit) : '',     // MATCH DB SCHEMA
          tags: tradeToEdit.tags || [] 
        });
      } else {
        setTrade(initialTradeState);
      }
    }
  }, [isOpen, tradeToEdit]);

  // Simplified handleChange to keep all values as strings, allowing the '-' sign for PnL
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrade(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagChange = (newTags) => {
    setTrade(prev => ({ ...prev, tags: newTags }));
  };

  const uploadScreenshot = async (file) => {
    if (!file || !user) return '';
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    try {
      const { error: uploadError } = await supabase.storage.from('screenshots').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: publicURLData } = supabase.storage.from('screenshots').getPublicUrl(filePath);
      return publicURLData.publicUrl;
    } catch (error) {
      setError(`File upload failed: ${error.message.substring(0, 50)}...`);
      return '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (trade.screenshot_url) await handleRemoveScreenshot(false); 
      const url = await uploadScreenshot(file);
      if (url) setTrade(prev => ({ ...prev, screenshot_url: url }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;
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

  const handleRemoveScreenshot = async (resetState = true) => {
    if (!trade.screenshot_url) return;
    try {
      const parts = trade.screenshot_url.split('/');
      const fileName = parts.pop();
      const userId = parts.pop();
      const filePath = `${userId}/${fileName}`;
      const { error: deleteError } = await supabase.storage.from('screenshots').remove([filePath]);
      if (deleteError) console.error('Error deleting file:', deleteError.message);
      if (resetState) setTrade(prev => ({ ...prev, screenshot_url: '' }));
    } catch (error) {
      setError("Could not remove old screenshot. Try manually deleting it.");
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
    'Early Exit', 'Over-trading', 'Misreading Chart/Bias', 'Breaching Plan', 'Other'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tradeToEdit ? "Edit Trade Journal Entry" : "New Trade Journal Entry"} >
      <div className="px-6">
        {error && (
          <div className="p-3 mb-4 text-sm text-[#FF4D4D] bg-[#FF4D4D]/10 rounded-lg border border-[#FF4D4D]/30">{error}</div>
        )}
      </div>
      <form onSubmit={handleSubmit}
  onKeyDown={(e) => {
    // Prevent mobile browsers from jumping to the next input on Enter
    // TagsInput handles Enter itself, so this is safe
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }}
  className="px-6 pb-6 overflow-y-auto space-y-4">
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
            {/* UPDATED: Changed to type="text" to allow negative sign input */}
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
                {/* Renamed name to 'entry' */}
                <input type="text" name="entry" value={trade.entry} onChange={handleChange} className={`${inputClass} font-mono`} placeholder="e.g., 1.07542" />
            </InputGroup>
            <InputGroup label="Exit Price (Optional)">
                {/* Renamed name to 'exit' */}
                <input type="text" name="exit" value={trade.exit} onChange={handleChange} className={`${inputClass} font-mono`} placeholder="e.g., 1.07600" />
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
        <InputGroup label="Chart Screenshot (Optional)">
          {trade.screenshot_url ? (
            <div className="p-3 bg-[#131619] border border-white/10 rounded-xl flex justify-between items-center">
              {/* UPDATED: Only show a clean link to the image, not the URL itself */}
              <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#A479FF] hover:underline" >
                <Camera size={18} /> View Screenshot
              </a>
              <div className="flex items-center gap-2">
                <IconButton icon={X} onClick={handleRemoveScreenshot} variant="danger" className="text-sm" />
              </div>
            </div>
          ) : (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-center text-sm font-medium py-2.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/50 transition-colors flex items-center gap-2" disabled={isUploading}>
                {isUploading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-[#A479FF] rounded-full" /> : <Camera size={18} />}
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </>
          )}
        </InputGroup>
        <button type="submit" className="w-full mt-6 py-3 text-lg font-medium rounded-xl bg-[#3CFF64] text-black hover:bg-[#2EB84D] transition-colors flex items-center justify-center gap-2" disabled={isUploading}>
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
      <p className="text-gray-400 mb-4 px-6">Current Equity: <span className="text-white font-mono font-semibold">{formatCurrency(currentBalance)}</span></p>
      {error && (
        <div className="p-3 mb-4 mx-6 text-sm text-[#FF4D4D] bg-[#FF4D4D]/10 rounded-lg border border-[#FF4D4D]/30">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
        <InputGroup label="Transaction Type">
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass} >
            <option value="deposit">Deposit (Add Funds)</option>
            <option value="withdrawal">Withdrawal (Remove Funds)</option>
          </select>
        </InputGroup>
        <InputGroup label="Amount ($)">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} step="0.01" placeholder="e.g., 500.00" required />
        </InputGroup>
        <button type="submit" className="w-full py-3 text-lg font-medium rounded-xl bg-[#A479FF] text-white hover:bg-[#9361FF] transition-colors mt-6">
          Confirm Update
        </button>
      </form>
    </Modal>
  );
};

// --- SIGN OUT MODAL ---
const SignOutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Sign Out">
            <div className="p-6 pt-0">
                <p className="text-gray-400 mb-6">Are you sure you want to sign out of your MuyeFX account?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 rounded-xl text-white border border-white/20 hover:bg-white/10 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="py-2 px-4 rounded-xl bg-[#FF4D4D] text-white hover:bg-[#E54040] transition-colors">Sign Out</button>
                </div>
            </div>
        </Modal>
    );
};

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
                className={`relative flex-1 py-2 text-sm font-medium transition-colors duration-200 z-10 ${authView === 'sign_in' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthView('sign_up')}
                className={`relative flex-1 py-2 text-sm font-medium transition-colors duration-200 z-10 ${authView === 'sign_up' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="p-8">
             <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold text-white mb-1">
                  {authView === 'sign_in' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-xs text-gray-500">
                  {authView === 'sign_in' 
                    ? 'Enter your credentials to access your journal.' 
                    : 'Start tracking your edge today.'}
                </p>
             </div>

             <Auth
              supabaseClient={supabase}
              view={authView}
              showLinks={false} // Hide default bottom links so we can control them
              appearance={{
                theme: 'dark',
                variables: {
                  default: {
                    colors: {
                      brand: THEME.accent.purple,
                      brandAccent: '#9361FF',
                      brandButtonText: '#FFFFFF',
                      defaultButtonBackground: '#1A1D21',
                      defaultButtonText: '#FFFFFF',
                      defaultButtonBorder: 'rgba(255,255,255,0.1)',
                      inputBackground: '#0C0F14',
                      inputBorder: 'rgba(255,255,255,0.1)',
                      inputBorderHover: THEME.accent.purple,
                      inputBorderFocus: THEME.accent.purple,
                      inputLabelText: '#9CA3AF',
                    },
                    borderWidths: { buttonBorderWidth: '1px', inputBorderWidth: '1px' },
                    radii: { borderRadiusButton: '12px', inputBorderRadius: '12px' },
                    space: { inputPadding: '12px', buttonPadding: '12px' },
                    fonts: { bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`, buttonFontFamily: `ui-sans-serif, system-ui, sans-serif` }
                  },
                },
                style: {
                   button: { fontSize: '14px', fontWeight: '500' },
                   input: { fontSize: '14px', color: 'white' },
                   label: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', marginBottom: '4px' },
                   anchor: { color: THEME.accent.purple, fontSize: '12px' },
                }
              }}
              providers={['google']}
            />
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[10px] text-gray-600 uppercase tracking-widest">
             &copy; {new Date().getFullYear()} MuyeFX Journal
           </p>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

const App = () => {
  const { user, signOut } = useAuth();
  
  const [trades, setTrades] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [balance, setBalance] = useState(10000); 
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState('sign_in'); // State for Auth Page Toggle

  const updateBalanceInDB = async (newBalance) => {
    if (!user) return;
    const { error } = await supabase.from('user_settings').update({ starting_balance: newBalance }).eq('user_id', user.id); 
    if (error) console.error('Error updating balance:', error);
  };

  const fetchInitialData = async () => {
    if (!user) {
      setLoadingTrades(false);
      return;
    }
    setLoadingTrades(true);

    // Fetch all columns, including 'entry' and 'exit'
    const { data: tradesData, error: tradesError } = await supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      setLoadingTrades(false);
      return;
    }
    setTrades(tradesData.map(t => ({ ...t, pnl: Number(t.pnl) })));

    const { data: settings, error: settingsError } = await supabase.from('user_settings').select('starting_balance').eq('user_id', user.id).single();
    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching settings:', settingsError);
    } else if (settings) {
      setBalance(settings.starting_balance); 
    } else {
      await supabase.from('user_settings').upsert({ user_id: user.id, starting_balance: balance }, { onConflict: 'user_id' }); 
    }
    setLoadingTrades(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const handleSave = async (tradeToSave) => {
    const isEditing = !!tradeToSave.id;
    // PnL, entry, and exit are already parsed to number/null in TradeModal's handleSubmit
    // Use 'entry' and 'exit' to match the user's DB schema
    const { pnl, entry, exit, ...rest } = tradeToSave; 

    try {
      if (isEditing) {
        const { error, data: updatedTrade } = await supabase.from('trades').update({ 
            ...rest, 
            pnl: pnl, 
            entry: entry, // MATCH DB SCHEMA
            exit: exit,   // MATCH DB SCHEMA
            user_id: user.id 
        }).eq('id', tradeToSave.id).select().single();
        if (error) throw error;
        setTrades(trades.map(t => (t.id === updatedTrade.id ? updatedTrade : t)));
      } else {
        const { error, data: newTrade } = await supabase.from('trades').insert([{ 
            ...rest, 
            pnl: pnl, 
            entry: entry, // MATCH DB SCHEMA
            exit: exit,   // MATCH DB SCHEMA
            user_id: user.id 
        }]).select().single();
        if (error) throw error;
        setTrades([newTrade, ...trades]);
      }
    } catch (error) {
      console.error('Error saving trade:', error);
      // NOTE: This will now properly log any *other* issue if the save fails
      throw new Error(`Failed to save trade entry: ${error.message}`);
    }
  };

  const handleDelete = async (trade) => {
    if (!window.confirm(`Are you sure you want to delete the trade for ${trade.pair} on ${trade.date}? This action is irreversible.`)) {
      return;
    }
    try {
      const { error } = await supabase.from('trades').delete().eq('id', trade.id);
      if (error) throw error;
      setTrades(trades.filter(t => t.id !== trade.id));
    } catch (error) {
      console.error('Error deleting trade:', error);
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
    const { error } = await signOut();
    if (error) console.error("Error signing out:", error);
    setSignOutModalOpen(false);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ outcome: '', pair: '' });
  
  const filteredTrades = useMemo(() => {
    let filtered = trades;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.pair.toLowerCase().includes(lowerSearchTerm) || trade.setup?.toLowerCase().includes(lowerSearchTerm) || trade.notes?.toLowerCase().includes(lowerSearchTerm) 
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

  const toggleFilter = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: prev[name] === value ? '' : value }));
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatsWidget label="Current Equity" value={formatCurrency(currentEquityForDisplay)} subValue={totalPnL >= 0 ? `Profit: ${formatCurrency(totalPnL)}` : `Loss: ${formatCurrency(totalPnL)}`} icon={Wallet} accentColor={THEME.accent.green} />
                <StatsWidget label="Total PnL" value={formatCurrency(totalPnL)} trend={pnlPercentage.toFixed(1)} icon={PieIcon} accentColor={totalPnL >= 0 ? THEME.accent.green : THEME.accent.red} />
                <StatsWidget label="Win Rate" value={`${winRate.toFixed(1)}%`} subValue={`${winsCount}W / ${lossesCount}L`} icon={Target} accentColor={THEME.accent.cyan} />
                <StatsWidget label="Average R:R" value={`1:${rr.toFixed(2)}`} icon={TrendingUp} accentColor={THEME.accent.purple} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <EquityCurveWidget trades={trades} startingBalance={balance} />
                <CalendarWidget trades={trades} />
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
        return <MistakesView trades={trades} onEdit={handleEdit} />;
      default:
        return <div className="text-white">View not found.</div>;
    }
  };

  // App.jsx (Inside the App component, with other useState calls)
const [isResettingPassword, setIsResettingPassword] = useState(false); // <-- NEW STATE

// ... (Your updateBalanceInDB function)

// ... (Your fetchInitialData function)

useEffect(() => {
  // Check URL hash for recovery token BEFORE fetching data
  const hash = window.location.hash;
  if (hash && hash.includes('type=recovery')) {
    setIsResettingPassword(true);
    // If we're resetting, we don't need to proceed with normal data fetch yet.
    // The user will be authenticated implicitly by Supabase on the UpdatePasswordScreen.
    return; 
  }

  fetchInitialData();
}, [user]); // Keep the dependency on 'user'

 // NEW CODE USING CUSTOM AuthScreen
// Priority 1: If user clicked a reset link (handles the 'type=recovery' URL hash)
if (isResettingPassword) {
  return (
    <UpdatePasswordScreen 
      onComplete={() => {
        setIsResettingPassword(false);
        // Clear the tokens from the URL hash after successful reset
        window.location.hash = ''; 
      }} 
    />
  );
}

// Priority 2: User is NOT logged in. Show the main Auth screen.
if (!user) {
  // The AuthScreen component already includes the logic for sign-in/sign-up/forgot password.
  return <AuthScreen />;
}

// Priority 3: User IS logged in. Proceed to main dashboard rendering.
const { totalPnL } = getKPIs(trades, balance);
const currentEquityForModal = balance + totalPnL;
return (
    <> 
      <div className={`min-h-screen ${THEME.bg} flex ${THEME.text.primary} relative overflow-x-hidden`}>
        <div className="hidden md:flex fixed w-64 h-full z-20">
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} triggerSignOut={triggerSignOut} />
        </div>
        
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-[998] transition-opacity" onClick={() => setIsSidebarOpen(false)} />
        )}
        <div className={`fixed top-0 left-0 h-full w-64 bg-[#0C0F14] border-r border-white/5 z-[999] transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} triggerSignOut={triggerSignOut} />
          <IconButton icon={X} onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white hover:text-[#A479FF] z-50" />
        </div>

        <main className="flex-1 md:ml-64 flex flex-col transition-all duration-300 min-w-0">
          <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 bg-[#0C0F14] sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <IconButton icon={Menu} onClick={() => setIsSidebarOpen(true)} className="md:hidden" />
              <h1 className="text-xl font-semibold capitalize hidden md:block">{currentView}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-400 hidden sm:inline">Balance: <span className="text-white font-mono font-bold">{formatCurrency(currentEquityForModal)}</span></span>
              <button onClick={() => setBalanceModalOpen(true)} className="py-2 px-4 text-sm font-medium rounded-xl bg-[#A479FF]/10 text-[#A479FF] hover:bg-[#A479FF]/20 transition-colors flex items-center gap-2">
                <Wallet size={18} /> <span className="hidden md:inline">Edit Balance</span>
              </button>
              <button onClick={() => { setEditTrade(null); setModalOpen(true); }} className="py-2 px-4 text-sm font-medium rounded-xl bg-[#3CFF64] text-black hover:bg-[#2EB84D] transition-colors flex items-center gap-2">
                <Plus size={18} /> <span className="hidden md:inline">New Trade</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 z-10">
            <div className="max-w-7xl mx-auto pb-safe">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      <TradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} tradeToEdit={editTrade} user={user} />
      <EditBalanceModal isOpen={balanceModalOpen} onClose={() => setBalanceModalOpen(false)} currentBalance={currentEquityForModal} onUpdate={handleBalanceUpdate} />
      <SignOutConfirmationModal isOpen={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} onConfirm={confirmSignOut} />
      
      <style>{`
        .recharts-tooltip-cursor { fill: rgba(255,255,255,0.05) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0C0F14; }
        ::-webkit-scrollbar-thumb { background: #1A1D21; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #2A2D31; }
        
        /* Custom keyframes for slow, continuous spin */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </>
  );
};

export default App;