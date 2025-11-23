import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  AlertTriangle, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Target, 
  BrainCircuit, 
  X,
  Save,
  Camera,
  MoreHorizontal,
  PieChart as PieChartIcon,
  Pencil,
  Trash2,
  Wallet,
  User,
  LogOut
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { supabase, useAuth, Auth } from './supabaseClient'; // Adjust path as needed

// --- Mock Data & Constants ---
const MISTAKE_TYPES = ['FOMO', 'Revenge', 'Over-leveraging', 'Poor Execution', 'Early Exit', 'No Stop Loss'];
const STRATEGIES = ['Break & Retest', 'Liquidity Sweep', 'Supply/Demand', 'Trend Continuation', 'Gap Fill'];
const SESSIONS = ['Asian', 'London', 'NYC', 'Close'];

// --- Utility Components ---
const GlassCard = ({ children, className = "", hoverEffect = false }) => (
  <div className={`relative group rounded-xl bg-gray-900/40 backdrop-blur-xl border border-white/5 overflow-hidden ${className} ${hoverEffect ? 'hover:border-cyan-500/30 transition-colors duration-300' : ''}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
    {children}
  </div>
);

const NeonBadge = ({ children, type = 'neutral' }) => {
  const styles = {
    win: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    loss: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    neutral: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[type] || styles.neutral}`}>
      {children}
    </span>
  );
};

