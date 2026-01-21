import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, FileText, Image, Loader2 } from 'lucide-react';

const fileTypeIcons = {
  'application/pdf': FileText,
  'image/jpeg': Image,
  'image/png': Image,
  'image/jpg': Image,
  default: File,
};

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileUpload({
  onFileSelect,
  accept = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  },
  maxSize = 100 * 1024 * 1024, // 100MB
  multiple = false,
  disabled = false,
  className = '',
}) {
  const [files, setFiles] = useState([]);
  
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      console.error('Rejected files:', rejectedFiles);
      return;
    }
    
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}`,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    
    if (multiple) {
      setFiles((prev) => [...prev, ...newFiles]);
      onFileSelect?.(acceptedFiles);
    } else {
      setFiles(newFiles);
      onFileSelect?.(acceptedFiles[0]);
    }
  }, [multiple, onFileSelect]);
  
  const removeFile = (id) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
    
    if (!multiple) {
      onFileSelect?.(null);
    }
  };
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled,
  });
  
  return (
    <div className={className}>
      {/* Dropzone */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive && !isDragReject
            ? 'border-accent-400 bg-accent-500/10'
            : isDragReject
            ? 'border-error-400 bg-error-500/10'
            : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center gap-4"
        >
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center
            ${isDragActive ? 'bg-accent-500/20' : 'bg-dark-800'}
          `}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-accent-400' : 'text-dark-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-dark-200">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-dark-500 mt-1">
              or <span className="text-accent-400 hover:underline">browse</span> to select
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-dark-500">
            <span className="px-2 py-1 bg-dark-800 rounded">PDF</span>
            <span className="px-2 py-1 bg-dark-800 rounded">JPEG</span>
            <span className="px-2 py-1 bg-dark-800 rounded">PNG</span>
            <span className="px-2 py-1 bg-dark-800 rounded">Max {formatFileSize(maxSize)}</span>
          </div>
        </motion.div>
        
        {/* Animated border on drag */}
        {isDragActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        )}
      </motion.div>
      
      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map(({ file, id, preview }) => {
              const Icon = fileTypeIcons[file.type] || fileTypeIcons.default;
              
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl border border-dark-700"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-dark-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-200 truncate">{file.name}</p>
                    <p className="text-xs text-dark-500">{formatFileSize(file.size)}</p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(id);
                    }}
                    className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-dark-400 hover:text-error-400" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Progress variant for showing upload/processing progress
export function FileUploadProgress({ file, progress, status, onCancel }) {
  const Icon = fileTypeIcons[file?.type] || fileTypeIcons.default;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-dark-800/50 rounded-xl border border-dark-700"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center">
          {status === 'processing' ? (
            <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
          ) : (
            <Icon className="w-6 h-6 text-dark-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark-200 truncate">{file?.name}</p>
          <p className="text-xs text-dark-500 capitalize">{status}</p>
        </div>
        
        {status !== 'complete' && onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-dark-400 hover:text-error-400" />
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-500 to-cyan-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <p className="mt-2 text-xs text-dark-500 text-right">{progress}%</p>
    </motion.div>
  );
}
