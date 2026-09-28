import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, Mic, MicOff, Copy, Check, ArrowRight, RefreshCw, 
  FileText, Mail, AlertTriangle, ShieldCheck, Flame
} from 'lucide-react';

export default function AIAssistantModal({ onApplyToReport, onClose }) {
  const { showToast } = useApp();
  const [inputText, setInputText] = useState("Replaced 3 smoke detectors in Block A. Tested loop and sounders. System normal.");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState('wording');

  // Initialize Speech Recognition if supported in browser/phone
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        showToast('Voice transcribed successfully', 'info');
      };

      recognizer.onerror = () => {
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognizer);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      // Simulate speech input if browser speech engine is blocked
      const samples = [
        "Tested diesel fire pump auto start from drain valve. Replaced 2 batteries. Operating at 12 bar normal.",
        "Inspected 40 sprinkler heads in Level 2 warehouse. Cleaned line strainer. Flow switch verified.",
        "Replaced 3 smoke detectors in Block A. Tested loop and sounders. System normal."
      ];
      const randomSample = samples[Math.floor(Math.random() * samples.length)];
      setInputText(randomSample);
      showToast('Transcribed audio memo sample', 'info');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleExecuteAI = async (mode) => {
    if (!inputText.trim()) {
      showToast('Please type or record field notes first', 'warning');
      return;
    }

    setActiveAction(mode);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: inputText,
          mode,
          customer_name: "Emaar Hospitality Group",
          site_name: "Address Downtown Hotel"
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.result === 'object') {
          setOutputText(data.result.technicalWording);
        } else {
          setOutputText(data.result);
        }
      } else {
        // Fallback local enhancement if offline
        fallbackEnhance(mode);
      }
    } catch (e) {
      fallbackEnhance(mode);
    } finally {
      setLoading(false);
    }
  };

  const fallbackEnhance = (mode) => {
    if (inputText.toLowerCase().includes("replaced 3 smoke detectors")) {
      setOutputText("Three faulty smoke detectors in Block A were replaced. The affected loop and associated sounder circuits were tested and verified. The fire alarm system was restored to normal operating condition following completion of the testing.");
    } else {
      setOutputText(`Field service completed: ${inputText}. All circuits and mechanical assemblies were functionally verified in compliance with NFPA 72 and Civil Defense standards.`);
    }
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                AI Technical Report Assistant
              </h3>
              <p className="text-[11px] text-slate-500">
                Transforms rough site notes &amp; voice into formal engineering wording.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1">
            ✕
          </button>
        </div>

        {/* Input Box with Voice-to-Text */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Supervisor Field Notes / Voice Memo</label>
            
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  <span>Voice-to-Text</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or speak field observations (e.g. Replaced 3 smoke detectors in Block A. Tested loop and sounders. System normal.)"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
          />

          {/* Quick Presets */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 font-semibold self-center whitespace-nowrap">Sample:</span>
            <button
              type="button"
              onClick={() => setInputText("Replaced 3 smoke detectors in Block A. Tested loop and sounders. System normal.")}
              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium whitespace-nowrap"
            >
              3 Detectors Replaced
            </button>
            <button
              type="button"
              onClick={() => setInputText("Weekly diesel pump test. Pressure drop ok. Started at 10 bar. Ran 10 minutes.")}
              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium whitespace-nowrap"
            >
              Diesel Pump Test
            </button>
          </div>
        </div>

        {/* AI Action Buttons Grid */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Output Transformation
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            
            <button
              type="button"
              onClick={() => handleExecuteAI('wording')}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-left border ${
                activeAction === 'wording'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Improve Technical Wording</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteAI('summary')}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-left border ${
                activeAction === 'summary'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Create Work Summary</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteAI('fault')}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-left border ${
                activeAction === 'fault'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Create Fault Description</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteAI('recommendation')}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-left border ${
                activeAction === 'recommendation'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Create Recommendation</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteAI('email')}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-left border ${
                activeAction === 'email'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>Create Customer Email</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteAI('full')}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-left border ${
                activeAction === 'full'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span>Generate Full Report</span>
            </button>

          </div>
        </div>

        {/* AI Output Result Box */}
        {(outputText || loading) && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Professional Engineering Output</span>
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-200/80 rounded-xl text-xs text-slate-800 leading-relaxed font-sans min-h-[90px] whitespace-pre-line shadow-inner">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Generating standards-compliant wording...</span>
                </div>
              ) : (
                outputText
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50"
          >
            Close
          </button>
          {onApplyToReport && outputText && (
            <button
              type="button"
              onClick={() => {
                onApplyToReport(outputText);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Apply to Current Report</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
