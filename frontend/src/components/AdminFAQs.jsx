import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  HelpCircle, Plus, Edit3, Trash2, X, Check, Loader2,
  ToggleLeft, ToggleRight, Search, MessageSquare, AlertCircle
} from 'lucide-react';

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteModalFaq, setDeleteModalFaq] = useState(null);


  const [form, setForm] = useState({
    question: '',
    keywords: '',
    answer: '',
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chatbot/faqs/');
      if (res.data.success) setFaqs(res.data.data);
    } catch (err) {
      console.error('Failed to fetch FAQs', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setForm({ question: '', keywords: '', answer: '' });
    setShowModal(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      keywords: faq.keywords,
      answer: faq.answer,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.keywords.trim() || !form.answer.trim()) return;

    setSaving(true);
    try {
      if (editingFaq) {
        await api.put(`/chatbot/faqs/${editingFaq.id}/`, form);
      } else {
        await api.post('/chatbot/faqs/', form);
      }
      setShowModal(false);
      fetchFAQs();
    } catch (err) {
      console.error('Failed to save FAQ', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (faq) => {
    try {
      await api.put(`/chatbot/faqs/${faq.id}/`, { is_active: !faq.is_active });
      fetchFAQs();
    } catch (err) {
      console.error('Failed to toggle FAQ', err);
    }
  };

  const handleDelete = (faq) => {
    setDeleteModalFaq(faq);
  };

  const executeDelete = async () => {
    if (!deleteModalFaq) return;
    const faqId = deleteModalFaq.id;
    setDeleteModalFaq(null);
    try {
      await api.delete(`/chatbot/faqs/${faqId}/`);
      fetchFAQs();
    } catch (err) {
      console.error('Failed to delete FAQ', err);
    }
  };

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.keywords.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
            FAQ Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage chatbot FAQs — these are checked before calling the AI
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search FAQs by question or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-6">
        <div className="bg-indigo-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-bold text-indigo-700">{faqs.length} Total</span>
        </div>
        <div className="bg-emerald-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-emerald-700">{faqs.filter(f => f.is_active).length} Active</span>
        </div>
      </div>

      {/* FAQ List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <HelpCircle className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">
            {searchQuery ? 'No FAQs match your search' : 'No FAQs added yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Click "Add FAQ" to create your first entry</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md ${
                faq.is_active ? 'border-gray-100' : 'border-orange-200/60 bg-orange-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-gray-900 text-sm">{faq.question}</h3>
                    {!faq.is_active && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  
                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {faq.keywords.split(',').map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"
                      >
                        {kw.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Answer preview */}
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(faq)}
                    className={`p-2 rounded-lg transition-colors ${
                      faq.is_active
                        ? 'text-emerald-500 hover:bg-emerald-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={faq.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {faq.is_active ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create/Edit Modal ──────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Question</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g. How do I reset my password?"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Keywords</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder="e.g. reset password, forgot password, change password"
                  className="input-field"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">Comma-separated keywords the chatbot will match against</p>
              </div>

              <div>
                <label className="label">Answer</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="The bot will respond with this answer when keywords match..."
                  className="input-field min-h-[120px] resize-y"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">Supports markdown formatting (**bold**, *italic*, etc.)</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingFaq ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete FAQ Confirmation Modal */}
      {deleteModalFaq && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete FAQ?</h3>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete the FAQ <strong>"{deleteModalFaq.question}"</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalFaq(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
              >
                Yes, Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
