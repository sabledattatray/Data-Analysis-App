export type TabType = 'home' | 'upload' | 'insights' | 'dashboards';

export interface Dataset {
  id: string;
  name: string;
  data: any[];
  headers: string[];
  types: Record<string, string>;
  rowCount: number;
  timestamp: number;
}

export interface Insight {
  id: string;
  datasetId: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'kpi';
  severity?: 'high' | 'medium' | 'low';
}

export interface ChartConfig {
  id: string;
  datasetId: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  title: string;
  xAxis: string;
  yAxis: string;
  color?: string;
}

export interface DashboardWidget {
  id: string;
  chartConfig: ChartConfig;
  w: number;
  h: number;
}
