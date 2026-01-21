import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  FileText,
  Trash2,
  ChevronRight,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
  FolderOpen,
  Clock,
  Hash,
} from 'lucide-react';
import { useCollections, useDocuments } from '../hooks/useApi';
import * as api from '../services/api';
import { useAppStore } from '../services/store';
import toast from 'react-hot-toast';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function CollectionCard({ collection, isActive, onClick, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!confirm(`Delete collection "${collection.name}" and all its documents?`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await api.deleteCollection(collection.name);
      toast.success('Collection deleted');
      onDelete?.();
    } catch (err) {
      toast.error('Failed to delete collection');
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`
        glass-card-hover p-4 cursor-pointer
        ${isActive ? 'ring-2 ring-accent-500/50 bg-accent-500/5' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isActive ? 'bg-accent-500/20' : 'bg-dark-700'}
          `}>
            <Database className={`w-5 h-5 ${isActive ? 'text-accent-400' : 'text-dark-400'}`} />
          </div>
          
          <div>
            <h3 className="font-medium text-dark-200">{collection.name}</h3>
            <p className="text-sm text-dark-500">
              {collection.vectors_count || 0} chunks
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 hover:bg-dark-700 rounded-lg text-dark-500 hover:text-error-400 transition-colors"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
          <ChevronRight className={`w-5 h-5 text-dark-500 ${isActive ? 'text-accent-400' : ''}`} />
        </div>
      </div>
    </motion.div>
  );
}

function DocumentCard({ document, collectionName, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!confirm(`Delete document "${document.filename}"?`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await api.deleteDocument(collectionName, document.document_id);
      toast.success('Document deleted');
      onDelete?.();
    } catch (err) {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <motion.div
      variants={item}
      className="bg-dark-800/30 rounded-xl border border-dark-700 overflow-hidden"
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
            <FileText className="w-5 h-5 text-dark-400" />
          </div>
          
          <div>
            <h4 className="font-medium text-dark-200">{document.filename || 'Untitled'}</h4>
            <div className="flex items-center gap-3 text-xs text-dark-500">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {document.chunk_count} chunks
              </span>
              {document.indexed_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(document.indexed_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 hover:bg-dark-700 rounded-lg text-dark-500 hover:text-error-400 transition-colors"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-dark-700"
          >
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-500">Document ID</span>
                <span className="text-dark-300 font-mono text-xs">
                  {document.document_id}
                </span>
              </div>
              {document.num_pages && (
                <div className="flex justify-between">
                  <span className="text-dark-500">Pages</span>
                  <span className="text-dark-300">{document.num_pages}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-dark-500" />
      </div>
      <h3 className="font-medium text-dark-300">{title}</h3>
      <p className="text-sm text-dark-500 mt-1">{description}</p>
    </div>
  );
}

export default function CollectionsPage() {
  const { collections, loading: collectionsLoading, refetch: refetchCollections } = useCollections();
  const { activeCollection, setActiveCollection } = useAppStore();
  const { documents, loading: documentsLoading, refetch: refetchDocuments } = useDocuments(activeCollection);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDocuments = documents?.filter(doc =>
    doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const handleRefresh = () => {
    refetchCollections();
    refetchDocuments();
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark-100">
            Collections
          </h1>
          <p className="text-dark-400 mt-2">
            Manage your document collections and indexed files.
          </p>
        </div>
        
        <button onClick={handleRefresh} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Collections list */}
        <motion.div variants={item} className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-dark-200 flex items-center gap-2">
            <Database className="w-5 h-5 text-accent-400" />
            Collections ({collections?.length || 0})
          </h2>
          
          {collectionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
            </div>
          ) : collections?.length === 0 ? (
            <EmptyState
              title="No collections"
              description="Process documents to create collections"
              icon={FolderOpen}
            />
          ) : (
            <motion.div variants={container} className="space-y-2">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.name}
                  collection={collection}
                  isActive={activeCollection === collection.name}
                  onClick={() => setActiveCollection(collection.name)}
                  onDelete={refetchCollections}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
        
        {/* Documents list */}
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-400" />
              Documents in "{activeCollection}"
            </h2>
            
            <span className="text-sm text-dark-500">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="input-field pl-10"
            />
          </div>
          
          {/* Documents grid */}
          {documentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <EmptyState
              title={searchTerm ? "No matches" : "No documents"}
              description={searchTerm 
                ? "Try a different search term" 
                : "Process documents to add them to this collection"
              }
              icon={FileText}
            />
          ) : (
            <motion.div variants={container} className="space-y-2">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.document_id}
                  document={document}
                  collectionName={activeCollection}
                  onDelete={refetchDocuments}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
