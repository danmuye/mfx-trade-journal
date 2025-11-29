import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, BookOpen, AlertTriangle, BarChart3, Plus, Search, 
  Filter, TrendingUp, Target, BrainCircuit, X, Save, Camera, 
  MoreHorizontal, Pencil, Trash2, LogOut, ChevronLeft, ChevronRight, 
  CalendarDays, HeartHandshake, Wallet, ArrowUpRight, ArrowDownRight,
  PieChart as PieIcon, Menu, ChevronUp
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';
// NOTE: Assuming this imports Auth and the client instance
import { supabase, useAuth, Auth } from './supabase'; 

// --- 🎨 DESIGN SYSTEM & UTILS ---
const THEME = {
  bg: "bg-[#0C0F14]", // Deep Obsidian
  card: "bg-[#131619]", // Slightly lighter charcoal
  cardHover: "hover:bg-[#1A1D21]",
  border: "border-white/5",
  glass: "backdrop-blur-xl bg-[#131619]/80 border-white/10",
  accent: {
    green: "#3CFF64", // Neon Green
    red: "#FF4D4D",   // Neon Red
    purple: "#A479FF", // Neon Purple
    cyan: "#4FF3F9",   // Neon Cyan
    yellow: "#FFD860"  // Soft Yellow
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


// --- 🧩 UI PRIMITIVES ---

const Card = ({ children, className = "", noPadding = false, glow = false }) => (
  <div className={`relative group rounded-2xl border ${THEME.border} ${THEME.card} overflow-hidden transition-all duration-300 ${glow ? 'hover:shadow-[0_0_20px_rgba(164,121,255,0.1)] hover:border-white/10' : ''} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
    <div className={noPadding ? "" : "p-6"}>
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

// --- 📊 ANALYTICS & UTILITIES ---

const TRADEABLE_ASSETS = {
  'Forex Majors': [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'
  ],
  'Forex Minors (Crosses)': [
    'EUR/GBP', 'EUR/AUD', 'EUR/CAD', 'EUR/CHF', 'EUR/NZD',
    'GBP/JPY', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD',
    'AUD/JPY', 'AUD/CAD', 'AUD/CHF', 'AUD/NZD',
    'CAD/JPY', 'CHF/JPY', 'NZD/JPY', 'NZD/CAD', 'NZD/CHF'
  ],
  'Metals': ['XAU/USD (Gold)', 'XAG/USD (Silver)'],
  'Indices': ['US30 (Dow)', 'NAS100 (Nasdaq)', 'SPX500 (S&P 500)'],
  'Cryptos': ['BTC/USD', 'ETH/USD'],
  'Other': ['Custom Pair']
};

const getKPIs = (trades) => {
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const wins = trades.filter(t => t.outcome === 'WIN');
  const losses = trades.filter(t => t.outcome === 'LOSS');
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  
  const avgWin = wins.length > 0 ? wins.reduce((acc, t) => acc + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0)) / losses.length : 0;
  const rr = avgLoss > 0 ? (avgWin / avgLoss) : 0;

  return { totalPnL, winRate, rr, totalTrades: trades.length };
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

    // Filter top 5 and bottom 5 for charting
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

    const sessionData = Object.entries(analytics.sessionPnL)
        .map(([name, pnl]) => ({ name, pnl }))
        .sort((a, b) => SESSIONS.indexOf(a.name) - SESSIONS.indexOf(b.name));

    const dayData = Object.values(analytics.dayPnL)
        .filter(d => d.trades > 0)
        .sort((a, b) => a.order - b.order)
        .map(d => ({ name: DAYS_OF_WEEK[d.order], pnl: d.pnl }));
    
    const strategyData = Object.entries(analytics.strategyPnL)
        .map(([name, pnl]) => ({ name, pnl }))
        .sort((a, b) => b.pnl - a.pnl);

    return { sessionData, dayData, strategyData };
};

const getMistakeAnalytics = (trades) => {
    const mistakeTrades = trades.filter(t => t.mistake && t.mistake.length > 0);
    const totalMistakePnL = mistakeTrades.reduce((acc, t) => acc + t.pnl, 0);

    const frequencyMap = mistakeTrades.reduce((acc, t) => {
        acc[t.mistake] = (acc[t.mistake] || 0) + 1;
        return acc;
    }, {});

    const frequencyData = Object.entries(frequencyMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return { totalMistakePnL, frequencyData, mistakeTrades };
};

// --- 🧱 REUSABLE CHART COMPONENT ---

const ModernBarChart = ({ data, title, primaryColor = THEME.accent.cyan, keyName = 'name', height = 300 }) => {
    if (!data || data.length === 0) return (
        <Card className="flex items-center justify-center min-h-[300px] text-gray-500 text-sm">
            No data available for {title}
        </Card>
    );

    return (
        <Card noPadding>
            <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-medium text-white">{title}</h3>
            </div>
            <div className="p-6" style={{ height: `${height}px` }}>
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

// --- 🧩 DASHBOARD WIDGETS ---

// --- 🆕 MOBILE NAVIGATION ---
const MobileNav = ({ currentView, setCurrentView }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'analytics', icon: BarChart3, label: 'Data' },
    { id: 'mistakes', icon: AlertTriangle, label: 'Review' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#131619]/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center pb-safe pt-3 px-2 pb-2">
      {items.map((item) => {
        const active = currentView === item.id;
        return (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200
              ${active ? 'text-[#A479FF]' : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const Sidebar = ({ currentView, setCurrentView, triggerSignOut }) => { // Updated prop name to triggerSignOut
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'mistakes', icon: AlertTriangle, label: 'Mistakes' },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-white/5 flex-col bg-[#0C0F14] z-20 fixed h-full transition-all duration-300">
      <div className="h-20 flex items-center justify-start px-6 border-b border-white/5 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A479FF] to-[#4FF3F9] flex items-center justify-center text-black font-bold">M</div>
        <span className="text-lg font-medium tracking-tight text-white">Muye<span className="text-gray-500">FX</span></span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
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

      <div className="p-4 border-t border-white/5">
        <button onClick={triggerSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const StatsWidget = ({ label, value, subValue, trend, icon: Icon, accentColor }) => (
  <Card className="flex flex-col justify-between h-[140px]" glow>
    <div className="flex justify-between items-start">
      <div className={`p-2.5 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${accentColor}1A` }}>
        <Icon size={20} style={{ color: accentColor }} />
        </div>
      {trend && (
        <span className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-[#3CFF64]' : 'text-[#FF4D4D]'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</h4>
      <div className="text-2xl font-semibold text-white tracking-tight">{value}</div>
      {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
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
    <Card className="col-span-1 lg:col-span-2 h-full min-h-[400px]" noPadding>
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <CalendarDays size={18} className="text-[#4FF3F9]" /> Profit Calendar
        </h3>
        <div className="flex items-center gap-2">
          <IconButton icon={ChevronLeft} onClick={() => setDate(new Date(year, month - 1, 1))} />
          <span className="text-sm font-medium text-gray-300 w-32 text-center">{monthName}</span>
          <IconButton icon={ChevronRight} onClick={() => setDate(new Date(year, month + 1, 1))} />
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
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
              <div key={i} className={`aspect-square rounded-xl p-1 sm:p-2 flex flex-col justify-between transition-all cursor-pointer group ${bg}`}>
                <span className={`text-xs font-medium ${data ? 'text-white' : 'text-gray-600'}`}>{d}</span>
                {data && (
                  <div className="text-right">
                    <div className={`text-[8px] sm:text-[10px] lg:text-xs font-bold tracking-tight ${text}`}>
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

const EquityCurveWidget = ({ trades }) => {
  let balance = 0;
  const data = trades.slice().reverse().map(t => {
    balance += t.pnl;
    return { ...t, balance };
  });

  return (
    <Card className="col-span-1 h-full min-h-[400px]" noPadding>
      <div className="p-6 border-b border-white/5">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-[#A479FF]" /> Equity Curve
        </h3>
        </div>
      <div className="h-[320px] w-full p-4 pt-8">
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

// --- 📑 VIEWS: ANALYTICS & MISTAKES ---

const AnalyticsView = ({ trades }) => {
    const { mostProfitable, worstPerforming, chartData: pairChartData } = getPairAnalytics(trades);
    const { sessionData, dayData, strategyData } = getTimeAndStrategyAnalytics(trades);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModernBarChart data={pairChartData} title="Top & Bottom Pairs" keyName="pair" />
                <ModernBarChart data={strategyData} title="Strategy Performance" keyName="name" primaryColor={THEME.accent.purple} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModernBarChart data={sessionData} title="Session Performance" keyName="name" primaryColor={THEME.accent.yellow} />
                <ModernBarChart data={dayData} title="Day of Week Performance" keyName="name" primaryColor={THEME.accent.cyan} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Most Profitable Pair</div>
                    {mostProfitable ? (
                        <div>
                            <div className="text-3xl font-bold text-white">{mostProfitable.pair}</div>
                            <div className="text-[#3CFF64] text-lg font-mono">+${mostProfitable.pnl.toFixed(2)}</div>
                        </div>
                    ) : <div className="text-gray-500">N/A</div>}
                </Card>
                <Card>
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-1 flex flex-col justify-center border-[#FF4D4D]/30" glow>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Loss Due to Mistakes</div>
                    <div className={`text-4xl font-bold font-mono ${totalMistakePnL <= 0 ? 'text-[#FF4D4D]' : 'text-[#3CFF64]'}`}>
                        {totalMistakePnL > 0 ? '+' : ''}${totalMistakePnL.toFixed(2)}
                    </div>
                    <div className="mt-3 text-[10px] text-gray-500">Cumulative PnL of all trades tagged with a mistake.</div>
                </Card>

                <Card className="col-span-1 lg:col-span-2 min-h-[300px]" noPadding>
                    <div className="p-6 border-b border-white/5">
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

            <Card noPadding>
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <HeartHandshake className="text-[#3CFF64]" size={20} /> Trade Review & Corrections
                    </h3>
                </div>
                <div className="divide-y divide-white/5">
                    {mistakeTrades.map(trade => (
                        <div key={trade.id} className="p-6 hover:bg-[#1A1D21] transition-colors">
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

// --- 📝 TRADE LIST & MODAL ---

const TradeList = ({ trades, onEdit, onDelete }) => {
  // NEW STATE: Tracks which trade ID is currently expanded
  const [expandedTradeId, setExpandedTradeId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedTradeId(prevId => prevId === id ? null : id);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#131619]">
      <table className="w-full text-left border-collapse min-w-[850px] lg:min-w-0">
        <thead>
          <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-white/5">
            <th className="p-4 pl-6">Date</th>
            <th className="p-4">Pair</th>
            <th className="p-4">Type</th>
            <th className="p-4">Setup</th>
            <th className="p-4 text-right">PnL</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Details</th> {/* NEW HEADER */}
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
                {/* NEW DETAILS CELL */}
                <td className="p-4 text-center">
                  <IconButton 
                    icon={expandedTradeId === trade.id ? ChevronUp : MoreHorizontal} 
                    onClick={() => toggleExpand(trade.id)} 
                    className={expandedTradeId === trade.id ? 'text-[#A479FF] rotate-180' : 'text-gray-500'}
                  />
                </td>
                {/* END NEW DETAILS CELL */}
                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton icon={Pencil} onClick={() => onEdit(trade)} />
                    <IconButton icon={Trash2} onClick={() => onDelete(trade)} variant="danger" />
                  </div>
                </td>
              </tr>
              
              {/* EXPANDED DETAILS ROW */}
              {expandedTradeId === trade.id && (
                <tr className="bg-white/[0.03] transition-all">
                  <td colSpan="8" className="p-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {trade.notes && (
                        <div className="p-3 rounded-lg bg-[#0C0F14] border border-white/5">
                          <p className="text-gray-500 font-semibold mb-1 uppercase text-[10px]">Notes</p>
                          <p className="text-gray-300 italic">{trade.notes}</p>
                        </div>
                      )}
                      {trade.mistake && (
                        <div className="p-3 rounded-lg bg-[#0C0F14] border border-[#FF4D4D]/20">
                          <p className="text-[#FF4D4D] font-semibold mb-1 uppercase text-[10px]">Mistake</p>
                          <p className="text-gray-300 italic">{trade.mistake}</p>
                        </div>
                      )}
                      {trade.learnings && (
                        <div className="p-3 rounded-lg bg-[#0C0F14] border border-[#3CFF64]/20">
                          <p className="text-[#3CFF64] font-semibold mb-1 uppercase text-[10px]">Learnings</p>
                          <p className="text-gray-300 italic">{trade.learnings}</p>
                        </div>
                      )}
                      {trade.tags && trade.tags.length > 0 && (
                        <div className="p-3 rounded-lg bg-[#0C0F14] border border-[#4FF3F9]/20">
                          <p className="text-[#4FF3F9] font-semibold mb-1 uppercase text-[10px]">Tags</p>
                          <div className='flex flex-wrap gap-1'>
                            {trade.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-[#4FF3F9]/10 text-[#4FF3F9] font-medium">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* NEW SCREENSHOT VIEW BUTTON */}
                      {trade.screenshot_url && (
                        <div className="p-3 rounded-lg bg-[#0C0F14] border border-[#A479FF]/20 flex items-center justify-between">
                          <p className="text-[#A479FF] font-semibold uppercase text-[10px]">Chart Screenshot</p>
                          <a 
                            href={trade.screenshot_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-xs text-[#A479FF] hover:text-white transition-colors"
                          >
                            <Camera size={14} /> 
                            View Image
                          </a>
                        </div>
                      )}
                      {/* END NEW SCREENSHOT VIEW BUTTON */}

                      {!trade.notes && !trade.mistake && !trade.learnings && (!trade.tags || trade.tags.length === 0) && !trade.screenshot_url && (
                         <div className="col-span-3 text-center text-gray-500 p-2">No detailed notes logged for this trade.</div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {trades.length === 0 && (
        <div className="p-12 text-center text-gray-500 text-sm">No trades found. Start journaling.</div>
      )}
    </div>
  );
};

// --- NEW TAGS INPUT COMPONENT ---
const TagsInput = ({ tags, setTags, label }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    // Check for Enter key
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault(); // Prevent form submission
      const newTag = inputValue.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ''); // Basic sanitation
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <InputGroup label={label}>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[36px]">
        {tags.map((tag, index) => (
          // Blue/Cyan style applied here
          <span key={index} className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-[#4FF3F9]/20 text-[#4FF3F9] border border-[#4FF3F9]/30">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-[#4FF3F9] hover:text-white transition-colors p-0.5 rounded-full">
              <X size={10} strokeWidth={3} /> {/* Small 'x' icon */}
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className={inputClass}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type tag and press Enter to confirm"
      />
    </InputGroup>
  );
};
// --- END NEW TAGS INPUT COMPONENT ---

const TradeModal = ({ isOpen, onClose, onSave, tradeToEdit, user }) => {
  const initialData = tradeToEdit || {
    date: new Date().toISOString().split('T')[0],
    pair: 'EUR/USD',
    type: 'Long',
    session: '',
    entry: '',
    exit: '',
    pnl: '',
    setup: '',
    mistake: '',
    notes: '',
    learnings: '',
    screenshot_url: '',
    tags: [], // Added new tags field
  };
  
  const [formData, setFormData] = useState(initialData);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Ensure tags defaults to an array if tradeToEdit exists but tags doesn't
    setFormData({ ...initialData, tags: tradeToEdit?.tags || [] });
  }, [tradeToEdit, isOpen]);

  // Placeholder for screenshot handling (requires implementation)
  const handleScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filePath);

    setFormData(prev => ({ ...prev, screenshot_url: publicUrlData.publicUrl }));
    setIsUploading(false);
  };
  // End screenshot handler placeholder

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation and formatting before save
    const finalData = {
      ...formData,
      pnl: parseFloat(formData.pnl || 0),
      entry: parseFloat(formData.entry || 0),
      exit: parseFloat(formData.exit || 0),
      outcome: (parseFloat(formData.pnl) || 0) > 0 ? 'WIN' : (parseFloat(formData.pnl) || 0) < 0 ? 'LOSS' : 'BREAKEVEN'
    };
    onSave(finalData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#131619] shadow-2xl border border-white/10">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0C0F14]/50 rounded-t-2xl">
          <h3 className="text-xl font-medium text-white">{tradeToEdit ? 'Edit Trade Log' : 'Log New Trade'}</h3>
          <IconButton icon={X} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <InputGroup label="Date">
              <input type="date" className={inputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </InputGroup>
            <InputGroup label="Pair">
              {/* UPDATED: Currency Pair Segmented Dropdown */}
              <select className={selectClass} value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value})}>
                <option value="" disabled>Select Pair</option>
                {Object.entries(TRADEABLE_ASSETS).map(([group, pairs]) => (
                  <optgroup key={group} label={group} className="text-gray-400">
                    {pairs.map(pair => (
                      <option key={pair} value={pair} className="text-white bg-[#131619]">{pair}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </InputGroup>
            <InputGroup label="Direction">
              <select className={selectClass} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Long</option>
                <option>Short</option>
              </select>
            </InputGroup>
            <InputGroup label="Session">
              <select className={selectClass} value={formData.session} onChange={e => setFormData({...formData, session: e.target.value})}>
                <option value="">Select...</option>
                {['Asian', 'London', 'NYC', 'Close'].map(s => <option key={s}>{s}</option>)}
              </select>
            </InputGroup>
          </div>

          <div className="p-5 rounded-xl bg-[#0C0F14]/50 border border-white/5 grid grid-cols-3 gap-6">
            <InputGroup label="Entry Price">
              <input type="number" step="0.00001" className={inputClass} value={formData.entry} onChange={e => setFormData({...formData, entry: e.target.value})} placeholder="0.00000" />
            </InputGroup>
            <InputGroup label="Exit Price">
              <input type="number" step="0.00001" className={inputClass} value={formData.exit} onChange={e => setFormData({...formData, exit: e.target.value})} placeholder="0.00000" />
            </InputGroup>
            <InputGroup label="Realized PnL ($)">
              <input 
                type="number" 
                className={`${inputClass} font-mono font-medium ${parseFloat(formData.pnl) > 0 ? 'text-[#3CFF64] border-[#3CFF64]/30' : parseFloat(formData.pnl) < 0 ? 'text-[#FF4D4D] border-[#FF4D4D]/30' : ''}`} 
                value={formData.pnl} 
                onChange={e => setFormData({...formData, pnl: e.target.value})} 
                placeholder="0.00" 
              />
            </InputGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Strategy / Setup">
              <select className={selectClass} value={formData.setup} onChange={e => setFormData({...formData, setup: e.target.value})}>
                <option value="">Select Strategy...</option>
                {['Break & Retest', 'Liquidity Sweep', 'Supply/Demand', 'Trend Continuation', 'Gap Fill'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </InputGroup>
            <InputGroup label="Mistake (If Any)">
              <select className={`${selectClass} ${formData.mistake ? 'border-[#FF4D4D]/50 text-[#FF4D4D]' : ''}`} value={formData.mistake} onChange={e => setFormData({...formData, mistake: e.target.value})}>
                <option value="">No Mistake</option>
                {['FOMO', 'Revenge', 'Over-leveraging', 'Poor Execution', 'Early Exit', 'No Stop Loss'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </InputGroup>
          </div>
          
          {/* NEW TAGS INPUT FIELD */}
          <TagsInput 
            label="Tags"
            tags={formData.tags}
            setTags={(newTags) => setFormData({...formData, tags: newTags})}
          />
          {/* END NEW TAGS INPUT FIELD */}

          <InputGroup label="Notes / Observations">
            <textarea rows="3" className={inputClass} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Market conditions, thoughts, emotions..." />
          </InputGroup>

          {formData.mistake && (
            <InputGroup label="Learnings / Corrective Action">
              <textarea rows="2" className={`${inputClass} border-[#FF4D4D]/20`} value={formData.learnings} onChange={e => setFormData({...formData, learnings: e.target.value})} placeholder="What will you do differently next time?" />
            </InputGroup>
          )}

          <div className="border border-dashed border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors relative group">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#4FF3F9] group-hover:bg-[#4FF3F9]/10 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Camera size={20} />
            </div>
            {formData.screenshot_url ? (
              <div className="flex items-center gap-2">
                <img src={formData.screenshot_url} className="h-12 w-12 rounded object-cover border border-white/20" />
                <span className="text-xs text-[#3CFF64]">Image Attached</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 cursor-pointer" onClick={() => fileInputRef.current?.click()}>Click to upload chart screenshot</div>
            )}
          </div>

        </form>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#0C0F14]">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-8 py-2.5 rounded-xl bg-[#3CFF64] text-black text-sm font-bold hover:shadow-[0_0_20px_rgba(60,255,100,0.3)] transition-all">
            Save Trade
          </button>
        </div>
      </div>
    </div>
  );
};

const EditBalanceModal = ({ isOpen, onClose, currentBalance, onUpdate }) => {
  const [newBalance, setNewBalance] = useState(currentBalance);
  
  useEffect(() => { if(isOpen) setNewBalance(currentBalance); }, [isOpen, currentBalance]);
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(parseFloat(newBalance));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm bg-[#131619] shadow-2xl" noPadding>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Update Account Balance</h3>
          <IconButton icon={X} onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Current Equity ($)</label>
            <input 
              type="number" step="0.01" 
              value={newBalance} 
              onChange={e => setNewBalance(e.target.value)} 
              className="w-full bg-[#0C0F14] border border-white/10 rounded-xl px-4 py-2.5 text-lg font-mono text-[#4FF3F9] focus:border-[#4FF3F9]/50 outline-none" 
              autoFocus 
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-[#4FF3F9] text-black font-bold text-sm hover:bg-[#3BD2D8] transition-all">
            Update Balance
          </button>
        </form>
      </Card>
    </div>
  );
};

// --- 🆕 NEW: SIGN OUT CONFIRMATION MODAL ---
const SignOutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm bg-[#131619] shadow-2xl" noPadding>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <LogOut size={20} className="text-[#FF4D4D]" /> Confirm Sign Out
          </h3>
          <IconButton icon={X} onClick={onClose} />
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-300">
            Are you sure you want to sign out? You will be logged out of your trading journal.
          </p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="px-6 py-2.5 rounded-xl bg-[#FF4D4D] text-white text-sm font-bold hover:bg-[#E03A3A] transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
// --- END NEW: SIGN OUT CONFIRMATION MODAL ---


// --- 📱 MAIN APP COMPONENT ---

const App = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('muye_view') || 'dashboard');
  const [trades, setTrades] = useState([]);
  const [balance, setBalance] = useState(5000);
  const [modalOpen, setModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false); // New state for sign out modal
  const [editTrade, setEditTrade] = useState(null);

  // === 🚨 FIX: SUPABASE REDIRECT HANDLER (SOLUTION 1) ===
  useEffect(() => {
    // 1. Check for session immediately on component mount (for hash URLs)
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && window.location.hash.includes('access_token')) {
            console.log('Found token in URL fragment. Redirecting to clean URL.');
            // Use replace() to remove the hash from history
            window.location.replace(window.location.origin);
        }
    });

    // 2. Also subscribe to auth changes for robustness
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                console.log('SIGNED_IN event received. Checking URL for hash cleanup.');
                // Re-run the redirect check if a successful sign-in happens
                if (window.location.hash.includes('access_token')) {
                    window.location.replace(window.location.origin);
                }
            }
        }
    );

    return () => subscription.unsubscribe();
  }, []);
  // === 🚨 END FIX ===

  // Load Data
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: false });
      // Ensure tags field exists and is an array on load
      if (data) setTrades(data.map(t => ({ ...t, tags: t.tags || [] }))); 
      
      const { data: settings } = await supabase.from('user_settings').select('starting_balance').eq('user_id', user.id).single();
      if (settings) setBalance(settings.starting_balance);
    };
    fetchData();
  }, [user]);

  useEffect(() => localStorage.setItem('muye_view', currentView), [currentView]);

  // Handlers
  const handleSave = async (trade) => {
    const payload = { ...trade, user_id: user.id };
    if (trade.id && trades.find(t => t.id === trade.id)) {
      await supabase.from('trades').update(payload).eq('id', trade.id);
    } else {
      await supabase.from('trades').insert([payload]);
    }
    const { data } = await supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: false });
    // Ensure tags field exists and is an array after save
    setTrades(data ? data.map(t => ({ ...t, tags: t.tags || [] })) : []);
    setModalOpen(false);
    setEditTrade(null);
  };

  const handleDelete = async (trade) => {
    if(!confirm("Are you sure you want to delete this trade log? This action cannot be undone.")) return;
    await supabase.from('trades').delete().eq('id', trade.id);
    if (trade.screenshot_url) {
      const path = trade.screenshot_url.split('/public/')[1];
      if(path) await supabase.storage.from('screenshots').remove([path]);
    }
    setTrades(prev => prev.filter(t => t.id !== trade.id));
  };

  const handleBalanceUpdate = async (newCurrentBalance) => {
    const kpis = getKPIs(trades);
    const newStartingBalance = newCurrentBalance - kpis.totalPnL;
    setBalance(newStartingBalance);
    await supabase.from('user_settings').upsert({ user_id: user.id, starting_balance: newStartingBalance }, { onConflict: 'user_id' });
  };
  
  // New Sign Out Handler
  const handleSignOut = () => {
    setSignOutModalOpen(true);
  };

  const confirmSignOut = () => {
    signOut(); // Execute the actual sign out function
    setSignOutModalOpen(false);
  };

  if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0F14] p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Muye<span className="text-gray-500">FX</span> Login</h1>
        <Auth
          supabaseClient={supabase}
          // 🚨 CORRECTION APPLIED: Using window.location.origin + '/' ensures an absolute, clean root path.
          // This ensures the Supabase OAuth service sends the user back to http://localhost:3000/
          redirectTo={window.location.origin + '/'} 
          // NOTE: You should also check if magicLink={true} is needed for email sign-in.
          providers={['google', 'email']} 
          appearance={{ theme: { default: { colors: { brand: '#A479FF', brandAccent: '#4FF3F9' } } } }}
        />
      </div>
    </div>
  );
}

  const kpis = getKPIs(trades);
  const currentBalance = balance + kpis.totalPnL;

  const renderContent = () => {
    if (currentView === 'dashboard') {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsWidget label="Net PnL" value={formatCurrency(kpis.totalPnL)} icon={Wallet} accentColor={THEME.accent.green} trend={kpis.totalPnL > 0 ? 12 : -5} />
            <StatsWidget label="Win Rate" value={`${kpis.winRate.toFixed(1)}%`} subValue={`${Math.round(kpis.totalTrades * (kpis.winRate/100))}W / ${kpis.totalTrades - Math.round(kpis.totalTrades * (kpis.winRate/100))}L`} icon={Target} accentColor={THEME.accent.purple} />
            <StatsWidget label="Profit Factor" value={`${kpis.rr.toFixed(2)}`} icon={TrendingUp} accentColor={THEME.accent.cyan} />
            <StatsWidget label="Total Trades" value={kpis.totalTrades} icon={BarChart3} accentColor={THEME.accent.yellow} />
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
            <CalendarWidget trades={trades} />
            <EquityCurveWidget trades={trades} />
          </div>
        </div>
      );
    }
    
    if (currentView === 'journal') return <TradeList trades={trades} onEdit={(t)=>{setEditTrade(t); setModalOpen(true)}} onDelete={handleDelete} />;
    
    if (currentView === 'analytics') return <AnalyticsView trades={trades} />;

    if (currentView === 'mistakes') return <MistakesView trades={trades} onEdit={(t)=>{setEditTrade(t); setModalOpen(true)}} />;
    
    return <div className="text-center text-gray-500 py-20">Module under renovation.</div>;
  };

  return (
    <div className={`min-h-screen ${THEME.bg} text-white font-sans selection:bg-[#A479FF]/30`}>
      <div className="flex h-screen overflow-hidden">
        
        {/* Mobile Nav (Hidden on Desktop) */}
        <MobileNav currentView={currentView} setCurrentView={setCurrentView} />

        {/* Desktop Sidebar (Hidden on Mobile) */}
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} triggerSignOut={handleSignOut} />
        
        <main className="flex-1 md:ml-64 flex flex-col overflow-hidden relative mb-16 md:mb-0">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-0 w-full h-96 bg-[#A479FF]/5 blur-[100px] pointer-events-none" />
          
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/5 z-10 bg-[#0C0F14]/80 backdrop-blur-sm">
            <div>
              <h1 className="text-xl font-semibold tracking-tight capitalize text-white">{currentView}</h1>
              <p className="text-xs text-gray-500 mt-0.5">Welcome back, Trader.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Account Equity</div>
                <div className="flex items-center gap-2 justify-end">
                  <div className="text-xl font-mono text-[#4FF3F9]">{formatCurrency(currentBalance)}</div>
                  <button onClick={() => setBalanceModalOpen(true)} className="p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"><Pencil size={12}/></button>
                </div>
              </div>
              <button 
                onClick={() => { setEditTrade(null); setModalOpen(true); }}
                className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <Plus size={18} /> <span className="hidden md:inline">New Trade</span>
              </button>
            </div>
          </header>

          {/* Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <TradeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave} 
        tradeToEdit={editTrade} 
        user={user}
      />

      <EditBalanceModal 
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        currentBalance={currentBalance}
        onUpdate={handleBalanceUpdate}
      />
      
      {/* NEW: Sign Out Modal */}
      <SignOutConfirmationModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={confirmSignOut}
      />
      
      {/* Global CSS for Recharts override */}
      <style>{`
        .recharts-tooltip-cursor { fill: rgba(255,255,255,0.05) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { bg: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
};

export default App;