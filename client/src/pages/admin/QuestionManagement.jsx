import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Save,
  Trash2,
  Search,
  X,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DIMENSIONS } from '../../utils/constants';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDim, setSelectedDim] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    dimensionCode: 'LS',
    statementNumber: 41,
    order: 41,
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/questions');
      setQuestions(res.data.data.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
      // Fallback to public endpoint if admin endpoint fails
      try {
        const fallback = await api.get('/questions');
        setQuestions(fallback.data.data.questions || []);
      } catch (fallbackErr) {
        console.error('Fallback load questions also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const openAddModal = () => {
    const maxStmt = questions.reduce(
      (max, q) => Math.max(max, q.statementNumber || 0),
      0
    );
    const maxOrd = questions.reduce((max, q) => Math.max(max, q.order || 0), 0);
    setNewQuestion({
      text: '',
      dimensionCode: selectedDim !== 'ALL' ? selectedDim : 'LS',
      statementNumber: maxStmt + 1,
      order: maxOrd + 1,
    });
    setIsAddModalOpen(true);
  };

  const handleToggleStatus = async (questionId) => {
    try {
      setActionLoadingId(questionId);
      await api.patch(`/admin/questions/${questionId}/status`);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update question status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete Statement #${question.statementNumber}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(question._id);
      await api.delete(`/admin/questions/${question._id}`);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingQuestion.text.trim()) {
      alert('Question text cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/admin/questions/${editingQuestion._id}`, {
        text: editingQuestion.text.trim(),
        dimensionCode: editingQuestion.dimensionCode,
        order: Number(editingQuestion.order),
        statementNumber: Number(editingQuestion.statementNumber),
      });
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.text.trim()) {
      alert('Statement text is required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/admin/questions', {
        text: newQuestion.text.trim(),
        dimensionCode: newQuestion.dimensionCode,
        statementNumber: Number(newQuestion.statementNumber),
        order: Number(newQuestion.order),
      });
      setIsAddModalOpen(false);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create statement');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    // Dimension filter
    if (selectedDim !== 'ALL' && q.dimensionCode !== selectedDim) {
      return false;
    }
    // Status filter
    if (statusFilter === 'ACTIVE' && !q.active) {
      return false;
    }
    if (statusFilter === 'INACTIVE' && q.active) {
      return false;
    }
    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchText = (q.text || '').toLowerCase().includes(term);
      const matchNum = String(q.statementNumber || '').includes(term);
      const matchDim = (q.dimensionCode || '').toLowerCase().includes(term);
      if (!matchText && !matchNum && !matchDim) {
        return false;
      }
    }
    return true;
  });

  // Calculate counts
  const totalCount = questions.length;
  const activeCount = questions.filter((q) => q.active).length;
  const inactiveCount = totalCount - activeCount;

  const countByDim = (dimCode) =>
    questions.filter((q) => q.dimensionCode === dimCode).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Console</span>
          </Link>
          <div className="flex items-center space-x-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              CBSI Inventory Question Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {totalCount} Questions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Add new behavioural statements, edit wording or dimensions, reorder, and configure active status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchQuestions}
            title="Refresh questions"
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/students"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            View Student Marks
          </Link>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Statement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards / Dimensions Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Inventory
          </span>
          <p className="text-xl font-display font-black text-slate-900 mt-0.5">{totalCount}</p>
          <span className="text-[10px] text-slate-500">
            {activeCount} Active • {inactiveCount} Inactive
          </span>
        </div>

        {DIMENSIONS.map((d) => {
          const c = countByDim(d.code);
          return (
            <div
              key={d.code}
              onClick={() => setSelectedDim(selectedDim === d.code ? 'ALL' : d.code)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedDim === d.code
                  ? 'bg-blue-50 border-blue-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-700">{d.code}</span>
                <span className="text-[10px] text-slate-400 font-bold">{c} items</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-800 truncate mt-1" title={d.name}>
                {d.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search statement text or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Dimension & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold w-full md:w-auto justify-end">
          {/* Status filter pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors text-[11px] ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg transition-colors text-[11px] ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1 rounded-lg transition-colors text-[11px] ${
                statusFilter === 'INACTIVE'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>

          {(selectedDim !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedDim('ALL');
                setStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Dimension Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
        <button
          onClick={() => setSelectedDim('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedDim === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Dimensions ({totalCount})
        </button>

        {DIMENSIONS.map((dim) => (
          <button
            key={dim.code}
            onClick={() => setSelectedDim(dim.code)}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
              selectedDim === dim.code
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{dim.code}</span>
            <span className="text-[10px] opacity-80">({countByDim(dim.code)})</span>
          </button>
        ))}
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading statements...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">
            No statements found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 w-16">No.</th>
                  <th className="px-4 py-3.5 w-36">Dimension</th>
                  <th className="px-6 py-3.5">Statement Text</th>
                  <th className="px-4 py-3.5 w-20 text-center">Order</th>
                  <th className="px-4 py-3.5 w-28 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Statement Number */}
                    <td className="px-4 py-3.5 font-bold text-slate-500">
                      #{q.statementNumber}
                    </td>

                    {/* Dimension */}
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-[11px] inline-flex items-center space-x-1">
                        <span>{q.dimensionCode}</span>
                        <span className="text-[10px] text-blue-500 font-normal">
                          ({q.dimension?.name || q.dimensionCode})
                        </span>
                      </span>
                    </td>

                    {/* Statement Text */}
                    <td className="px-6 py-3.5 text-slate-900 font-medium leading-relaxed">
                      {q.text}
                    </td>

                    {/* Display Order */}
                    <td className="px-4 py-3.5 text-center font-mono text-slate-500">
                      {q.order}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      {q.active ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      {/* Edit */}
                      <button
                        onClick={() => setEditingQuestion({ ...q })}
                        className="text-blue-600 hover:text-blue-800 font-bold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>

                      {/* Toggle status */}
                      <button
                        onClick={() => handleToggleStatus(q._id)}
                        disabled={actionLoadingId === q._id}
                        className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                          q.active
                            ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                            : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        {q.active ? 'Deactivate' : 'Activate'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteQuestion(q)}
                        disabled={actionLoadingId === q._id}
                        title="Delete question"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Edit Statement #{editingQuestion.statementNumber}
                </h3>
                <p className="text-xs text-slate-500">Update statement wording, dimension, or ordering</p>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Dimension selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Dimension</label>
                <select
                  value={editingQuestion.dimensionCode}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, dimensionCode: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  {DIMENSIONS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} – {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statement Text */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Statement Text</label>
                <textarea
                  required
                  rows={4}
                  value={editingQuestion.text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, text: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 leading-relaxed"
                />
              </div>

              {/* Statement Number and Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statement Number</label>
                  <input
                    type="number"
                    min="1"
                    value={editingQuestion.statementNumber}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        statementNumber: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editingQuestion.order}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        order: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Statement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Add New Inventory Statement
                </h3>
                <p className="text-xs text-slate-500">
                  Create a new behavioural statement in the CBSI pilot inventory
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              {/* Dimension select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Dimension</label>
                <select
                  value={newQuestion.dimensionCode}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, dimensionCode: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  {DIMENSIONS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} – {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statement text */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Statement Text</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g., I consistently plan my tasks systematically before taking action..."
                  value={newQuestion.text}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, text: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 leading-relaxed"
                />
              </div>

              {/* Statement number and Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statement Number</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuestion.statementNumber}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        statementNumber: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuestion.order}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        order: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Create Statement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
