/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Upload as UploadIcon, Lightbulb, PieChart, User } from 'lucide-react';
import { TabType, Dataset, Insight, DashboardWidget, ChartConfig } from './types';
import Home from './components/Home';
import Upload from './components/Upload';
import Insights from './components/Insights';
import Dashboards from './components/Dashboards';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [currentDatasetId, setCurrentDatasetId] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  const onAnalysisComplete = (newInsights: Insight[], suggestions: ChartConfig[]) => {
    setInsights(newInsights);
    
    // Automatically add first 2 suggestions as widgets if widgets are empty
    if (widgets.length === 0 && suggestions.length > 0) {
      const newWidgets: DashboardWidget[] = suggestions.slice(0, 4).map((sug, i) => ({
        id: `widget-${Date.now()}-${i}`,
        chartConfig: sug,
        w: 1,
        h: 1
      }));
      setWidgets(newWidgets);
    }
  };

  const currentDataset = datasets.find(d => d.id === currentDatasetId) || datasets[0] || null;

  const onDatasetUploaded = (dataset: Dataset) => {
    setDatasets([dataset, ...datasets]);
    setCurrentDatasetId(dataset.id);
    setActiveTab('insights');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home datasets={datasets} onSelectDataset={setCurrentDatasetId} />;
      case 'upload': return <Upload onUploaded={onDatasetUploaded} />;
      case 'insights': return <Insights dataset={currentDataset} onAnalysisComplete={onAnalysisComplete} />;
      case 'dashboards': return <Dashboards dataset={currentDataset} insights={insights} widgets={widgets} setWidgets={setWidgets} />;
      default: return <Home datasets={datasets} onSelectDataset={setCurrentDatasetId} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-flow-bg shadow-2xl">
      <main className="flex-1 overflow-y-auto pb-56 px-5 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="min-h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto nav-glass px-6 py-4 pb-8 flex justify-between items-center z-50 rounded-t-[40px]">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon={<LayoutDashboard size={22} />} 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'upload'} 
          onClick={() => setActiveTab('upload')} 
          icon={<UploadIcon size={22} />} 
          label="Upload" 
        />
        <NavButton 
          active={activeTab === 'insights'} 
          onClick={() => setActiveTab('insights')} 
          icon={<Lightbulb size={22} />} 
          label="Insights" 
        />
        <NavButton 
          active={activeTab === 'dashboards'} 
          onClick={() => setActiveTab('dashboards')} 
          icon={<PieChart size={22} />} 
          label="Studio" 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-flow-accent' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <motion.div
        animate={active ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
      >
        {icon}
      </motion.div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-glow" 
          className="absolute -bottom-2 w-8 h-8 bg-flow-accent/20 blur-xl rounded-full"
        />
      )}
    </button>
  );
}