// --- Sub-Sections ---
const Dashboard = ({ trades }) => {
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const wins = trades.filter(t => t.outcome === 'WIN').length;
  const total = trades.length;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((acc, t) => acc + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0)) / losingTrades.length : 0;
  const riskReward = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : (avgWin > 0 ? '∞' : '0.00');
  const winProb = total > 0 ? wins / total : 0;
  const lossProb = total > 0 ? (total - wins) / total : 0;
  const expectancy = (avgWin * winProb) - (avgLoss * lossProb);

  let runningBalance = 0;
  const equityCurve = trades.map(t => {
    runningBalance += t.pnl;
    return { name: t.date, value: runningBalance };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-light tracking-wide">Net PnL</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-3xl font-thin tracking-tight ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${totalPnL.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-gray-500 font-light">All time performance</div>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-light tracking-wide">Win Rate</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-thin tracking-tight text-gray-100">{winRate}%</div>
          <div className="mt-2 text-xs text-gray-500 font-light">{wins} Wins / {total > 0 ? total - wins : 0} Losses</div>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-light tracking-wide">Risk Reward</span>
            <BrainCircuit className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-3xl font-thin tracking-tight text-gray-100">{riskReward}R</div>
          <div className="mt-2 text-xs text-gray-500 font-light">Avg Win: ${avgWin.toFixed(0)} | Avg Loss: ${avgLoss.toFixed(0)}</div>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-light tracking-wide">Expectancy</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-thin tracking-tight text-gray-100">${expectancy.toFixed(2)}</div>
          <div className="mt-2 text-xs text-gray-500 font-light">Per trade value</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 min-h-[400px]">
          <h3 className="text-lg font-light text-gray-200 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full"></span>Equity Curve
          </h3>
          <div className="h-[300px] w-full">
            {equityCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} itemStyle={{ color: '#22d3ee' }} />
                  <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorPnL)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-sm font-light">No trade data available yet.</div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-light text-gray-200 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-rose-400 to-orange-500 rounded-full"></span>Recent Activity
          </h3>
          <div className="space-y-4">
            {trades.length > 0 ? trades.slice(0, 5).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-b border-white/5 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${trade.outcome === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.pair}</span>
                    <span className="text-xs text-gray-500 uppercase">{trade.type}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{trade.date}</div>
                </div>
                <div className={`text-sm font-light tracking-wide ${trade.pnl > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trade.pnl > 0 ? '+' : ''}${trade.pnl}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-600 text-xs">Start logging trades to see activity.</div>
            )}
          </div>
          <button className="w-full mt-6 py-2 text-xs text-gray-400 hover:text-white transition-colors border border-white/10 rounded hover:bg-white/5">View Full History</button>
        </GlassCard>
      </div>
    </div>
  );
};

const MistakeTracker = ({ trades }) => {
  const mistakes = useMemo(() => {
    const counts = {};
    const costs = {};
    trades.forEach(t => {
      if (t.mistake) {
        counts[t.mistake] = (counts[t.mistake] || 0) + 1;
        costs[t.mistake] = (costs[t.mistake] || 0) + Math.abs(t.pnl);
      }
    });
    return Object.keys(counts).map(m => ({
      name: m,
      count: counts[m],
      cost: costs[m]
    })).sort((a, b) => b.cost - a.cost);
  }, [trades]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-thin text-white mb-4 tracking-wide">Psychology & Error Analysis</h2>
          {mistakes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {mistakes.map((m, idx) => (
                <GlassCard key={m.name} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400 font-bold">{idx + 1}</div>
                    <div>
                      <h3 className="text-lg font-light text-gray-200">{m.name}</h3>
                      <p className="text-xs text-gray-500">{m.count} occurrences</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-light text-rose-400">${m.cost.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Lost Revenue</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 flex flex-col items-center justify-center text-gray-500">
              <BrainCircuit className="w-12 h-12 mb-2 opacity-20" />
              <p>No mistakes logged yet. Great discipline!</p>
            </GlassCard>
          )}
        </div>
        <div className="space-y-6">
          <GlassCard className="p-6 bg-gradient-to-b from-rose-900/20 to-gray-900/40">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-light text-white">Cost of Errors</h3>
              <p className="text-3xl font-thin text-rose-400">${mistakes.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400 max-w-[200px]">Total realized losses attributed to psychological or technical errors.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const Analytics = ({ trades }) => {
  const data = useMemo(() => {
    const pairStats = {};
    trades.forEach(t => {
      if (!pairStats[t.pair]) {
        pairStats[t.pair] = { name: t.pair, pnl: 0, wins: 0, total: 0 };
      }
      pairStats[t.pair].pnl += t.pnl;
      pairStats[t.pair].total += 1;
      if (t.pnl > 0) pairStats[t.pair].wins += 1;
    });
    return Object.values(pairStats).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6">
        <GlassCard className="p-6 min-h-[450px]">
          <h3 className="text-lg font-light text-gray-200 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></span>Performance by Pair
          </h3>
          <div className="h-[350px] w-full">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-sm font-light">No analytics data available.</div>
            )}
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-light text-gray-200 mb-4">Most Profitable Pair</h3>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-thin text-emerald-400">{data.length > 0 ? data[0]?.name : 'N/A'}</div>
              <div className="text-xl font-light text-gray-400">+${data.length > 0 ? data[0]?.pnl.toFixed(2) : 0}</div>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-lg font-light text-gray-200 mb-4">Least Profitable Pair</h3>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-thin text-rose-400">{data.length > 0 ? data[data.length-1]?.name : 'N/A'}</div>
              <div className="text-xl font-light text-gray-400">
                {data.length > 0 ? (data[data.length-1]?.pnl > 0 ? '+' : '') + data[data.length-1]?.pnl.toFixed(2) : 0}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const JournalEntry = ({ isOpen, onClose, onSave, tradeToEdit }) => {
  const [formData, setFormData] = useState({
    pair: 'EUR/AUD', 
    type: 'Long',
    setup: '',
    entry: '',
    exit: '',
    pnl: '',
    mistake: '',
    notes: '',
    tags: [],
    date: new Date().toISOString().split('T')[0],
    screenshot_url: null
  });
  const [activeTagInput, setActiveTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (tradeToEdit) {
        setFormData({
          ...tradeToEdit,
          pnl: tradeToEdit.pnl.toString(),
          entry: tradeToEdit.entry.toString(),
          exit: tradeToEdit.exit.toString(),
          mistake: tradeToEdit.mistake || '',
          screenshot_url: tradeToEdit.screenshot_url || null
        });
        setScreenshotFile(null);
      } else {
        setFormData({
          pair: 'EUR/AUD', 
          type: 'Long',
          setup: '',
          entry: '',
          exit: '',
          pnl: '',
          mistake: '',
          notes: '',
          tags: [],
          date: new Date().toISOString().split('T')[0],
          screenshot_url: null
        });
        setScreenshotFile(null);
      }
    }
  }, [isOpen, tradeToEdit]);

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    setScreenshotFile(file);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('screenshots')  // ✅ CHANGED TO 'screenshots'
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')  // ✅ CHANGED TO 'screenshots'
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, screenshot_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      alert('Failed to upload screenshot');
      setScreenshotFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && activeTagInput) {
        e.preventDefault();
        setFormData(prev => ({ ...prev, tags: [...prev.tags, activeTagInput] }));
        setActiveTagInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pnlVal = parseFloat(formData.pnl);
    const entryVal = parseFloat(formData.entry);
    const exitVal = parseFloat(formData.exit);

    const tradeData = {
        ...formData,
        pnl: isNaN(pnlVal) ? 0 : pnlVal,
        entry: isNaN(entryVal) ? 0 : entryVal,
        exit: isNaN(exitVal) ? 0 : exitVal,
        outcome: (isNaN(pnlVal) ? 0 : pnlVal) >= 0 ? 'WIN' : 'LOSS',
        id: tradeToEdit ? tradeToEdit.id : Date.now()
    };

    onSave(tradeData);
    setScreenshotFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl shadow-purple-500/10 max-h-[95vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-light text-white tracking-wide flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" /> {tradeToEdit ? 'Edit Trade' : 'Log New Trade'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Pair</label>
              <input type="text" value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Direction</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none">
                <option>Long</option>
                <option>Short</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Session</label>
              <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none">
                {SESSIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
            <div className="space-y-1">
              <label className="text-xs text-cyan-400 uppercase">Entry Price</label>
              <input type="number" step="0.0001" value={formData.entry} onChange={e => setFormData({...formData, entry: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-1 text-lg font-light text-white focus:border-cyan-500 outline-none" placeholder="0.0000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-purple-400 uppercase">Exit Price</label>
              <input type="number" step="0.0001" value={formData.exit} onChange={e => setFormData({...formData, exit: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-1 text-lg font-light text-white focus:border-purple-500 outline-none" placeholder="0.0000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-emerald-400 uppercase">Realized PnL ($)</label>
              <input type="number" value={formData.pnl} onChange={e => setFormData({...formData, pnl: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-1 text-lg font-light text-white focus:border-emerald-500 outline-none" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Strategy / Setup</label>
              <select value={formData.setup} onChange={e => setFormData({...formData, setup: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none">
                <option value="">Select Setup...</option>
                {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Mistake Made?</label>
              <select value={formData.mistake} onChange={e => setFormData({...formData, mistake: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-rose-500 outline-none">
                <option value="">No Mistake</option>
                {MISTAKE_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase">Tags (Press Enter)</label>
            <div className="flex flex-wrap gap-2 p-2 bg-black/30 border border-white/10 rounded min-h-[40px]">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded flex items-center gap-1">
                  {tag} <button type="button" onClick={() => setFormData(prev => ({...prev, tags: prev.tags.filter((_, i) => i !== idx)}))}><X className="w-3 h-3"/></button>  {/* ✅ FIXED: Added closing parenthesis */}
                </span>
              ))}
              <input type="text" value={activeTagInput} onChange={e => setActiveTagInput(e.target.value)} onKeyDown={handleTagAdd} className="bg-transparent outline-none text-sm text-white flex-1 min-w-[100px]" placeholder="Add tag..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase">Screenshot</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm disabled:opacity-50"
              >
                <Camera className="w-4 h-4" /> 
                {uploading ? 'Uploading...' : (formData.screenshot_url ? 'Change Screenshot' : 'Attach Screenshot')}
              </button>
              {formData.screenshot_url && (
                <img src={formData.screenshot_url} alt="Preview" className="w-16 h-16 rounded object-cover border border-white/10" />
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {screenshotFile && (
                <span className="text-xs text-emerald-400">{screenshotFile.name}</span>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-shadow flex items-center gap-2">
                <Save className="w-4 h-4" /> {tradeToEdit ? 'Update' : 'Save'} Trade
              </button>
            </div>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, trade }) => {
  if (!isOpen) return null;
  
  const handleDelete = async () => {
    if (trade?.screenshot_url) {
      try {
        const fileName = trade.screenshot_url.split('/').pop();
        await supabase.storage.from('screenshots').remove([fileName]);  // ✅ CHANGED TO 'screenshots'
      } catch (error) {
        console.error('Error deleting screenshot:', error);
      }
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-md p-6 shadow-2xl shadow-rose-500/10 border-rose-500/20">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400"><Trash2 className="w-8 h-8" /></div>
          <h3 className="text-xl font-light text-white">Delete Trade Log?</h3>
          <p className="text-sm text-gray-400">This action cannot be undone. The trade data will be permanently removed from your journal.</p>
          <div className="flex gap-3 w-full mt-4">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded text-sm text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="flex-1 px-4 py-2 rounded bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-shadow">Delete</button>
          </div>
        </div>
      </GlassCard>
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
      <GlassCard className="w-full max-w-sm p-6 shadow-2xl shadow-blue-500/10 border-blue-500/20">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-light text-white">Update Account Balance</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Current Equity ($)</label>
              <input type="number" step="0.01" value={newBalance} onChange={e => setNewBalance(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-lg font-light text-white focus:border-blue-500 outline-none" autoFocus />
            </div>
            <button type="submit" className="w-full py-2 rounded bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-shadow">Update Balance</button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};

const JournalList = ({ trades, onEdit, onDelete }) => {
  const [filter, setFilter] = useState('');
  const filteredTrades = trades.filter(t => 
    t.pair.toLowerCase().includes(filter.toLowerCase()) || 
    t.setup.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search pair, setup..." 
            className="bg-black/30 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-gray-200 focus:border-cyan-500 outline-none w-64 transition-all focus:w-80" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
          />
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4" /> Advanced Filters
        </button>
      </div>

      <div className="overflow-x-auto">
        {filteredTrades.length > 0 ? (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-white/5 uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Pair/Type</th>
                <th className="p-4 font-medium">Setup</th>
                <th className="p-4 font-medium">Outcome</th>
                <th className="p-4 font-medium">PnL</th>
                <th className="p-4 font-medium">Tags</th>
                <th className="p-4 font-medium">Screenshot</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono text-xs text-gray-400">{trade.date}</td>
                  <td className="p-4">
                    <div className="font-medium text-white">{trade.pair}</div>
                    <span className={`text-xs ${trade.type === 'Long' ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.type}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{trade.setup}</span>
                    {trade.mistake && <div className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {trade.mistake}</div>}
                    {/* DISPLAY SCREENSHOT THUMBNAIL */}
                    {trade.screenshot_url && (
                      <img src={trade.screenshot_url} alt="Trade screenshot" className="w-16 h-16 rounded mt-2 border border-white/10 object-cover" />
                    )}
                  </td>
                  <td className="p-4"><NeonBadge type={trade.outcome === 'WIN' ? 'win' : 'loss'}>{trade.outcome}</NeonBadge></td>
                  <td className="p-4 font-mono"><span className={trade.pnl > 0 ? 'text-emerald-400' : 'text-rose-400'}>{trade.pnl > 0 ? '+' : ''}{trade.pnl}</span></td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {trade.tags?.map(tag => <span key={tag} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">{tag}</span>)}
                    </div>
                  </td>
                  <td className="p-4">
                    {trade.screenshot_url && (
                      <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-xs">View</a>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(trade)} className="p-2 rounded-md text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors" title="Edit Trade"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(trade)} className="p-2 rounded-md text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-colors" title="Delete Trade"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-600"><p className="text-sm">No trades found. Start journaling your journey!</p></div>
        )}
      </div>
    </div>
  );
};

// --- Main App Component (CLOUD-ENABLED) ---
const App = () => {
  const { user, signOut } = useAuth()
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('muye_current_view') || 'dashboard')
  const [trades, setTrades] = useState([])
  const [startingBalance, setStartingBalance] = useState(9443)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tradeToEdit, setTradeToEdit] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [tradeToDelete, setTradeToDelete] = useState(null)

  // Load trades from Supabase
  useEffect(() => {
    if (!user) return
    loadTrades()
  }, [user])

  const loadTrades = async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    
    if (error) console.error('Error loading trades:', error)
    else setTrades(data || [])
  }

  // Load balance from Supabase
  useEffect(() => {
    if (!user) return
    loadBalance()
  }, [user])

  const loadBalance = async () => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('starting_balance')
      .eq('user_id', user.id)
      .single()
    
    if (error) console.error('Error loading balance:', error)
    else if (data) setStartingBalance(data.starting_balance)
  }

  // Save balance to Supabase
  const handleBalanceUpdate = async (newCurrentBalance) => {
    const newStartingBalance = newCurrentBalance - totalPnL
    setStartingBalance(newStartingBalance)
    
    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, starting_balance: newStartingBalance })
  }

  // Save trade to Supabase
  const handleSaveTrade = async (tradeData) => {
    const trade = {
      ...tradeData,
      user_id: user.id,
      created_at: new Date().toISOString()
    }

    if (tradeToEdit) {
      const { error } = await supabase
        .from('trades')
        .update(trade)
        .eq('id', tradeData.id)
      
      if (error) console.error('Error updating trade:', error)
    } else {
      const { error } = await supabase
        .from('trades')
        .insert([trade])
      
      if (error) console.error('Error inserting trade:', error)
    }

    loadTrades()
    setIsModalOpen(false)
    setTradeToEdit(null)
  }

  const handleDeleteClick = (trade) => {
    setTradeToDelete(trade)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    const { error: dbError } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeToDelete?.id)
    
    if (dbError) console.error('Error deleting trade:', dbError)
    else {
      // Also delete screenshot from storage
      if (tradeToDelete?.screenshot_url) {
        try {
          const fileName = tradeToDelete.screenshot_url.split('/').pop();
          await supabase.storage.from('screenshots').remove([fileName]);  // ✅ CHANGED TO 'screenshots'
        } catch (error) {
          console.error('Error deleting screenshot:', error);
        }
      }
      loadTrades()
    }
    
    setIsDeleteModalOpen(false)
    setTradeToDelete(null)
  }

  const handleEditTrade = (trade) => {
    setTradeToEdit(trade)
    setIsModalOpen(true)
  }

  const openNewTradeModal = () => {
    setTradeToEdit(null)
    setIsModalOpen(true)
  }

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard trades={trades} />
      case 'journal': return <JournalList trades={trades} onEdit={handleEditTrade} onDelete={handleDeleteClick} />
      case 'mistakes': return <MistakeTracker trades={trades} />
      case 'analytics': return <Analytics trades={trades} />
      default: return <Dashboard trades={trades} />
    }
  }

  const totalPnL = useMemo(() => trades.reduce((acc, t) => acc + t.pnl, 0), [trades])
  const currentBalance = startingBalance + totalPnL

  // Show auth screen if not logged in
  if (!user) return <Auth />

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans">
      <div className="flex h-screen overflow-hidden">
        <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col bg-black/40 backdrop-blur-xl z-20">
          <div className="p-4 flex items-center justify-center lg:justify-start gap-2 h-20 border-b border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-black text-sm">M</div>
            <span className="hidden lg:block text-lg font-light text-white tracking-wide">MyJournal</span>
          </div>
          <nav className="p-4 flex-1">
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors ${currentView === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400'}`}>
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden lg:block text-sm">Dashboard</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('journal')} className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors ${currentView === 'journal' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400'}`}>
                  <BookOpen className="w-5 h-5" />
                  <span className="hidden lg:block text-sm">Journal</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('mistakes')} className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors ${currentView === 'mistakes' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400'}`}>
                  <AlertTriangle className="w-5 h-5" />
                  <span className="hidden lg:block text-sm">Mistakes</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('analytics')} className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors ${currentView === 'analytics' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400'}`}>
                  <BarChart3 className="w-5 h-5" />
                  <span className="hidden lg:block text-sm">Analytics</span>
                </button>
              </li>
            </ul>
          </nav>
          <div className="p-4 border-t border-white/5 mt-auto">
            <button onClick={signOut} className="w-full flex items-center gap-2 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="hidden lg:block text-sm">Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.05),transparent_50%)] pointer-events-none" />
          <header className="sticky top-0 z-10 backdrop-blur-md bg-black/20 border-b border-white/5 h-20 flex items-center justify-between px-8">
            <h1 className="text-2xl font-thin text-white tracking-tight capitalize">{currentView} View</h1>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right mr-2">
                <div className="text-xs text-gray-400">Current Balance</div>
                <div className="flex items-center justify-end gap-2">
                  <div className="text-lg font-light text-cyan-400">${currentBalance.toFixed(2)}</div>
                  <button onClick={() => setIsBalanceModalOpen(true)} className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10"><Pencil className="w-3 h-3" /></button>
                </div>
              </div>
              <button onClick={openNewTradeModal} className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                <Plus className="w-5 h-5" />
                <span className="hidden md:block">Log Trade</span>
              </button>
            </div>
          </header>
          <div className="p-8 relative z-0">{renderContent()}</div>
        </main>
      </div>

      <JournalEntry isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTrade} tradeToEdit={tradeToEdit} />
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} trade={tradeToDelete} />
      <EditBalanceModal isOpen={isBalanceModalOpen} onClose={() => setIsBalanceModalOpen(false)} currentBalance={currentBalance} onUpdate={handleBalanceUpdate} />

      <style dangerouslySetInnerHTML={{__html: `.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke: #334155; opacity: 0.2; }`}} />
    </div>
  )
}

export default App;