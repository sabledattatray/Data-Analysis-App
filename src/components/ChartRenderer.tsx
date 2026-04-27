import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  LabelList
} from 'recharts';
import { ChartConfig } from '../types';

interface Props {
  config: ChartConfig;
  data: any[];
  hideAxes?: boolean;
}

const COLORS = [
  '#C084FC', // Light Purple
  '#22D3EE', // Cyan
  '#FB923C', // Orange
  '#F472B6', // Pink
  '#A3E635', // Lime
  '#FCD34D', // Amber
  '#60A5FA', // Blue (kept but secondary)
];

export default function ChartRenderer({ config, data, hideAxes = true }: Props) {
  // Ensure we have data for the headers
  const chartData = React.useMemo(() => {
    const rawData = data.slice(0, 50); // Take more for aggregation
    
    const aggregated: Record<string, number> = {};
    
    rawData.forEach(item => {
      const name = String(item[config.xAxis] || 'N/A');
      const val = item[config.yAxis];
      let numericVal = 0;
      
      if (typeof val === 'number') {
        numericVal = val;
      } else if (typeof val === 'string') {
        const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(parsed)) {
          numericVal = parsed;
        } else {
          const lower = val.toLowerCase();
          if (['yes', 'true', 'ok', 'active'].includes(lower)) numericVal = 1;
          else if (['no', 'false', 'inactive'].includes(lower)) numericVal = 0;
          else numericVal = 1; // Count existence of category strings
        }
      } else if (typeof val === 'boolean') {
        numericVal = val ? 1 : 0;
      } else {
        numericVal = 1; // Default to counting item
      }

      aggregated[name] = (aggregated[name] || 0) + numericVal;
    });

    return Object.entries(aggregated)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [data, config]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-[10px] italic">
        Insufficient data for visualization
      </div>
    );
  }

  const commonProps = {
    data: chartData,
    margin: { 
      top: 20, 
      right: 15, 
      left: hideAxes ? 0 : 30, 
      bottom: hideAxes ? 5 : 20 
    },
  };

  const TooltipContent = (
    <Tooltip 
      contentStyle={{ 
        backgroundColor: '#121217', 
        border: '1px solid #22222A', 
        borderRadius: '12px',
        fontSize: '10px'
      }}
      itemStyle={{ color: '#F9FAFB' }}
    />
  );

  switch (config.type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps}>
            <XAxis dataKey="name" hide={hideAxes} />
            <YAxis hide={hideAxes} />
            {TooltipContent}
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={12}>
               {chartData.map((_, index) => (
                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
               ))}
               <LabelList dataKey="value" position="top" style={{ fontSize: '9px', fill: '#F9FAFB', fontWeight: 'bold' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            <XAxis dataKey="name" hide={hideAxes} />
            <YAxis hide={hideAxes} />
            {TooltipContent}
            <Line type="monotone" dataKey="value" stroke={COLORS[Math.abs(config.title.length) % COLORS.length]} strokeWidth={2} dot={{ r: 3, fill: COLORS[Math.abs(config.title.length) % COLORS.length] }}>
              <LabelList dataKey="value" position="top" style={{ fontSize: '9px', fill: '#F9FAFB', fontWeight: 'bold' }} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      );
    case 'area':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`grad-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[Math.abs(config.title.length + 1) % COLORS.length]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS[Math.abs(config.title.length + 1) % COLORS.length]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide={hideAxes} />
            <YAxis hide={hideAxes} />
            {TooltipContent}
            <Area type="monotone" dataKey="value" stroke={COLORS[Math.abs(config.title.length + 1) % COLORS.length]} fillOpacity={1} fill={`url(#grad-${config.id})`} strokeWidth={2}>
              <LabelList dataKey="value" position="top" style={{ fontSize: '9px', fill: '#F9FAFB', fontWeight: 'bold' }} />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={chartData.slice(0, 7)}
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              style={{ fontSize: '10px', fontWeight: 'bold', fill: '#FFFFFF' }}
            >
              {chartData.slice(0, 7).map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#121217', 
                border: 'none', 
                borderRadius: '12px',
                fontSize: '10px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#F9FAFB' }}
            />
          </RePieChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
}
