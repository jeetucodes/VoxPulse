import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload } from 'lucide-react';
import { Clay3DIcon } from './Clay3DIcon';
import type { AnalysisResult } from '../types/speech';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  onImportJson: (importedResult: any) => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen,
  onClose,
  result,
  onImportJson
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  if (!isOpen) return null;

  const contractJson = result
    ? {
        overall_score: result.overall_score,
        flaws: result.flaws.map(f => ({
          type: f.type,
          start: f.start,
          end: f.end,
          severity: f.severity,
          explanation: f.explanation,
          improvement: f.improvement
        }))
      }
    : {};

  const jsonString = JSON.stringify(contractJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech_analytics_contract_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDoImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importText);
      if (typeof parsed.overall_score !== 'number' || !Array.isArray(parsed.flaws)) {
        throw new Error("Invalid format. Expected JSON must include 'overall_score' and 'flaws' array.");
      }
      onImportJson(parsed);
      onClose();
    } catch (e: any) {
      setImportError(e.message || 'Failed to parse JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl card-clay border border-white/95 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clay3DIcon name="document" size="sm" withPedestal floating />
            <div>
              <h3 className="text-lg font-black text-slate-900 font-heading tracking-tight">
                Data Contract (PRD Section 8 Specification)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Standard JSON schema for interoperable pipelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: Export vs Import */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-violet-600 bg-white text-violet-700 shadow-sm -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Export Active Results
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-violet-600 bg-white text-violet-700 shadow-sm -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Import External Python / Model JSON
          </button>
        </div>

        {/* Tab 1: Export View */}
        {activeTab === 'export' && (
          <div className="p-6 flex-1 flex flex-col overflow-hidden space-y-4">
            <p className="text-xs text-slate-500 font-normal">
              This payload conforms to the Contrastive Speech Analytics output schema, interoperable with browser analyzers and Python forced alignment pipelines.
            </p>

            <div className="relative flex-1 bg-slate-900 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-emerald-400 font-medium shadow-inner">
              <pre>{jsonString}</pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCopy}
                className="btn-clay-secondary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="btn-clay-primary flex items-center gap-1.5 px-5 py-2 text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Download .JSON</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Import View */}
        {activeTab === 'import' && (
          <div className="p-6 flex-1 flex flex-col space-y-4">
            <p className="text-xs text-slate-500 font-normal">
              Paste JSON generated by your Python pipeline or forced-alignment script to render temporal flaw grounding in the UI.
            </p>

            <textarea
              rows={10}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`{\n  "overall_score": 75,\n  "flaws": [\n    {\n      "type": "fast_speech",\n      "start": 2.5,\n      "end": 6.0,\n      "severity": "high",\n      "explanation": "Speech accelerated past 190 WPM.",\n      "improvement": "Add pauses between points."\n    }\n  ]\n}`}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 shadow-inner"
            />

            {importError && (
              <div className="text-xs text-pink-700 bg-pink-50 border border-pink-200 p-3 rounded-xl font-medium">
                {importError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleDoImport}
                disabled={!importText.trim()}
                className="btn-clay-primary flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold disabled:opacity-40"
              >
                <Upload className="w-4 h-4" />
                <span>Load and Render Analysis</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
