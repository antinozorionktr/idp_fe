import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  FileText,
  Search,
  Database,
  Activity,
  Cpu,
  HardDrive,
  Brain,
  Eye,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useSystemHealth, useCollections } from '../hooks/useApi';
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

function StatusCard({ title, status, icon: Icon, description }) {
  const statusConfig = {
    operational: { color: 'text-success-400', bg: 'bg-success-500/10', icon: CheckCircle2 },
    model_missing: { color: 'text-warning-400', bg: 'bg-warning-500/10', icon: AlertCircle },
    error: { color: 'text-error-400', bg: 'bg-error-500/10', icon: XCircle },
  };
  
  const config = statusConfig[status] || statusConfig.error;
  const StatusIcon = config.icon;
  
  return (
    <motion.div variants={item} className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${config.bg}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <StatusIcon className={`w-5 h-5 ${config.color}`} />
      </div>
      
      <h3 className="mt-4 font-medium text-dark-200">{title}</h3>
      <p className="text-sm text-dark-500 mt-1 capitalize">{status?.replace('_', ' ')}</p>
      {description && <p className="text-xs text-dark-600 mt-2">{description}</p>}
    </motion.div>
  );
}

function QuickActionCard({ title, description, icon: Icon, to, gradient }) {
  return (
    <Link to={to}>
      <motion.div
        variants={item}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card-hover p-6 group cursor-pointer"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <h3 className="font-semibold text-dark-100 group-hover:text-accent-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-dark-500 mt-1">{description}</p>
        
        <div className="mt-4 flex items-center gap-2 text-sm text-dark-500 group-hover:text-accent-400 transition-colors">
          <span>Get started</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
}

function ArchitectureDiagram() {
  const tiers = [
    { 
      name: 'OCR', 
      model: 'Chandra OCR',
      icon: FileText,
      description: 'Document extraction (83.1% accuracy)',
      color: 'from-violet-500 to-purple-500',
    },
    { 
      name: 'Embedding', 
      model: 'nomic-embed-text',
      icon: Layers,
      description: 'Vector memory',
      color: 'from-cyan-500 to-blue-500',
    },
    { 
      name: 'Reasoning', 
      model: 'deepseek-r1:32b',
      icon: Brain,
      description: 'QA synthesis',
      color: 'from-emerald-500 to-teal-500',
    },
  ];
  
  return (
    <motion.div variants={item} className="glass-card p-6">
      <h3 className="font-display font-semibold text-lg text-dark-100 mb-6">
        Three-Tier Architecture
      </h3>
      
      <div className="space-y-4">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center flex-shrink-0`}>
              <tier.icon className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-dark-200">Tier {index + 1}: {tier.name}</span>
                <span className="text-xs text-dark-500">•</span>
                <span className="text-xs font-mono text-accent-400">{tier.model}</span>
              </div>
              <p className="text-sm text-dark-500">{tier.description}</p>
            </div>
            
            {index < tiers.length - 1 && (
              <div className="w-8 flex justify-center">
                <div className="w-0.5 h-8 bg-dark-700" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { health, loading: healthLoading } = useSystemHealth();
  const { collections, loading: collectionsLoading } = useCollections();
  const { queryHistory } = useAppStore();
  
  const totalDocuments = collections?.reduce((sum, c) => sum + (c.vectors_count || 0), 0) || 0;
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-accent-400" />
            <h1 className="font-display text-3xl font-bold gradient-text">
              IDP System v2
            </h1>
          </div>
          <p className="text-dark-400 max-w-2xl">
            Intelligent Document Processing with local AI models. Process documents, 
            extract structured data, and query your knowledge base using natural language.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`
            px-4 py-2 rounded-full flex items-center gap-2
            ${health?.status === 'healthy' 
              ? 'bg-success-500/10 text-success-400 border border-success-500/20' 
              : 'bg-warning-500/10 text-warning-400 border border-warning-500/20'
            }
          `}>
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">
              {health?.status || 'Checking...'}
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-500/10 rounded-lg">
              <Database className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-100">{collections?.length || 0}</p>
              <p className="text-sm text-dark-500">Collections</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-100">{totalDocuments}</p>
              <p className="text-sm text-dark-500">Chunks Indexed</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Search className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-100">{queryHistory?.length || 0}</p>
              <p className="text-sm text-dark-500">Queries Made</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Cpu className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-100">Local</p>
              <p className="text-sm text-dark-500">AI Processing</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <motion.h2 variants={item} className="font-display font-semibold text-xl text-dark-100">
            Quick Actions
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <QuickActionCard
              title="Process Document"
              description="Upload and extract data from PDFs and images"
              icon={FileText}
              to="/process"
              gradient="from-accent-500 to-cyan-400"
            />
            <QuickActionCard
              title="Query Documents"
              description="Ask questions about your documents"
              icon={Search}
              to="/query"
              gradient="from-purple-500 to-pink-500"
            />
            <QuickActionCard
              title="Manage Collections"
              description="Organize and browse your document library"
              icon={Database}
              to="/collections"
              gradient="from-emerald-500 to-teal-400"
            />
            <QuickActionCard
              title="View Analytics"
              description="Insights and statistics about your data"
              icon={Activity}
              to="/analytics"
              gradient="from-orange-500 to-amber-400"
            />
          </div>
        </div>
        
        {/* Architecture & Status */}
        <div className="space-y-6">
          <ArchitectureDiagram />
          
          <motion.div variants={item} className="glass-card p-6">
            <h3 className="font-display font-semibold text-lg text-dark-100 mb-4">
              System Services
            </h3>
            
            <div className="space-y-3">
              {Object.entries(health?.services || {}).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm text-dark-400 capitalize">
                    {service.replace('_', ' ')}
                  </span>
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${status === 'operational' 
                      ? 'bg-success-500/10 text-success-400' 
                      : 'bg-warning-500/10 text-warning-400'
                    }
                  `}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
