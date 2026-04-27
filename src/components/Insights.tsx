import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Sparkles, TrendingUp, AlertTriangle, ArrowRight, BrainCircuit, Search, BarChart3 } from 'lucide-react';
import { Dataset, Insight, ChartConfig } from '../types';
import { analyzeDataset, queryData } from '../services/geminiService';
import ChartRenderer from './ChartRenderer';

interface Props {
  dataset: Dataset | null;
  onAnalysisComplete: (insights: Insight[], suggestions: ChartConfig[]) => void;
}

export default function Insights({ dataset, onAnalysisComplete }: Props) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [suggestions, setSuggestions] = useState<ChartConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  useEffect(() => {
    if (dataset && (insights.length === 0 || dataset.id !== insights[0]?.datasetId)) {
      triggerAnalysis();
    }
  }, [dataset?.id]);

  const triggerAnalysis = async () => {
    if (!dataset) return;
    setLoading(true);
    setQueryResult(null);
    const { insights: newInsights, suggestions: newSuggestions } = await analyzeDataset(dataset);
    setInsights(newInsights);
    setSuggestions(newSuggestions);
    onAnalysisComplete(newInsights, newSuggestions);
    setLoading(false);
  };

  const handleQuery = async () => {
    if (!dataset || !query.trim()) return;
    setIsQuerying(true);
    const answer = await queryData(dataset, query);
    setQueryResult(answer);
    setIsQuerying(false);
  };

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-10">
        <div className="w-20 h-20 bg-flow-border rounded-full flex items-center justify-center">
          <Lightbulb className="text-gray-600" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-flow-ink">No context available</h2>
          <p className="text-sm text-gray-500">Upload a dataset first to unlock AI intelligence and automated patterns.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-40">
      <header className="space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-flow-ink">AI Intelligence</h1>
            <p className="text-gray-500 text-sm">Deep learning findings for <span className="text-flow-accent font-semibold">{dataset.name}</span></p>
          </div>
          <button 
            onClick={triggerAnalysis}
            disabled={loading}
            className="p-2 bg-flow-surface border border-flow-border rounded-xl text-gray-400 hover:text-flow-accent transition-colors disabled:opacity-50"
            title="Recidivate Analysis"
          >
            <Sparkles size={18} className={loading ? 'animate-pulse' : ''} />
          </button>
        </div>
      </header>

      {/* Natural Language Query */}
      <div className="bg-flow-surface border border-flow-border rounded-3xl p-4 space-y-4 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3 px-1">
          <BrainCircuit className="text-flow-accent" size={18} />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Natural Query</span>
        </div>
        <div className="relative">
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            placeholder="Search patterns e.g. 'Show outliers'..." 
            className="w-full bg-flow-bg border border-flow-border rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:border-flow-accent/40 text-sm transition-all"
          />
          <button 
            onClick={handleQuery}
            disabled={isQuerying}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-flow-accent text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isQuerying ? <Loader2 size={16} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>
        
        <AnimatePresence>
          {queryResult && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-flow-accent/5 border border-flow-accent/10 rounded-2xl p-4 text-xs text-gray-300 leading-relaxed italic overflow-hidden"
            >
              {queryResult}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Automated Insights */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Automated Finds</h2>
            {loading && <Loader2 className="animate-spin text-flow-accent" size={14} />}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-flow-surface/50 border border-flow-border rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="bg-flow-surface/50 border-2 border-dashed border-flow-border rounded-[32px] p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-flow-border rounded-full flex items-center justify-center mx-auto opacity-50">
                <Sparkles className="text-gray-600" size={24} />
              </div>
              <p className="text-sm text-gray-500 italic">No automated patterns detected yet. Try refreshing the analysis.</p>
              <button 
                onClick={triggerAnalysis}
                className="text-[10px] uppercase tracking-widest font-bold text-flow-accent border border-flow-accent/30 px-6 py-2 rounded-full hover:bg-flow-accent/10 transition-colors"
              >
                RUN DIAGNOSTICS
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-flow-surface border border-flow-border p-6 rounded-[32px] space-y-3 group hover:border-flow-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {getInsightIcon(insight.type)}
                    <div className="px-3 py-1 bg-gray-800 rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      {insight.type}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-flow-ink group-hover:text-flow-accent transition-colors">{insight.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{insight.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Suggested Visuals */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Visual Intelligence</h2>
            {loading && <Loader2 className="animate-spin text-flow-accent" size={14} />}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-60 bg-flow-surface/50 border border-flow-border rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-flow-surface/50 border-2 border-dashed border-flow-border rounded-[32px] p-10 text-center h-[300px] flex flex-col items-center justify-center opacity-50">
              <BarChart3 className="text-gray-600 mb-4" size={48} />
              <p className="text-xs text-gray-500 italic max-w-xs mx-auto">Visual patterns will appear here after analysis completes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((sug, idx) => (
                <motion.div 
                  key={sug.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.15 }}
                  className="bg-flow-surface border border-flow-border p-6 rounded-[32px] h-[260px] flex flex-col group hover:border-flow-accent/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-flow-ink group-hover:text-flow-accent transition-colors">{sug.title}</h3>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{sug.xAxis} vs {sug.yAxis}</p>
                    </div>
                    <div className="p-2 bg-gray-900 rounded-lg text-gray-400">
                      <BarChart3 size={14} />
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ChartRenderer config={sug} data={dataset.data} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function getInsightIcon(type: string) {
  switch (type) {
    case 'trend': return <TrendingUp className="text-blue-400" size={20} />;
    case 'anomaly': return <AlertTriangle className="text-yellow-400" size={20} />;
    case 'correlation': return <Sparkles className="text-purple-400" size={20} />;
    case 'kpi': return <CheckCircle2 className="text-green-400" size={20} />;
    default: return <Lightbulb className="text-flow-accent" size={20} />;
  }
}

function CheckCircle2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
      <path d="M8 12L11 15L16 9" />
    </svg>
  );
}

function Loader2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
