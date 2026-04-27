import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Upload as UploadIcon, FileText, CheckCircle2, History, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { Dataset } from '../types';

interface Props {
  onUploaded: (dataset: Dataset) => void;
}

export default function Upload({ onUploaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = Object.keys(results.data[0] as any);
            const dataset: Dataset = {
              id: `ds-${Date.now()}`,
              name: file.name,
              data: results.data,
              headers,
              types: detectTypes(results.data, headers),
              rowCount: results.data.length,
              timestamp: Date.now(),
            };
            
            setTimeout(() => {
              onUploaded(dataset);
              setIsProcessing(false);
            }, 1000); // Artificial delay for premium feel
          } else {
            setError("The file seems to be empty or corrupted.");
            setIsProcessing(false);
          }
        },
        error: (err) => {
          setError(`Parsing error: ${err.message}`);
          setIsProcessing(false);
        }
      });
    };
    reader.readAsText(file);
  };

  const detectTypes = (data: any[], headers: string[]) => {
    const types: Record<string, string> = {};
    headers.forEach(h => {
      const val = data[0][h];
      if (!isNaN(parseFloat(val)) && isFinite(val)) {
        types[h] = 'number';
      } else if (!isNaN(Date.parse(val))) {
        types[h] = 'date';
      } else {
        types[h] = 'string';
      }
    });
    return types;
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      processFile(file);
    } else {
      setError("Please upload a CSV file.");
    }
  }, []);

  return (
    <div className="space-y-8 h-full flex flex-col pb-40">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-flow-ink">Import Data</h1>
        <p className="text-gray-500 text-sm">Connect your sources and start analyzing.</p>
      </header>

      {/* Main Upload Zone */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex-1 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center space-y-6 transition-all relative ${
          isDragging ? 'border-flow-accent bg-flow-accent/5' : 'border-flow-border bg-flow-surface/30'
        } ${isProcessing ? 'pointer-events-none' : ''}`}
      >
        {isProcessing ? (
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="text-flow-accent animate-spin mx-auto" size={48} />
              <div className="absolute inset-0 blur-xl bg-flow-accent/30 rounded-full animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-flow-ink">Processing Engine</p>
              <p className="text-xs text-gray-500">Detecting data structures & types...</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isDragging ? 'scale-110 bg-flow-accent text-white' : 'bg-flow-surface border border-flow-border text-gray-600'}`}>
              <UploadIcon size={32} />
            </div>
            <div className="text-center space-y-2 px-10">
              <p className="font-bold text-flow-ink text-lg text-pretty">
                {isDragging ? 'Drop it here!' : 'Tap or drag a CSV file to analyze'}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Supports Excel, CSV, and JSON (automatic structure detection)
              </p>
            </div>
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />
          </>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-10 flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full border border-red-500/20 text-[10px] font-bold"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </div>

      {/* Other Sources */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Other Connectors</h2>
        <div className="grid grid-cols-2 gap-3 pb-6">
          <SourceCard icon={<Database size={18} />} name="PostgreSQL" />
          <SourceCard icon={<History size={18} />} name="Google Drive" />
        </div>
      </section>
    </div>
  );
}

function SourceCard({ icon, name }: { icon: React.ReactNode, name: string }) {
  return (
    <button className="bg-flow-surface border border-flow-border p-4 rounded-2xl flex items-center gap-3 opacity-40 grayscale cursor-not-allowed">
      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-400">{name}</span>
    </button>
  );
}

function Database({ size, className }: { size: number, className?: string }) {
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
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
