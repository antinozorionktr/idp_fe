import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { useAppStore } from '../services/store';

// Hook for system health monitoring
export function useSystemHealth(pollInterval = 30000) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { systemStatus, setSystemStatus } = useAppStore();
  
  const fetchHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setSystemStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSystemStatus({ status: 'error', error: err.message });
    } finally {
      setLoading(false);
    }
  }, [setSystemStatus]);
  
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, pollInterval);
    return () => clearInterval(interval);
  }, [fetchHealth, pollInterval]);
  
  return { health: systemStatus, loading, error, refetch: fetchHealth };
}

// Hook for collections
export function useCollections() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { collections, setCollections } = useAppStore();
  
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCollections();
      setCollections(data.collections || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setCollections]);
  
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);
  
  return { collections, loading, error, refetch: fetchCollections };
}

// Hook for documents in a collection
export function useDocuments(collectionName) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchDocuments = useCallback(async () => {
    if (!collectionName) return;
    
    setLoading(true);
    try {
      const data = await api.getDocuments(collectionName);
      setDocuments(data.documents || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  return { documents, loading, error, refetch: fetchDocuments };
}

// Hook for document processing
export function useDocumentProcessor() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const processDocument = useCallback(async (file, options = {}) => {
    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);
    
    try {
      const data = await api.processDocument(file, {
        ...options,
        onUploadProgress: (progressEvent) => {
          const uploadProgress = Math.round(
            (progressEvent.loaded * 50) / progressEvent.total
          );
          setProgress(uploadProgress);
        },
      });
      
      setProgress(100);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setProcessing(false);
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);
  
  return { processDocument, processing, progress, result, error, reset };
}

// Hook for document querying
export function useDocumentQuery() {
  const [querying, setQuerying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { addToQueryHistory } = useAppStore();
  
  const query = useCallback(async (queryText, options = {}) => {
    setQuerying(true);
    setError(null);
    
    try {
      const data = await api.queryDocuments(queryText, options);
      setResult(data);
      
      // Add to history
      addToQueryHistory({
        query: queryText,
        answer: data.answer,
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
        collection: options.collectionName || 'documents',
      });
      
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setQuerying(false);
    }
  }, [addToQueryHistory]);
  
  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);
  
  return { query, querying, result, error, clearResult };
}

// Hook for schema templates
export function useSchemaTemplates() {
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await api.getSchemaTemplates();
        setTemplates(data.schemas || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  return { templates, templateNames: Object.keys(templates), loading, error };
}

// Debounce hook
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
