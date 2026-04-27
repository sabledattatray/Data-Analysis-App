import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  Plus, 
  Trash2, 
  Share2, 
  Download,
  LayoutGrid,
  Sparkles,
  PieChart as PieChartIcon,
  Grid
} from 'lucide-react';
import { Dataset, Insight, ChartConfig, DashboardWidget } from '../types';
import { analyzeDataset } from '../services/geminiService';
import ChartRenderer from './ChartRenderer';

interface Props {
  dataset: Dataset | null;
  insights: Insight[];
  widgets: DashboardWidget[];
  setWidgets: (widgets: DashboardWidget[]) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Dashboards({ dataset, insights, widgets, setWidgets }: Props) {
  const [loading, setLoading] = useState(false);

  const suggestCharts = async () => {
    if (!dataset) return;
    setLoading(true);
    const { suggestions } = await analyzeDataset(dataset);
    
    const newWidgets: DashboardWidget[] = suggestions.map((sug, i) => ({
      id: `widget-${Date.now()}-${i}`,
      chartConfig: sug,
      w: 1,
      h: 1
    }));
    
    setWidgets([...newWidgets, ...widgets]);
    setLoading(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-10">
        <div className="w-20 h-20 bg-flow-border rounded-full flex items-center justify-center">
          <PieChartIcon className="text-gray-600" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-flow-ink">Studio is empty</h2>
          <p className="text-sm text-gray-500">Add widgets manually or use AI to generate a tailored dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-40">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-flow-ink">Studio</h1>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <LayoutGrid size={12} />
            <span>Interactive Workspace</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-flow-surface border border-flow-border rounded-full flex items-center justify-center text-gray-400 hover:text-flow-ink transition-colors">
            <Share2 size={18} />
          </button>
          <button className="w-10 h-10 bg-flow-surface border border-flow-border rounded-full flex items-center justify-center text-gray-400 hover:text-flow-ink transition-colors">
            <Download size={18} />
          </button>
        </div>
      </header>

      {/* Action Bar */}
      <div className="flex gap-3">
        <button 
          onClick={suggestCharts}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-flow-accent via-indigo-600 to-flow-success text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl shadow-flow-accent/30 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Sparkles size={18} />
              AI GENERATE
            </>
          )}
        </button>
        <button className="bg-flow-surface border border-flow-border px-5 rounded-2xl flex items-center justify-center text-gray-400">
          <Plus size={20} />
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="space-y-6">
        <AnimatePresence>
          {widgets.map((widget, idx) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-flow-surface border border-flow-border p-6 rounded-[32px] space-y-6 relative group overflow-hidden shadow-[0_0_20px_-10px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-flow-ink text-sm uppercase tracking-wide italic">{widget.chartConfig.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                    <span className="text-flow-accent">{widget.chartConfig.xAxis}</span>
                    <span>vs</span>
                    <span className="text-flow-success">{widget.chartConfig.yAxis}</span>
                  </div>
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-gray-600 hover:text-gray-400"><Settings2 size={16} /></button>
                  <button onClick={() => removeWidget(widget.id)} className="text-red-900/50 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="h-[250px] w-full">
                <ChartRenderer config={widget.chartConfig} data={dataset.data} hideAxes={false} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {widgets.length === 0 && !loading && (
          <div className="py-20 text-center opacity-20 italic space-y-4">
            <LayoutGrid className="mx-auto" size={48} />
            <p className="text-sm">No visuals in this view. Click 'AI Generate' to begin.</p>
          </div>
        )}
      </div>
    </div>
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
