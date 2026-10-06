import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { isSupabaseConfigured } from '../../services/supabase';
import { DIMENSIONS } from '../../utils/constants';
import { ArrowLeft, Edit2, Layers, CheckCircle2 } from 'lucide-react';

const DimensionManagement = () => {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDim, setEditingDim] = useState(null);

  const fetchDimensions = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        setDimensions(DIMENSIONS.map((d, idx) => ({
          _id: d.code,
          code: d.code,
          name: d.name,
          description: d.description,
          order: idx + 1,
          maxScore: 24,
        })));
        return;
      }
      const res = await api.get('/dimensions');
      setDimensions(res.data.data.dimensions);
    } catch (err) {
      console.error('Failed to load dimensions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDimensions();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/dimensions/${editingDim._id}`, {
        name: editingDim.name,
        description: editingDim.description,
        order: editingDim.order,
      });
      setEditingDim(null);
      fetchDimensions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update dimension');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Console</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            CBSI Behavioural Dimensions
          </h1>
          <p className="text-xs text-slate-500">
            Configure the 5 core behavioural dimensions and interpretation rules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dimensions.map((d) => (
          <div
            key={d._id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center text-sm">
                  {d.code}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{d.name}</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Order: {d.order} • Max Score: {d.maxScore}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingDim(d)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {d.description}
            </p>

            {/* Interpretation Rules List */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Interpretation Thresholds
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                {d.interpretationRules?.map((rule) => (
                  <div key={rule.label} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800 block">{rule.label}</span>
                    <span className="text-slate-500">{rule.min}–{rule.max} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dimension Modal */}
      {editingDim && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-xl text-xs">
            <h3 className="font-bold text-base text-slate-900">
              Edit Dimension: {editingDim.code}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dimension Name</label>
                <input
                  type="text"
                  required
                  value={editingDim.name}
                  onChange={(e) => setEditingDim({ ...editingDim, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={editingDim.description}
                  onChange={(e) =>
                    setEditingDim({ ...editingDim, description: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={editingDim.order}
                  onChange={(e) =>
                    setEditingDim({ ...editingDim, order: Number(e.target.value) })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingDim(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
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
    </div>
  );
};

export default DimensionManagement;
