import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Server,
  Database,
  Brain,
  Eye,
  Layers,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useSystemHealth } from '../hooks/useApi';
import * as api from '../services/api';
import toast from 'react-hot-toast';

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

function StatusBadge({ status }) {
  if (status === true || status === 'operational') {
    return (
      <span className="badge-success">
        <CheckCircle2 className="w-3 h-3" />
        Operational
      </span>
    );
  }
  if (status === 'model_missing') {
    return (
      <span className="badge-warning">
        <AlertCircle className="w-3 h-3" />
        Model Missing
      </span>
    );
  }
  return (
    <span className="badge-error">
      <XCircle className="w-3 h-3" />
      Error
    </span>
  );
}

function ServiceCard({ title, description, icon: Icon, status, details }) {
  return (
    <motion.div variants={item} className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${status === true || status === 'operational' 
              ? 'bg-success-500/20' 
              : 'bg-error-500/20'
            }
          `}>
            <Icon className={`w-5 h-5 ${
              status === true || status === 'operational' 
                ? 'text-success-400' 
                : 'text-error-400'
            }`} />
          </div>
          <div>
            <h3 className="font-medium text-dark-200">{title}</h3>
            <p className="text-sm text-dark-500">{description}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      
      {details && (
        <div className="pt-4 border-t border-dark-700 space-y-2">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-dark-500 capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="text-dark-300 font-mono text-xs">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { health, loading, refetch } = useSystemHealth();
  const [ollamaDebug, setOllamaDebug] = useState(null);
  const [loadingDebug, setLoadingDebug] = useState(false);
  
  const fetchOllamaDebug = async () => {
    setLoadingDebug(true);
    try {
      const data = await api.getDebugOllama();
      setOllamaDebug(data);
    } catch (err) {
      toast.error('Failed to fetch Ollama debug info');
    } finally {
      setLoadingDebug(false);
    }
  };
  
  useEffect(() => {
    fetchOllamaDebug();
  }, []);
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark-100">
            Settings
          </h1>
          <p className="text-dark-400 mt-2">
            System configuration and status monitoring.
          </p>
        </div>
        
        <button 
          onClick={() => { refetch(); fetchOllamaDebug(); }} 
          className="btn-secondary"
          disabled={loading || loadingDebug}
        >
          {(loading || loadingDebug) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </motion.div>
      
      {/* System Status */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-dark-200 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-accent-400" />
          System Status
        </h2>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-lg font-medium text-dark-100 capitalize">
                {health?.status || 'Unknown'}
              </p>
              <p className="text-sm text-dark-500">
                Last checked: {health?.timestamp 
                  ? new Date(health.timestamp).toLocaleString() 
                  : 'Never'
                }
              </p>
            </div>
            
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${health?.status === 'healthy' ? 'bg-success-500/20' : 'bg-warning-500/20'}
            `}>
              {health?.status === 'healthy' ? (
                <CheckCircle2 className="w-8 h-8 text-success-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-warning-400" />
              )}
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(health?.services || {}).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                <span className="text-dark-300 capitalize">{service.replace(/_/g, ' ')}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Model Status */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-dark-200 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent-400" />
          AI Models
        </h2>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <ServiceCard
            title="Vision Model"
            description="Document understanding"
            icon={Eye}
            status={health?.models?.vision}
            details={{
              model: ollamaDebug?.configured_models?.vision || 'qwen2.5-vl:7b',
            }}
          />
          <ServiceCard
            title="Embedding Model"
            description="Vector memory"
            icon={Layers}
            status={health?.models?.embedding}
            details={{
              model: ollamaDebug?.configured_models?.embedding || 'nomic-embed-text',
            }}
          />
          <ServiceCard
            title="Reasoning Model"
            description="QA synthesis"
            icon={Brain}
            status={health?.models?.reasoning}
            details={{
              model: ollamaDebug?.configured_models?.reasoning || 'phi4:14b',
            }}
          />
        </div>
      </motion.div>
      
      {/* Ollama Debug */}
      {ollamaDebug && (
        <motion.div variants={item}>
          <h2 className="font-semibold text-dark-200 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-accent-400" />
            Ollama Connection
          </h2>
          
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Base URL</span>
              <span className="text-dark-200 font-mono text-sm">
                {ollamaDebug.ollama_url}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Connection Status</span>
              <StatusBadge status={ollamaDebug.ollama_reachable ? 'operational' : 'error'} />
            </div>
            
            {ollamaDebug.error && (
              <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-lg">
                <p className="text-sm text-error-400">{ollamaDebug.error}</p>
              </div>
            )}
            
            {ollamaDebug.available_models?.length > 0 && (
              <div>
                <p className="text-dark-400 mb-2">Available Models ({ollamaDebug.available_models.length})</p>
                <div className="space-y-2">
                  {ollamaDebug.available_models.map((model, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                      <span className="text-dark-200 font-mono text-sm">{model.name}</span>
                      <span className="text-dark-500 text-xs">
                        {model.size ? `${(model.size / 1e9).toFixed(1)} GB` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Links */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-dark-200 mb-4">Quick Links</h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="/api/v1/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card-hover p-4 flex items-center justify-between group"
          >
            <div>
              <p className="font-medium text-dark-200 group-hover:text-accent-400 transition-colors">
                API Documentation
              </p>
              <p className="text-sm text-dark-500">OpenAPI / Swagger UI</p>
            </div>
            <ExternalLink className="w-5 h-5 text-dark-500 group-hover:text-accent-400" />
          </a>
          
          <a
            href="http://localhost:6333/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card-hover p-4 flex items-center justify-between group"
          >
            <div>
              <p className="font-medium text-dark-200 group-hover:text-accent-400 transition-colors">
                Qdrant Dashboard
              </p>
              <p className="text-sm text-dark-500">Vector database UI</p>
            </div>
            <ExternalLink className="w-5 h-5 text-dark-500 group-hover:text-accent-400" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
