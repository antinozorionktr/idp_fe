import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Sparkles,
  MessageSquare,
  History,
  X,
  Trash2,
} from 'lucide-react';
import { useDocumentQuery, useCollections } from '../hooks/useApi';
import { useAppStore } from '../services/store';
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

function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-dark-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-accent-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-dark-200">
              {source.filename || 'Unknown document'}
            </p>
            <p className="text-xs text-dark-500">
              Page {source.page_number || '?'} • Score: {(source.score * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-0.5 text-xs rounded-full
            ${source.score > 0.7 ? 'bg-success-500/20 text-success-400' : 
              source.score > 0.5 ? 'bg-warning-500/20 text-warning-400' : 
              'bg-dark-700 text-dark-400'}
          `}>
            {source.score > 0.7 ? 'High' : source.score > 0.5 ? 'Good' : 'Partial'}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-dark-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-dark-500" />
          )}
        </div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="p-3 bg-dark-900 rounded-lg text-sm text-dark-300 leading-relaxed">
                {source.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QueryHistoryPanel({ onSelectQuery, onClose }) {
  const { queryHistory, clearQueryHistory } = useAppStore();
  
  if (queryHistory.length === 0) {
    return (
      <div className="p-6 text-center text-dark-500">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No query history yet</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-dark-200">Recent Queries</h3>
        <button
          onClick={clearQueryHistory}
          className="text-xs text-dark-500 hover:text-error-400 flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {queryHistory.slice(0, 10).map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectQuery(item.query)}
            className="w-full p-3 text-left bg-dark-800/50 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <p className="text-sm text-dark-200 truncate">{item.query}</p>
            <p className="text-xs text-dark-500 mt-1">
              {new Date(item.timestamp).toLocaleDateString()} • {item.collection}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function AnswerDisplay({ result }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Answer card */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium text-dark-400">Answer</span>
              <span className={`
                px-2 py-0.5 text-xs rounded-full
                ${result.confidence > 0.7 ? 'bg-success-500/20 text-success-400' : 
                  result.confidence > 0.5 ? 'bg-warning-500/20 text-warning-400' : 
                  'bg-dark-700 text-dark-400'}
              `}>
                {(result.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-dark-100 leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-700 text-xs text-dark-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.processing_time?.toFixed(2)}s
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {result.sources?.length || 0} sources
              </span>
              <span className="flex items-center gap-1 font-mono">
                {result.model_used}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sources */}
      {result.sources?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Sources ({result.sources.length})
          </h3>
          
          <div className="space-y-2">
            {result.sources.map((source, index) => (
              <SourceCard key={index} source={source} index={index} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function QueryPage() {
  const [queryText, setQueryText] = useState('');
  const [collectionName, setCollectionName] = useState('documents');
  const [topK, setTopK] = useState(5);
  const [showHistory, setShowHistory] = useState(false);
  
  const inputRef = useRef(null);
  
  const { query, querying, result, error, clearResult } = useDocumentQuery();
  const { collections } = useCollections();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!queryText.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    try {
      await query(queryText, { collectionName, topK });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Query failed');
    }
  };
  
  const handleSelectFromHistory = (text) => {
    setQueryText(text);
    setShowHistory(false);
    inputRef.current?.focus();
  };
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const suggestedQuestions = [
    "What is the total amount on this invoice?",
    "Summarize the key points of this document",
    "What are the main terms of the contract?",
    "List all the items mentioned",
  ];
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="font-display text-3xl font-bold text-dark-100">
          Query Documents
        </h1>
        <p className="text-dark-400 mt-2">
          Ask questions about your documents using natural language.
        </p>
      </motion.div>
      
      {/* Search form */}
      <motion.div variants={item}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main input */}
          <div className="relative">
            <div className="glass-card p-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-dark-500 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    className="flex-1 bg-transparent text-dark-100 placeholder-dark-500 
                               outline-none py-3 text-lg"
                    disabled={querying}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className={`
                      p-3 rounded-xl transition-colors
                      ${showHistory ? 'bg-accent-500/20 text-accent-400' : 'hover:bg-dark-700 text-dark-400'}
                    `}
                  >
                    <History className="w-5 h-5" />
                  </button>
                  
                  <button
                    type="submit"
                    disabled={querying || !queryText.trim()}
                    className="btn-primary py-3 px-6"
                  >
                    {querying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* History dropdown */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-card z-10"
                >
                  <QueryHistoryPanel
                    onSelectQuery={handleSelectFromHistory}
                    onClose={() => setShowHistory(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Options row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-dark-400">Collection:</label>
              <select
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-sm
                           text-dark-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
              >
                <option value="documents">documents</option>
                {collections?.filter(c => c.name !== 'documents').map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-dark-400">Sources:</label>
              <select
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-sm
                           text-dark-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
              >
                {[3, 5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            
            {result && (
              <button
                type="button"
                onClick={clearResult}
                className="text-sm text-dark-500 hover:text-dark-300 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear results
              </button>
            )}
          </div>
        </form>
      </motion.div>
      
      {/* Suggested questions (when no result) */}
      {!result && !querying && (
        <motion.div variants={item}>
          <p className="text-sm text-dark-500 mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => setQueryText(q)}
                className="px-4 py-2 bg-dark-800/50 hover:bg-dark-800 border border-dark-700 
                           rounded-full text-sm text-dark-300 hover:text-dark-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Loading state */}
      {querying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-accent-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full bg-accent-400/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <div className="text-center">
              <p className="font-medium text-dark-200">Searching documents...</p>
              <p className="text-sm text-dark-500 mt-1">
                Finding relevant context and generating answer
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Results */}
      {result && !querying && (
        <motion.div variants={item}>
          <AnswerDisplay result={result} />
        </motion.div>
      )}
      
      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl"
        >
          <p className="text-error-400">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
