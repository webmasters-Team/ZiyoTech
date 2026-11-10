import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Database,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  HelpCircle,
  Truck,
  RotateCcw,
  X
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeDocs, addKnowledgeDoc, deleteKnowledgeDoc } = usePlatform();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'faq' | 'delivery' | 'returns' | 'policy'>('faq');
  const [content, setContent] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addKnowledgeDoc({ title, category, content });
    setTitle('');
    setContent('');
    setIsAddOpen(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'delivery':
        return <Truck className="w-4 h-4 text-cyan-400" />;
      case 'returns':
        return <RotateCcw className="w-4 h-4 text-amber-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            <span>Knowledge Base (RAG Documents)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Verified policies, shipping rules, and FAQs referenced by ZiyoTech AI during customer dialogues.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Article</span>
        </button>
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {knowledgeDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold capitalize text-slate-300">
                  {getCategoryIcon(doc.category)}
                  <span>{doc.category} Document</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Updated: {doc.lastUpdated}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{doc.title}</h3>
              <p className="text-xs text-slate-300/85 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {doc.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active in Vector Memory
              </span>

              <button
                onClick={() => {
                  if (confirm(`Remove article "${doc.title}"?`)) {
                    deleteKnowledgeDoc(doc.id);
                  }
                }}
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                title="Remove Article"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#090d21] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Knowledge Base Article</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Samarqand va Buxoroga yetkazib berish"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="faq">Frequently Asked Questions (FAQ)</option>
                  <option value="delivery">Delivery Rates & Logistics</option>
                  <option value="returns">Returns & Exchange Policies</option>
                  <option value="policy">Payment & Company Policies</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Content / Policy Statement</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter exact terms and statements for the AI agent to follow..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save & Ingest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
