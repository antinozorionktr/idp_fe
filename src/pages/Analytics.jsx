import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  FileText,
  Database,
  Search,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useCollections } from '../hooks/useApi';
import { useAppStore } from '../services/store';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const COLORS = ['#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

function MetricCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <motion.div variants={item} className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400">{title}</p>
          <p className="text-3xl font-bold text-dark-100 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-dark-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color || 'bg-dark-700'}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { collections } = useCollections();
  const { queryHistory } = useAppStore();
  
  // Calculate stats
  const totalChunks = collections?.reduce((sum, c) => sum + (c.vectors_count || 0), 0) || 0;
  const totalQueries = queryHistory?.length || 0;
  
  // Prepare chart data
  const collectionData = collections?.map(c => ({
    name: c.name.length > 10 ? c.name.slice(0, 10) + '...' : c.name,
    chunks: c.vectors_count || 0,
  })) || [];
  
  const queryByDay = queryHistory?.reduce((acc, q) => {
    const day = new Date(q.timestamp).toLocaleDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const queryChartData = Object.entries(queryByDay).slice(-7).map(([day, count]) => ({
    day: day.split('/').slice(0, 2).join('/'),
    queries: count,
  }));
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="font-display text-3xl font-bold text-dark-100">
          Analytics
        </h1>
        <p className="text-dark-400 mt-2">
          Insights and statistics about your document processing.
        </p>
      </motion.div>
      
      {/* Metrics grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Collections"
          value={collections?.length || 0}
          icon={Database}
          color="bg-accent-500"
        />
        <MetricCard
          title="Total Chunks"
          value={totalChunks.toLocaleString()}
          icon={FileText}
          color="bg-purple-500"
        />
        <MetricCard
          title="Queries Made"
          value={totalQueries}
          icon={Search}
          color="bg-emerald-500"
        />
        <MetricCard
          title="Avg Confidence"
          value={queryHistory?.length > 0 
            ? `${(queryHistory.reduce((s, q) => s + (q.confidence || 0), 0) / queryHistory.length * 100).toFixed(0)}%`
            : 'N/A'
          }
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>
      
      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Collection sizes */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="font-semibold text-dark-200 mb-6">Chunks by Collection</h3>
          
          {collectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={collectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e2e',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="chunks" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-500">
              No data yet
            </div>
          )}
        </motion.div>
        
        {/* Query activity */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="font-semibold text-dark-200 mb-6">Query Activity (Last 7 Days)</h3>
          
          {queryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={queryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e2e',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="queries" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-500">
              No queries yet
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Recent queries */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="font-semibold text-dark-200 mb-4">Recent Queries</h3>
        
        {queryHistory?.length > 0 ? (
          <div className="space-y-3">
            {queryHistory.slice(0, 5).map((q, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-dark-200 truncate">{q.query}</p>
                  <p className="text-xs text-dark-500">
                    {q.collection} • {new Date(q.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className={`
                  px-2 py-1 text-xs rounded-full ml-4
                  ${q.confidence > 0.7 ? 'bg-success-500/20 text-success-400' : 
                    q.confidence > 0.5 ? 'bg-warning-500/20 text-warning-400' : 
                    'bg-dark-700 text-dark-400'}
                `}>
                  {(q.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-dark-500 text-center py-8">No queries yet</p>
        )}
      </motion.div>
    </motion.div>
  );
}
