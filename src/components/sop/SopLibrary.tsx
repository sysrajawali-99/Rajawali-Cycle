import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SopItem } from '../../types';

interface SopLibraryProps {
  sops: SopItem[];
}

export const SopLibrary: React.FC<SopLibraryProps> = ({ sops }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSop, setSelectedSop] = useState<SopItem | null>(sops[0] || null);

  const filteredSops = sops.filter((s) => {
    if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.steps.some((step) => step.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Pusat SOP & Panduan Standar Mutu Rajawali
            </h1>
            <p className="text-xs text-slate-400">
              Standar Operasional Prosedur kebersihan internasional, takaran chemical, dan panduan K3 lapangan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Sidebar: List & Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="space-y-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="sop-search-input"
                type="text"
                placeholder="Cari SOP / metode kerja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex space-x-1 overflow-x-auto pb-1 text-xs">
              {['ALL', 'Sanitasi', 'Floor Care', 'High Level', 'K3'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* SOP list items */}
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredSops.map((sop) => (
              <div
                key={sop.id}
                onClick={() => setSelectedSop(sop)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                  selectedSop?.id === sop.id
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {sop.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">v{sop.version}</span>
                </div>
                <h4 className="font-bold text-white text-xs leading-snug">{sop.title}</h4>
                <p className="text-slate-400 text-[11px] line-clamp-1">{sop.steps[0]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {selectedSop ? (
            <>
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-amber-400">{selectedSop.category}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Versi {selectedSop.version}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Update Terakhir: {selectedSop.lastUpdated}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedSop.title}</h2>
                </div>
              </div>

              {/* Chemical & APD requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Chemical & Takaran Rasio:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedSop.requiredChemicals || selectedSop.chemicalsUsed || []).map((chem, i) => (
                      <span
                        key={i}
                        className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 font-medium"
                      >
                        {chem}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>APD & Alat Keselamatan (K3):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedSop.requiredPPE || selectedSop.safetyEquipment || []).map((ppe, i) => (
                      <span
                        key={i}
                        className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 font-medium"
                      >
                        {ppe}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step by Step Execution Guide */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm">Tahapan Prosedur Kerja Standar (SOP):</h3>
                <div className="space-y-2.5">
                  {selectedSop.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex items-start space-x-3 text-xs"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs shadow-sm">
                        {idx + 1}
                      </span>
                      <div className="text-slate-200 leading-relaxed pt-0.5">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety notice */}
              <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl flex items-center space-x-3 text-xs text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  <b>Catatan K3:</b> Selalu pasang papan tanda "Caution Wet Floor" (Lantai Licin) di area kerja yang terlihat oleh publik.
                </span>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">
              Pilih salah satu SOP di sebelah kiri untuk melihat detail prosedur.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
