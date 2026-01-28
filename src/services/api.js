import axios from 'axios';

// Backend API base URL - direct connection, no nginx proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.10.35:8002';

// Create axios instance for /api/v1 endpoints
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 300000, // 5 minutes for large document processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==========================================
// Health & Status
// ==========================================

export const getHealth = async () => {
  // Health endpoint is at /health (not under /api/v1)
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
};

export const getDebugOllama = async () => {
  const response = await api.get('/debug/ollama');
  return response.data;
};

export const getDebugServices = async () => {
  const response = await api.get('/debug/services');
  return response.data;
};

export const getSystemConfig = async () => {
  const response = await api.get('/config');
  return response.data;
};

// ==========================================
// Document Processing
// ==========================================

export const processDocument = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.collectionName) {
    formData.append('collection_name', options.collectionName);
  }
  if (options.schemaTemplate) {
    formData.append('schema_template', options.schemaTemplate);
  }
  if (options.extractionSchema) {
    formData.append('extraction_schema', JSON.stringify(options.extractionSchema));
  }
  if (options.indexDocument !== undefined) {
    formData.append('index_document', options.indexDocument);
  }
  
  const response = await api.post('/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: options.onUploadProgress,
  });
  
  return response.data;
};

export const classifyDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/classify', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// ==========================================
// Document Querying
// ==========================================

export const queryDocuments = async (query, options = {}) => {
  const response = await api.post('/query', {
    query,
    collection_name: options.collectionName || 'documents',
    top_k: options.topK || 5,
    filter_metadata: options.filterMetadata,
    include_sources: options.includeSources !== false,
  });
  
  return response.data;
};

// ==========================================
// Collections
// ==========================================

export const getCollections = async () => {
  const response = await api.get('/collections');
  return response.data;
};

export const getCollectionInfo = async (collectionName) => {
  const response = await api.get(`/collections/${collectionName}`);
  return response.data;
};

export const deleteCollection = async (collectionName) => {
  const response = await api.delete(`/collections/${collectionName}`);
  return response.data;
};

// ==========================================
// Documents
// ==========================================

export const getDocuments = async (collectionName) => {
  const response = await api.get(`/documents/${collectionName}`);
  return response.data;
};

export const getDocument = async (collectionName, documentId) => {
  const response = await api.get(`/documents/${collectionName}/${documentId}`);
  return response.data;
};

export const deleteDocument = async (collectionName, documentId) => {
  const response = await api.delete(`/documents/${collectionName}/${documentId}`);
  return response.data;
};

// ==========================================
// Schema Templates
// ==========================================

export const getSchemaTemplates = async () => {
  const response = await api.get('/schemas');
  return response.data;
};

export default api;
