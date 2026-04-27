import { motion } from 'motion/react';
import { Database, TrendingUp, Clock, ChevronRight, FileText, Sparkles } from 'lucide-react';
import { Dataset } from '../types';

interface Props {
  datasets: Dataset[];
  onSelectDataset: (id: string) => void;
}

export default function Home({ datasets, onSelectDataset }: Props) {
  return (
    <div className="space-y-8 pb-40">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-flow-ink">InsightFlow</h1>
        <p className="text-gray-500 text-sm">Your data, intelligently analyzed.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-flow-surface p-5 rounded-3xl border border-flow-border space-y-2">
          <Database className="text-flow-accent" size={20} />
          <div>
            <p className="text-2xl font-bold">{datasets.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Datasets</p>
          </div>
        </div>
        <div className="bg-flow-surface p-5 rounded-3xl border border-flow-border space-y-2">
          <TrendingUp className="text-flow-success" size={20} />
          <div>
            <p className="text-2xl font-bold">{datasets.reduce((acc, d) => acc + d.rowCount, 0)}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Rows Analyzed</p>
          </div>
        </div>
      </div>

      {/* Recent Datasets */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Library</h2>
          <button className="text-[10px] font-bold text-flow-accent">VIEW ALL</button>
        </div>

        {datasets.length === 0 ? (
          <div className="bg-flow-surface/50 border-2 border-dashed border-flow-border rounded-3xl p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-flow-border rounded-full flex items-center justify-center mx-auto">
              <FileText className="text-gray-600" size={24} />
            </div>
            <p className="text-sm text-gray-500">No data found. Start by uploading a CSV or Excel file.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {datasets.slice(0, 5).map((dataset) => (
              <motion.button
                key={dataset.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDataset(dataset.id)}
                className="w-full bg-flow-surface border border-flow-border p-4 rounded-2xl flex items-center gap-4 hover:border-flow-accent/40 transition-colors group text-left"
              >
                <div className="w-10 h-10 bg-flow-accent/10 rounded-xl flex items-center justify-center text-flow-accent group-hover:bg-flow-accent group-hover:text-white transition-colors">
                  <Database size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{dataset.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                    <span>{dataset.rowCount} rows</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span>{new Date(dataset.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-700" />
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Inspiration Card */}
      <div className="bg-gradient-to-br from-indigo-500/20 via-flow-accent/20 to-flow-success/10 border border-flow-accent/20 rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-flow-accent/20 rounded-full blur-3xl group-hover:bg-flow-accent/30 transition-all" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-3">
          <h3 className="font-bold text-flow-ink flex items-center gap-2">
            <Sparkles className="text-flow-accent" size={16} />
            Ask your Data
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-[80%]">
            "What was the highest growth category last quarter?"
          </p>
          <button className="bg-gradient-to-r from-flow-accent to-indigo-600 text-white px-5 py-2.5 rounded-full text-[10px] font-bold shadow-lg shadow-flow-accent/30 hover:scale-105 active:scale-95 transition-all">
            TRY AI QUERY
          </button>
        </div>
      </div>
    </div>
  );
}
