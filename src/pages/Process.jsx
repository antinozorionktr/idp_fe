import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Settings2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Eye,
  Layers,
  Brain,
  ArrowRight,
  Download,
  Copy,
  RefreshCw,
} from 'lucide-react';
import FileUpload, { FileUploadProgress } from '../components/FileUpload';
import { useDocumentProcessor, useSchemaTemplates, useCollections } from '../hooks/useApi';
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

function ProcessingPipeline({ currentStep }) {
  const steps = [
    { id: 'upload', label: 'Upload', icon: FileText },
    { id: 'vision', label: 'Vision', icon: Eye, description: 'Extracting content' },
    { id: 'embed', label: 'Embedding', icon: Layers, description: 'Creating vectors' },
    { id: 'index', label: 'Indexing', icon: Brain, description: 'Storing in Qdrant' },
  ];
  
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${isComplete ? 'bg-success-500/20' : isCurrent ? 'bg-accent-500/20' : 'bg-dark-800'}
                `}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-success-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
                ) : (
                  <Icon className="w-6 h-6 text-dark-500" />
                )}
              </motion.div>
              <span className={`
                mt-2 text-sm font-medium
                ${isComplete ? 'text-success-400' : isCurrent ? 'text-accent-400' : 'text-dark-500'}
              `}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-2
                ${index < currentIndex ? 'bg-success-400' : 'bg-dark-700'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResultsPanel({ result, onReset }) {
  const [showRaw, setShowRaw] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result.extracted_data, null, 2));
    toast.success('Copied to clipboard!');
  };
  
  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result.extracted_data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.document_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Success header */}
      <div className="p-6 bg-success-500/10 border-b border-success-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100">Processing Complete</h3>
              <p className="text-sm text-dark-400">
                Document ID: <span className="font-mono text-accent-400">{result.document_id.slice(0, 8)}...</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={onReset}
            className="btn-secondary py-2"
          >
            <RefreshCw className="w-4 h-4" />
            Process Another
          </button>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-dark-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-dark-100">{result.num_pages}</p>
          <p className="text-sm text-dark-500">Pages</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-dark-100">{result.chunks_stored}</p>
          <p className="text-sm text-dark-500">Chunks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-dark-100">{result.metrics?.total_time?.toFixed(2)}s</p>
          <p className="text-sm text-dark-500">Total Time</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-dark-100">{result.metrics?.vision_time?.toFixed(2)}s</p>
          <p className="text-sm text-dark-500">Vision Time</p>
        </div>
      </div>
      
      {/* Extracted data */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-dark-200">Extracted Data</h4>
          <div className="flex items-center gap-2">
            <button onClick={copyToClipboard} className="btn-ghost text-sm">
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button onClick={downloadJson} className="btn-ghost text-sm">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
        
        {/* Key-value pairs */}
        {result.extracted_data?.key_value_pairs && 
         Object.keys(result.extracted_data.key_value_pairs).length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-dark-400 mb-3">Key Information</h5>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(result.extracted_data.key_value_pairs).map(([key, value]) => (
                <div key={key} className="flex justify-between p-3 bg-dark-800/50 rounded-lg">
                  <span className="text-dark-400 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-dark-100 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tables */}
        {result.extracted_data?.tables?.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-dark-400 mb-3">
              Tables ({result.extracted_data.tables.length})
            </h5>
            {result.extracted_data.tables.map((table, idx) => (
              <div key={idx} className="mb-4 overflow-x-auto">
                {table.title && (
                  <p className="text-sm text-dark-300 mb-2">{table.title}</p>
                )}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700">
                      {table.headers?.map((header, i) => (
                        <th key={i} className="px-3 py-2 text-left text-dark-400 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows?.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-dark-800">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-dark-200">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {table.rows?.length > 5 && (
                  <p className="text-xs text-dark-500 mt-2">
                    Showing 5 of {table.rows.length} rows
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Raw JSON toggle */}
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showRaw ? 'rotate-180' : ''}`} />
          {showRaw ? 'Hide' : 'Show'} Raw JSON
        </button>
        
        <AnimatePresence>
          {showRaw && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <pre className="mt-4 p-4 bg-dark-900 rounded-xl overflow-x-auto text-xs text-dark-300">
                {JSON.stringify(result.extracted_data, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ProcessPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [collectionName, setCollectionName] = useState('documents');
  const [schemaTemplate, setSchemaTemplate] = useState('');
  const [indexDocument, setIndexDocument] = useState(true);
  const [currentStep, setCurrentStep] = useState('upload');
  
  const { processDocument, processing, progress, result, error, reset } = useDocumentProcessor();
  const { templates, templateNames } = useSchemaTemplates();
  const { collections } = useCollections();
  
  const handleProcess = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    try {
      setCurrentStep('vision');
      
      // Simulate step progression
      setTimeout(() => setCurrentStep('embed'), 2000);
      setTimeout(() => setCurrentStep('index'), 4000);
      
      await processDocument(selectedFile, {
        collectionName,
        schemaTemplate: schemaTemplate || undefined,
        indexDocument,
      });
      
      setCurrentStep('complete');
      toast.success('Document processed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Processing failed');
      setCurrentStep('upload');
    }
  };
  
  const handleReset = () => {
    reset();
    setSelectedFile(null);
    setCurrentStep('upload');
  };
  
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
          Process Document
        </h1>
        <p className="text-dark-400 mt-2">
          Upload PDFs or images to extract structured data using AI vision models.
        </p>
      </motion.div>
      
      {/* Show results if complete */}
      {result && <ResultsPanel result={result} onReset={handleReset} />}
      
      {/* Processing UI */}
      {!result && (
        <>
          {/* Pipeline visualization */}
          {processing && (
            <motion.div variants={item} className="glass-card p-6">
              <ProcessingPipeline currentStep={currentStep} />
            </motion.div>
          )}
          
          {/* Upload area */}
          {!processing && (
            <motion.div variants={item}>
              <FileUpload
                onFileSelect={setSelectedFile}
                disabled={processing}
              />
            </motion.div>
          )}
          
          {/* Processing progress */}
          {processing && selectedFile && (
            <motion.div variants={item}>
              <FileUploadProgress
                file={selectedFile}
                progress={progress}
                status="processing"
              />
            </motion.div>
          )}
          
          {/* Configuration */}
          {!processing && selectedFile && (
            <motion.div variants={item} className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings2 className="w-5 h-5 text-accent-400" />
                <h3 className="font-semibold text-dark-100">Processing Options</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Collection */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Collection
                  </label>
                  <select
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    className="input-field"
                  >
                    <option value="documents">documents (default)</option>
                    {collections?.filter(c => c.name !== 'documents').map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-dark-500 mt-1">
                    Or type a new collection name
                  </p>
                </div>
                
                {/* Schema template */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Schema Template
                  </label>
                  <select
                    value={schemaTemplate}
                    onChange={(e) => setSchemaTemplate(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Auto-detect</option>
                    {templateNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-dark-500 mt-1">
                    Use a predefined extraction schema
                  </p>
                </div>
              </div>
              
              {/* Index toggle */}
              <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                <div>
                  <p className="font-medium text-dark-200">Index for RAG</p>
                  <p className="text-sm text-dark-500">Store document for semantic search</p>
                </div>
                <button
                  onClick={() => setIndexDocument(!indexDocument)}
                  className={`
                    relative w-12 h-7 rounded-full transition-colors
                    ${indexDocument ? 'bg-accent-500' : 'bg-dark-600'}
                  `}
                >
                  <motion.div
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
                    animate={{ left: indexDocument ? '26px' : '4px' }}
                  />
                </button>
              </div>
              
              {/* Process button */}
              <button
                onClick={handleProcess}
                disabled={processing}
                className="btn-primary w-full py-4 text-lg"
              >
                <Sparkles className="w-5 h-5" />
                Process Document
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
          
          {/* Error display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-error-400">Processing Failed</p>
                <p className="text-sm text-dark-400 mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
