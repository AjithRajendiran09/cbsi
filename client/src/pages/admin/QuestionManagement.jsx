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
  X,
} from 'lucide-react';
import { DIMENSIONS } from '../../utils/constants';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDim, setSelectedDim] = useState('ALL');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    dimensionCode: 'LS',
    statementNumber: 41,
    order: 41,
  });
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/questions');
      setQuestions(res.data.data.questions);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleToggleStatus = async (questionId) => {
    try {
      setStatusLoading(true);
      await api.patch(`/admin/questions/${questionId}/status`);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update question status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/questions/${editingQuestion._id}`, {
        text: editingQuestion.text,
        order: editingQuestion.order,
        statementNumber: editingQuestion.statementNumber,
      });
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update question');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/questions', newQuestion);
      setIsAddModalOpen(false);
      setNewQuestion({
        text: '',
        dimensionCode: 'LS',
        statementNumber: questions.length + 1,
        order: questions.length + 1,
      });
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create question');
    }
  };

  const filteredQuestions =
    selectedDim === 'ALL'
      ? questions
      : questions.filter((q) => q.dimensionCode === selectedDim);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
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
          <h1 className="font-display text-2xl font-bold text-slate-900">
            CBSI Inventory Question Management
          </h1>
          <p className="text-xs text-slate-500">
            Review and configure the 40 standard behavioural statements (Version 1.0 Pilot)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Statement</span>
        </button>
      </div>

      {/* Dimension Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
        <button
          onClick={() => setSelectedDim('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedDim === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All (40 Items)
        </button>

        {DIMENSIONS.map((dim) => (
          <button
            key={dim.code}
            onClick={() => setSelectedDim(dim.code)}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
              selectedDim === dim.code
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{dim.code}</span>
            <span className="text-[10px] opacity-75">({dim.name})</span>
          </button>
        ))}
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading statements...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 w-16">No.</th>
                  <th className="px-4 py-3.5 w-24">Dimension</th>
                  <th className="px-6 py-3.5">Statement Text</th>
                  <th className="px-4 py-3.5 w-20">Order</th>
                  <th className="px-4 py-3.5 w-24">Status</th>
                  <th className="px-4 py-3.5 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-500">{q.statementNumber}</td>
                    <td className="px-4 py-3 font-bold text-blue-700">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[11px]">
                        {q.dimensionCode}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-900 font-medium leading-relaxed">
                      {q.text}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{q.order}</td>
                    <td className="px-4 py-3">
                      {q.active ? (
                        <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-[11px] inline-flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(q._id)}
                        className={`text-[11px] font-semibold ${
                          q.active ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                      >
                        {q.active ? 'Deactivate' : 'Activate'}
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
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Edit Statement #{editingQuestion.statementNumber}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Statement Text</label>
                <textarea
                  required
                  rows={3}
                  value={editingQuestion.text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, text: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statement Number</label>
                  <input
                    type="number"
                    value={editingQuestion.statementNumber}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        statementNumber: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingQuestion.order}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        order: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Inventory Statement</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dimension</label>
                <select
                  value={newQuestion.dimensionCode}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, dimensionCode: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {DIMENSIONS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} – {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Statement Text</label>
                <textarea
                  required
                  rows={3}
                  placeholder="I willingly take responsibility for..."
                  value={newQuestion.text}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, text: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statement Number</label>
                  <input
                    type="number"
                    value={newQuestion.statementNumber}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        statementNumber: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={newQuestion.order}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        order: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  Create Statement
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
