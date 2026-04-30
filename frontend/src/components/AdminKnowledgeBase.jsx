import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import {
  Upload, FileText, Trash2, AlertCircle, CheckCircle2, Loader2,
  BookOpen, File, X, CloudUpload
} from 'lucide-react';

export default function AdminKnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { type: 'success'|'error', msg: '' }
  const [deletingId, setDeletingId] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/chatbot/documents/');
      if (res.data.success) {
        setDocuments(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Upload handler
  const handleUpload = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['md', 'txt', 'pdf'].includes(ext)) {
      setUploadResult({ type: 'error', msg: `Unsupported file type ".${ext}". Use .md, .txt, or .pdf` });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/chatbot/upload-doc/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setUploadResult({
          type: 'success',
          msg: `"${file.name}" indexed successfully — ${res.data.data?.chunks_indexed || 0} chunks created.`,
        });
        fetchDocuments();
      } else {
        setUploadResult({ type: 'error', msg: res.data.msg || 'Upload failed.' });
      }
    } catch (err) {
      setUploadResult({
        type: 'error',
        msg: err.response?.data?.msg || 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async (docId) => {
    if (!confirm(`Delete document "${docId}" and all its chunks?`)) return;
    setDeletingId(docId);
    try {
      const res = await api.delete(`/chatbot/documents/${docId}/`);
      if (res.data.success) {
        setUploadResult({ type: 'success', msg: `Document "${docId}" deleted.` });
        fetchDocuments();
      } else {
        setUploadResult({ type: 'error', msg: res.data.msg || 'Delete failed.' });
      }
    } catch (err) {
      setUploadResult({ type: 'error', msg: 'Delete failed. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  // Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  // File icon based on extension
  const getFileIcon = (docId) => {
    if (docId.endsWith('.md') || docId.includes('knowledge')) return '📄';
    if (docId.endsWith('.pdf')) return '📕';
    return '📃';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Knowledge Base</h1>
            <p className="text-sm text-gray-500">Upload documents to power QuikrBot's AI responses</p>
          </div>
        </div>
      </div>

      {/* Alert */}
      {uploadResult && (
        <div
          className={`mb-6 flex items-start gap-3 p-4 rounded-xl border text-sm font-medium animate-fade-in ${
            uploadResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {uploadResult.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{uploadResult.msg}</span>
          <button onClick={() => setUploadResult(null)} className="shrink-0 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 mb-8 ${
          dragActive
            ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50/50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          type="file"
          accept=".md,.txt,.pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-sm font-semibold text-indigo-600">Processing & indexing document...</p>
            <p className="text-xs text-gray-400">This may take a moment for large files</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              dragActive
                ? 'bg-indigo-100 text-indigo-500 scale-110'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <CloudUpload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">
                {dragActive ? 'Drop your file here' : 'Drag & drop a document here'}
              </p>
              <p className="text-xs text-gray-400 mt-1">or click to browse · Supports .md, .txt, .pdf</p>
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100/50">
        <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4" />
          How it works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-indigo-700">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
            <span>Upload a knowledge document (.md, .txt, or .pdf) about your platform</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
            <span>The document is split into chunks and stored as vector embeddings (pgvector)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
            <span>QuikrBot retrieves relevant chunks to answer user questions accurately</span>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-gray-900">Indexed Documents</h2>
          </div>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-semibold text-gray-500">No documents indexed yet</p>
            <p className="text-xs mt-1">Upload your first knowledge document above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {documents.map((docId) => (
              <div
                key={docId}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="text-2xl">{getFileIcon(docId)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{docId}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Indexed in pgvector · Ready for RAG retrieval</p>
                </div>
                <button
                  onClick={() => handleDelete(docId)}
                  disabled={deletingId === docId}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title="Delete document"
                >
                  {deletingId === docId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
